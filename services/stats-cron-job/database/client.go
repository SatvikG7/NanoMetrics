package database

import (
	"context"
	"time"

	"github.com/satvikg7/nanometrics/stats-cron-job/config"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Client wraps MongoDB client with additional functionality
type Client struct {
	client   *mongo.Client
	database *mongo.Database
	config   *config.Config
	logger   *logrus.Logger
}

// NewClient creates a new MongoDB client
func NewClient(cfg *config.Config, logger *logrus.Logger) (*Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), cfg.MongoTimeout)
	defer cancel()

	// Configure MongoDB client options
	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	clientOptions.SetMaxPoolSize(10)
	clientOptions.SetMinPoolSize(1)
	clientOptions.SetMaxConnIdleTime(30 * time.Second)
	clientOptions.SetServerSelectionTimeout(cfg.MongoTimeout)

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	database := client.Database(cfg.MongoDBName)

	logger.WithFields(logrus.Fields{
		"uri":      cfg.MongoURI,
		"database": cfg.MongoDBName,
	}).Info("Connected to MongoDB")

	return &Client{
		client:   client,
		database: database,
		config:   cfg,
		logger:   logger,
	}, nil
}

// GetDatabase returns the MongoDB database instance
func (c *Client) GetDatabase() *mongo.Database {
	return c.database
}

// GetCollection returns a MongoDB collection
func (c *Client) GetCollection(name string) *mongo.Collection {
	return c.database.Collection(name)
}

// Close closes the MongoDB connection
func (c *Client) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), c.config.MongoTimeout)
	defer cancel()

	if err := c.client.Disconnect(ctx); err != nil {
		c.logger.WithError(err).Error("Failed to disconnect from MongoDB")
		return err
	}

	c.logger.Info("Disconnected from MongoDB")
	return nil
}

// Ping pings the MongoDB server
func (c *Client) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return c.client.Ping(ctx, nil)
}

// IsHealthy checks if the MongoDB connection is healthy
func (c *Client) IsHealthy() bool {
	return c.Ping() == nil
}
