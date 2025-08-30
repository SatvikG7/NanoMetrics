const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const rabbitMQ = require("./rabbitmq");
const { validateAnalyticsEvent } = require("./validation");
const { extractIpAndLocation, anonymizeIp } = require("./ipLocation");

const app = express();
const PORT = process.env.PORT || 8082;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs
    message: {
        error: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
];
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            const msg =
                "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        },
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ type: "text/plain", limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${
            req.ip
        }`
    );
    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    const health = {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            rabbitmq: rabbitMQ.isHealthy() ? "healthy" : "unhealthy",
        },
    };

    const statusCode = rabbitMQ.isHealthy() ? 200 : 503;
    res.status(statusCode).json(health);
});

// Analytics tracking endpoint
app.post("/track", async (req, res) => {
    try {
        let eventData;

        // Handle different content types
        if (req.is("application/json")) {
            eventData = req.body;
        } else if (req.is("text/plain")) {
            try {
                eventData = JSON.parse(req.body);
            } catch (parseError) {
                return res.status(400).json({
                    error: "Invalid JSON in request body",
                    details: parseError.message,
                });
            }
        } else {
            eventData = req.body;
        }

        // Validate the event data
        const { error, value } = validateAnalyticsEvent(eventData);
        if (error) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.details.map((detail) => detail.message),
            });
        }

        // Extract IP and location information
        const ipInfo = extractIpAndLocation(req);

        // Respect privacy configuration
        const shouldAnonymizeIp = process.env.ANONYMIZE_IP === "true";
        const shouldStoreLocation = process.env.STORE_LOCATION === "true";

        // Add server-side metadata
        const enrichedEvent = {
            ...value,
            serverTimestamp: new Date().toISOString(),
            userAgent: req.get("User-Agent"),
            ip: shouldAnonymizeIp ? anonymizeIp(ipInfo.ip) : ipInfo.ip,
            ...(shouldAnonymizeIp && { originalIp: ipInfo.ip }), // Store original only if anonymizing
            ...(shouldStoreLocation && { location: ipInfo.location }),
            headers: ipInfo.headers,
        };

        // Publish to RabbitMQ
        await rabbitMQ.publishMessage(enrichedEvent);

        // Log the event (consider using a proper logger in production)
        const locationInfo = enrichedEvent.location
            ? `${enrichedEvent.location.city || "Unknown"}, ${
                  enrichedEvent.location.country || "Unknown"
              }`
            : "Location unavailable";
        console.log(
            `📊 Analytics event processed: ${enrichedEvent.type} for website ${enrichedEvent.websiteId} from ${locationInfo} (IP: ${enrichedEvent.ip})`
        );

        // Return success response
        res.status(200).json({
            success: true,
            message: "Event tracked successfully",
            eventId: enrichedEvent.sessionId,
        });
    } catch (error) {
        console.error("❌ Error processing analytics event:", error);

        // Don't expose internal errors to client
        res.status(500).json({
            error: "Internal server error",
            message: "Failed to process analytics event",
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
app.use((error, req, res, next) => {
    console.error("❌ Unhandled error:", error);
    res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong",
    });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    await rabbitMQ.close();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    await rabbitMQ.close();
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Connect to RabbitMQ first
        await rabbitMQ.connect();

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`🚀 Producer service running on port ${PORT}`);
            console.log(
                `📊 Analytics tracking endpoint: http://localhost:${PORT}/track`
            );
            console.log(
                `🏥 Health check endpoint: http://localhost:${PORT}/health`
            );
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
