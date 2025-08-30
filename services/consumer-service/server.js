const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const rabbitMQConsumer = require("./rabbitmq");
const mongoDBService = require("./database");
const { validateEnrichedEvent, sanitizeEventData } = require("./validation");

const app = express();
const PORT = process.env.PORT || 8083;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
            "http://localhost:3000",
        ],
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json({ limit: "1mb" }));

// Request logging middleware
app.use((req, _res, next) => {
    console.log(
        `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${
            req.ip
        }`
    );
    next();
});

// Statistics tracking
let processedMessages = 0;
let failedMessages = 0;
const startTime = Date.now();

// Message handler function
async function handleAnalyticsMessage(messageData) {
    try {
        // Validate the message data
        const { error, value } = validateEnrichedEvent(messageData);
        if (error) {
            console.error(
                "❌ Message validation failed:",
                error.details.map((d) => d.message)
            );
            throw new Error(
                `Validation failed: ${error.details
                    .map((d) => d.message)
                    .join(", ")}`
            );
        }

        // Sanitize and prepare data for MongoDB
        const sanitizedData = sanitizeEventData(value);

        // Save to MongoDB
        await mongoDBService.saveAnalyticsEvent(sanitizedData);

        // Update statistics
        processedMessages++;

        // Log success
        const locationInfo = sanitizedData.location
            ? `${sanitizedData.location.city || "Unknown"}, ${
                  sanitizedData.location.country || "Unknown"
              }`
            : "Location unavailable";

        console.log(
            `✅ [${processedMessages}] Analytics event stored: ${sanitizedData.type} for website ${sanitizedData.websiteId} from ${locationInfo}`
        );
    } catch (error) {
        failedMessages++;
        console.error(
            `❌ [${failedMessages}] Failed to process message:`,
            error.message
        );
        throw error; // Re-throw to trigger retry mechanism
    }
}

// Health check endpoint
app.get("/health", async (_req, res) => {
    try {
        const rabbitMQStatus = rabbitMQConsumer.getStatus();
        const mongoHealthy = mongoDBService.isHealthy();

        let dbStats = null;
        if (mongoHealthy) {
            try {
                dbStats = await mongoDBService.getEventStats();
            } catch (error) {
                console.error("Failed to get DB stats:", error);
            }
        }

        const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        const processRate =
            processedMessages > 0
                ? ((processedMessages / uptimeSeconds) * 60).toFixed(2)
                : 0;

        const health = {
            status:
                rabbitMQStatus.connected && mongoHealthy ? "OK" : "DEGRADED",
            timestamp: new Date().toISOString(),
            uptime: uptimeSeconds,
            services: {
                rabbitmq: {
                    connected: rabbitMQStatus.connected,
                    consuming: rabbitMQStatus.consuming,
                    retryAttempts: rabbitMQStatus.retryAttempts,
                },
                mongodb: {
                    connected: mongoHealthy,
                    stats: dbStats,
                },
            },
            consumer: {
                processedMessages,
                failedMessages,
                successRate:
                    processedMessages > 0
                        ? (
                              (processedMessages /
                                  (processedMessages + failedMessages)) *
                              100
                          ).toFixed(2) + "%"
                        : "0%",
                messagesPerMinute: processRate,
            },
        };

        const statusCode = health.status === "OK" ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({
            status: "ERROR",
            timestamp: new Date().toISOString(),
            error: "Health check failed",
        });
    }
});

// Statistics endpoint
app.get("/stats", async (_req, res) => {
    try {
        if (!mongoDBService.isHealthy()) {
            return res.status(503).json({
                error: "Database not available",
            });
        }

        const dbStats = await mongoDBService.getEventStats();
        const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

        res.json({
            consumer: {
                uptime: uptimeSeconds,
                processedMessages,
                failedMessages,
                successRate:
                    processedMessages > 0
                        ? (
                              (processedMessages /
                                  (processedMessages + failedMessages)) *
                              100
                          ).toFixed(2) + "%"
                        : "0%",
            },
            database: dbStats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to get stats:", error);
        res.status(500).json({
            error: "Failed to retrieve statistics",
        });
    }
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((error, _req, res, _next) => {
    console.error("❌ Unhandled error:", error);
    res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong",
    });
});

// Graceful shutdown
async function gracefulShutdown(signal) {
    console.log(`🛑 ${signal} received, shutting down gracefully`);

    try {
        // Stop consuming messages
        await rabbitMQConsumer.close();

        // Close database connection
        await mongoDBService.close();

        console.log("✅ Graceful shutdown completed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
async function startServer() {
    try {
        console.log("🚀 Starting NanoMetrics Consumer Service...");

        // Connect to MongoDB first
        console.log("📦 Connecting to MongoDB...");
        await mongoDBService.connect();

        // Connect to RabbitMQ
        console.log("🐰 Connecting to RabbitMQ...");
        await rabbitMQConsumer.connect();

        // Start consuming messages
        console.log("🎯 Starting message consumption...");
        await rabbitMQConsumer.startConsuming(handleAnalyticsMessage);

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`✅ Consumer service running on port ${PORT}`);
            console.log(
                `🏥 Health check endpoint: http://localhost:${PORT}/health`
            );
            console.log(
                `📊 Statistics endpoint: http://localhost:${PORT}/stats`
            );
            console.log(
                "🎉 Consumer service is ready to process analytics events!"
            );
        });
    } catch (error) {
        console.error("❌ Failed to start consumer service:", error);
        process.exit(1);
    }
}

startServer();
