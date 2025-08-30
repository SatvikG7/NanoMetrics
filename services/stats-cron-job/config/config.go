package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

// Config holds all configuration for the application
type Config struct {
	// MongoDB Configuration
	MongoURI     string
	MongoDBName  string
	MongoTimeout time.Duration

	// Cron Configuration
	CronSchedule      string
	AggregationWindow time.Duration

	// Logging Configuration
	LogLevel  string
	LogFormat string

	// Health Check Configuration
	HealthCheckPort string

	// Aggregation Configuration
	BatchSize  int
	MaxRetries int
	RetryDelay time.Duration
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	config := &Config{
		MongoURI:          getEnv("MONGODB_URI", "mongodb://localhost:27017/nanometrics"),
		MongoDBName:       getEnv("MONGODB_DB_NAME", "nanometrics"),
		MongoTimeout:      time.Duration(getEnvAsInt("MONGODB_TIMEOUT_SECONDS", 30)) * time.Second,
		CronSchedule:      getEnv("CRON_SCHEDULE", "*/5 * * * *"), // Every 5 minutes
		AggregationWindow: time.Duration(getEnvAsInt("AGGREGATION_WINDOW_MINUTES", 5)) * time.Minute,
		LogLevel:          getEnv("LOG_LEVEL", "info"),
		LogFormat:         getEnv("LOG_FORMAT", "json"),
		HealthCheckPort:   getEnv("HEALTH_CHECK_PORT", "8084"),
		BatchSize:         getEnvAsInt("BATCH_SIZE", 1000),
		MaxRetries:        getEnvAsInt("MAX_RETRIES", 3),
		RetryDelay:        time.Duration(getEnvAsInt("RETRY_DELAY_SECONDS", 5)) * time.Second,
	}

	return config, nil
}

// getEnv gets an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// getEnvAsInt gets an environment variable as integer with a fallback value
func getEnvAsInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
		logrus.WithField("key", key).WithField("value", value).Warn("Invalid integer value in environment variable, using fallback")
	}
	return fallback
}
