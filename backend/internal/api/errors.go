// Package api provides HTTP handlers, middleware, and routing for the Eunomia API.
package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

// ErrorCode is a machine-readable error classification string.
type ErrorCode string

const (
	ErrCodeInternal       ErrorCode = "INTERNAL_ERROR"
	ErrCodeNotFound       ErrorCode = "NOT_FOUND"
	ErrCodeValidation     ErrorCode = "VALIDATION_ERROR"
	ErrCodeUnauthorized   ErrorCode = "UNAUTHORIZED"
	ErrCodeForbidden      ErrorCode = "FORBIDDEN"
	ErrCodeConflict       ErrorCode = "CONFLICT"
	ErrCodeBadRequest     ErrorCode = "BAD_REQUEST"
	ErrCodeServiceUnavail ErrorCode = "SERVICE_UNAVAILABLE"
)

// ErrorDetail holds the structured error payload.
type ErrorDetail struct {
	Code    ErrorCode              `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// ErrorResponse is the top-level JSON error envelope.
type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

// WriteJSON writes a JSON response with the given status code.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		slog.Error("failed to encode JSON response", "error", err)
	}
}

// WriteError writes a structured error response.
func WriteError(w http.ResponseWriter, status int, code ErrorCode, message string) {
	WriteJSON(w, status, ErrorResponse{
		Error: ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}

// WriteValidationError writes a structured validation error with field-level details.
func WriteValidationError(w http.ResponseWriter, message string, details map[string]interface{}) {
	WriteJSON(w, http.StatusUnprocessableEntity, ErrorResponse{
		Error: ErrorDetail{
			Code:    ErrCodeValidation,
			Message: message,
			Details: details,
		},
	})
}

// WriteNotFound writes a 404 Not Found error response.
func WriteNotFound(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusNotFound, ErrCodeNotFound, message)
}

// WriteUnauthorized writes a 401 Unauthorized error response.
func WriteUnauthorized(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusUnauthorized, ErrCodeUnauthorized, message)
}

// WriteInternalError writes a 500 Internal Server Error response.
// The actual error is logged server-side but not exposed to the client.
func WriteInternalError(w http.ResponseWriter, err error) {
	slog.Error("internal server error", "error", err)
	WriteError(w, http.StatusInternalServerError, ErrCodeInternal, "An internal error occurred.")
}
