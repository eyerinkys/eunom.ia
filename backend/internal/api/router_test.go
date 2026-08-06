package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestVersionsRouteMatching(t *testing.T) {
	r := NewRouter(nil, "*", nil)

	req, _ := http.NewRequest("GET", "/api/files/test-node-id/versions", nil)
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)

	if rr.Code == http.StatusNotFound {
		t.Fatalf("Route matched to 404 Not Found instead of hitting RequireAuth middleware")
	}

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized from RequireAuth, got %d", rr.Code)
	}
}
