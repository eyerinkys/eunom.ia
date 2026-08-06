package api

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// NewRouter creates the Chi router with all middleware and routes mounted.
func NewRouter(db *sql.DB, corsOrigin string, logger *slog.Logger) http.Handler {
	r := chi.NewRouter()

	// --- Middleware stack ---

	// Request ID must be first so all downstream middleware and handlers can reference it.
	r.Use(RequestID)

	// Built-in Chi middleware for panic recovery.
	r.Use(chimiddleware.Recoverer)

	// Real IP extraction (respects X-Forwarded-For, X-Real-IP).
	r.Use(chimiddleware.RealIP)

	// Structured request logging.
	r.Use(RequestLogger(logger))

	// CORS configuration for local development.
	// Allows the Vite dev server (http://localhost:5173) to make credentialed requests.
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{corsOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300, // 5 minutes preflight cache
	}))

	// --- Routes ---

	r.Route("/api", func(r chi.Router) {
		// Health check — no auth required.
		r.Get("/health", HealthHandler(db))

		// Future route groups will be mounted here:
		// r.Route("/auth", authRoutes)
		// r.Route("/nodes", nodeRoutes)
		// r.Route("/files", fileRoutes)
		// r.Route("/uploads", uploadRoutes)
		// r.Route("/versions", versionRoutes)
		// r.Route("/provenance", provenanceRoutes)
		// r.Route("/storage", storageRoutes)
		// r.Route("/graph", graphRoutes)
		// r.Route("/imports", importRoutes)
	})

	return r
}
