package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"golang.org/x/crypto/argon2"
)

var (
	ErrInvalidHash         = errors.New("the encoded hash is not in the correct format")
	ErrIncompatibleVersion = errors.New("incompatible version of argon2")
)

// argon2id params
const (
	format  = "$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s"
	time    = 1
	memory  = 64 * 1024
	threads = 4
	keyLen  = 32
	saltLen = 16
)

// HashPassword hashes a password using Argon2id with recommended parameters.
func HashPassword(password string) (string, error) {
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLen)

	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	encodedHash := fmt.Sprintf(format, argon2.Version, memory, time, threads, b64Salt, b64Hash)
	return encodedHash, nil
}

// VerifyPassword verifies a password against an Argon2id encoded hash string.
func VerifyPassword(encodedHash, password string) (bool, error) {
	vals := strings.Split(encodedHash, "$")
	if len(vals) != 6 {
		return false, ErrInvalidHash
	}
	if vals[1] != "argon2id" {
		return false, ErrInvalidHash
	}

	var version int
	_, err := fmt.Sscanf(vals[2], "v=%d", &version)
	if err != nil {
		return false, err
	}
	if version != argon2.Version {
		return false, ErrIncompatibleVersion
	}

	var mem, t, p uint32
	_, err = fmt.Sscanf(vals[3], "m=%d,t=%d,p=%d", &mem, &t, &p)
	if err != nil {
		return false, err
	}

	salt, err := base64.RawStdEncoding.Strict().DecodeString(vals[4])
	if err != nil {
		return false, err
	}

	hash, err := base64.RawStdEncoding.Strict().DecodeString(vals[5])
	if err != nil {
		return false, err
	}

	otherHash := argon2.IDKey([]byte(password), salt, t, mem, uint8(p), uint32(len(hash)))

	if subtle.ConstantTimeCompare(hash, otherHash) == 1 {
		return true, nil
	}
	return false, nil
}

// GenerateSessionToken creates a random 32-byte hex token.
func GenerateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// NewSessionCookie returns an HTTP-only cookie for the session token.
func NewSessionCookie(token string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     "eunomia_session",
		Value:    token,
		Path:     "/api",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   false, // set to true in prod with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
}
