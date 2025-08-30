package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/robfig/cron/v3"
	"github.com/satvikg7/nanometrics/stats-cron-job/aggregator"
	"github.com/satvikg7/nanometrics/stats-cron-job/config"
	"github.com/satvikg7/nanometrics/stats-cron-job/database"
	"github.com/sirupsen/logrus"
)

func main() {
	// Initialize logger
	logger := logrus.New()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.WithError(err).Fatal("Failed to load configuration")
	}

	// Configure logger
	level, err := logrus.ParseLevel(cfg.LogLevel)
	if err != nil {
		logger.WithError(err).Warn("Invalid log level, using info")
		level = logrus.InfoLevel
	}
	logger.SetLevel(level)

	if cfg.LogFormat == "json" {
		logger.SetFormatter(&logrus.JSONFormatter{})
	}

	logger.WithFields(logrus.Fields{
		"mongoUri":          cfg.MongoURI,
		"cronSchedule":      cfg.CronSchedule,
		"aggregationWindow": cfg.AggregationWindow,
		"healthCheckPort":   cfg.HealthCheckPort,
	}).Info("Starting NanoMetrics Aggregation Service")

	// Initialize database connection
	db, err := database.NewClient(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to connect to database")
	}
	defer func() {
		if err := db.Close(); err != nil {
			logger.WithError(err).Error("Failed to close database connection")
		}
	}()

	// Initialize stats-cron-job service
	aggregationService := aggregator.NewService(db, cfg, logger)

	// Start health check server
	go startHealthServer(cfg.HealthCheckPort, db, logger)

	// Initialize cron scheduler
	c := cron.New(cron.WithLogger(cron.VerbosePrintfLogger(logger)))

	// Add stats-cron-job job
	_, err = c.AddFunc(cfg.CronSchedule, func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
		defer cancel()

		logger.Info("Starting scheduled stats-cron-job job")
		start := time.Now()

		if err := aggregationService.AggregateData(ctx); err != nil {
			logger.WithError(err).Error("Aggregation job failed")
		} else {
			duration := time.Since(start)
			logger.WithField("duration", duration).Info("Aggregation job completed successfully")
		}
	})

	if err != nil {
		logger.WithError(err).Fatal("Failed to schedule stats-cron-job job")
	}

	// Start cron scheduler
	c.Start()
	logger.Info("Cron scheduler started")

	// Run initial stats-cron-job
	logger.Info("Running initial stats-cron-job")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	if err := aggregationService.AggregateData(ctx); err != nil {
		logger.WithError(err).Error("Initial stats-cron-job failed")
	}
	cancel()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	logger.Info("Received shutdown signal")

	// Stop cron scheduler
	c.Stop()
	logger.Info("Cron scheduler stopped")

	logger.Info("NanoMetrics Aggregation Service shutdown complete")
}

// startHealthServer starts the health check HTTP server
func startHealthServer(port string, db *database.Client, logger *logrus.Logger) {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		status := "OK"
		statusCode := http.StatusOK

		// Check database health
		if !db.IsHealthy() {
			status = "DEGRADED"
			statusCode = http.StatusServiceUnavailable
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)

		response := fmt.Sprintf(`{
			"status": "%s",
			"timestamp": "%s",
			"services": {
				"mongodb": "%s"
			}
		}`, status, time.Now().Format(time.RFC3339), func() string {
			if db.IsHealthy() {
				return "healthy"
			}
			return "unhealthy"
		}())

		w.Write([]byte(response))
	})

	// Ready endpoint
	mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ready"}`))
	})

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  15 * time.Second,
	}

	logger.WithField("port", port).Info("Starting health check server")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.WithError(err).Error("Health check server failed")
	}
}
