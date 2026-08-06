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

		// Auth routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", RegisterHandler(db))
			r.Post("/login", LoginHandler(db))
			r.Post("/logout", LogoutHandler(db))
			r.With(RequireAuth(db)).Get("/me", MeHandler(db))
		})

		// Nodes routes (protected)
		r.Route("/nodes", func(r chi.Router) {
			r.Use(RequireAuth(db))
			r.Get("/", ListNodesHandler(db))
			r.Post("/", CreateFolderHandler(db))
			r.Patch("/{id}", UpdateNodeHandler(db))
			r.Delete("/{id}", DeleteNodeHandler(db))
		})

		// Files & Uploads routes (protected)
		r.Route("/files", func(r chi.Router) {
			r.Use(RequireAuth(db))
			r.Post("/download-zip", DownloadZipHandler(db))
			r.Get("/{nodeId}/download", DownloadFileHandler(db))
			r.Get("/{nodeId}/versions", ListVersionsHandler(db))
			r.Post("/{nodeId}/versions/{versionId}/restore", RestoreVersionHandler(db))
			r.Get("/{nodeId}/versions/{versionId}/download", DownloadSpecificVersionHandler(db))
		})

		r.Route("/uploads", func(r chi.Router) {
			r.Use(RequireAuth(db))
			r.Post("/", CreateUploadSessionHandler(db))
			r.Put("/{sessionId}", UploadChunkHandler(db))
			r.Post("/{sessionId}/complete", CompleteUploadHandler(db))
			r.Delete("/{sessionId}", CancelUploadHandler(db))
		})

		// Provenance routes (protected)
		r.Route("/provenance", func(r chi.Router) {
			r.Use(RequireAuth(db))
			r.Get("/{nodeId}", ListProvenanceHandler(db))
			r.Post("/{nodeId}/verify", VerifyProvenanceHandler(db))
		})

		// r.Route("/storage", storageRoutes)
		// r.Route("/graph", graphRoutes)
		// r.Route("/imports", importRoutes)
	})

	return r
}
