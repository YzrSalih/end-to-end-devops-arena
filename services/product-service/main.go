package main

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/lib/pq"
)

type Product struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	CreatedAt time.Time `json:"created_at"`
}

type App struct {
	db     *sql.DB
	logger *slog.Logger
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		logger.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	if err := waitForDB(db, logger); err != nil {
		logger.Error("database not ready", "error", err)
		os.Exit(1)
	}

	if err := migrate(db); err != nil {
		logger.Error("migration failed", "error", err)
		os.Exit(1)
	}

	app := &App{db: db, logger: logger}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/health", app.handleHealth)
	r.Get("/products", app.handleListProducts)
	r.Post("/products", app.handleCreateProduct)
	r.Get("/products/{id}", app.handleGetProduct)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("product-service starting", "port", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		logger.Error("server error", "error", err)
		os.Exit(1)
	}
}

func (a *App) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *App) handleListProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, name, price, stock, created_at FROM products ORDER BY id`)
	if err != nil {
		a.logger.Error("query failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}
	defer rows.Close()

	products := []Product{}
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.CreatedAt); err != nil {
			a.logger.Error("scan failed", "error", err)
			continue
		}
		products = append(products, p)
	}

	writeJSON(w, http.StatusOK, products)
}

func (a *App) handleCreateProduct(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name  string  `json:"name"`
		Price float64 `json:"price"`
		Stock int     `json:"stock"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if input.Name == "" || input.Price <= 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name and price are required"})
		return
	}

	var p Product
	err := a.db.QueryRowContext(r.Context(),
		`INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING id, name, price, stock, created_at`,
		input.Name, input.Price, input.Stock,
	).Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.CreatedAt)

	if err != nil {
		a.logger.Error("insert failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusCreated, p)
}

func (a *App) handleGetProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var p Product
	err := a.db.QueryRowContext(r.Context(),
		`SELECT id, name, price, stock, created_at FROM products WHERE id = $1`, id,
	).Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.CreatedAt)

	if err == sql.ErrNoRows {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "product not found"})
		return
	}
	if err != nil {
		a.logger.Error("query failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, p)
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS products (
			id         SERIAL PRIMARY KEY,
			name       TEXT NOT NULL,
			price      NUMERIC(10,2) NOT NULL,
			stock      INT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	return err
}

func waitForDB(db *sql.DB, logger *slog.Logger) error {
	for i := 0; i < 10; i++ {
		if err := db.Ping(); err == nil {
			return nil
		}
		logger.Info("waiting for database...")
		time.Sleep(2 * time.Second)
	}
	return db.Ping()
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
