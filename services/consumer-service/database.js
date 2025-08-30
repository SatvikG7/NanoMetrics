const { MongoClient } = require("mongodb");
const AnalyticsEvent = require("./models/AnalyticsEvent");

class MongoDBService {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
        this.retryAttempts = 0;
        this.maxRetryAttempts =
            parseInt(process.env.MONGODB_MAX_RETRY_ATTEMPTS) || 5;
        this.retryDelay = parseInt(process.env.MONGODB_RETRY_DELAY_MS) || 5000;
    }

    async connect() {
        try {
            const mongoUri =
                process.env.MONGODB_URI ||
                "mongodb://localhost:27017/nanometrics";

            // Extract database name from URI or use default
            const dbName = process.env.MONGODB_DB_NAME || "nanometrics";

            const options = {
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            };

            this.client = new MongoClient(mongoUri, options);
            await this.client.connect();
            this.db = this.client.db(dbName);

            this.isConnected = true;
            this.retryAttempts = 0;

            console.log("✅ Connected to MongoDB");

            // Create indexes for the AnalyticsEvent collection
            try {
                await AnalyticsEvent.createIndexes(this.db);
            } catch (error) {
                console.error("❌ Failed to create indexes:", error);
                // Don't throw here - connection is still valid even if index creation fails
            }

            // Handle connection events
            this.client.on("error", (err) => {
                console.error("❌ MongoDB connection error:", err);
                this.isConnected = false;
            });

            this.client.on("close", () => {
                console.log("🔌 MongoDB disconnected");
                this.isConnected = false;
                this.handleReconnection();
            });
        } catch (error) {
            console.error("❌ Failed to connect to MongoDB:", error);
            this.isConnected = false;
            this.handleReconnection();
        }
    }

    async handleReconnection() {
        if (this.retryAttempts < this.maxRetryAttempts) {
            this.retryAttempts++;
            console.log(
                `🔄 Attempting to reconnect to MongoDB (${this.retryAttempts}/${this.maxRetryAttempts}) in ${this.retryDelay}ms`
            );

            setTimeout(() => {
                this.connect();
            }, this.retryDelay);
        } else {
            console.error(
                "❌ Max MongoDB reconnection attempts reached. Exiting..."
            );
            process.exit(1);
        }
    }

    async saveAnalyticsEvent(eventData) {
        if (!this.isConnected || !this.db) {
            throw new Error("MongoDB is not connected");
        }

        try {
            // Create new analytics event instance
            const analyticsEvent = new AnalyticsEvent({
                ...eventData,
                processedAt: new Date(),
            });

            // Validate the event data
            const validationErrors = analyticsEvent.validate();
            if (validationErrors) {
                throw new Error(
                    `Validation failed: ${validationErrors.join(", ")}`
                );
            }

            // Get the collection
            const collection = this.db.collection(
                AnalyticsEvent.getCollectionName()
            );

            // Save to database
            const result = await collection.insertOne(
                analyticsEvent.toDocument()
            );

            console.log(
                `💾 Analytics event saved: ${analyticsEvent.type} for website ${analyticsEvent.websiteId}`
            );

            return { ...analyticsEvent.toDocument(), _id: result.insertedId };
        } catch (error) {
            console.error("❌ Failed to save analytics event:", error);
            throw error;
        }
    }

    async getEventStats() {
        if (!this.isConnected || !this.db) {
            throw new Error("MongoDB is not connected");
        }

        try {
            const collection = this.db.collection(
                AnalyticsEvent.getCollectionName()
            );

            const stats = await collection
                .aggregate([
                    {
                        $group: {
                            _id: null,
                            totalEvents: { $sum: 1 },
                            pageviews: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "pageview"] },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            events: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "event"] }, 1, 0],
                                },
                            },
                            uniqueSessions: { $addToSet: "$sessionId" },
                            uniqueWebsites: { $addToSet: "$websiteId" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalEvents: 1,
                            pageviews: 1,
                            events: 1,
                            uniqueSessions: { $size: "$uniqueSessions" },
                            uniqueWebsites: { $size: "$uniqueWebsites" },
                        },
                    },
                ])
                .toArray();

            return (
                stats[0] || {
                    totalEvents: 0,
                    pageviews: 0,
                    events: 0,
                    uniqueSessions: 0,
                    uniqueWebsites: 0,
                }
            );
        } catch (error) {
            console.error("❌ Failed to get event stats:", error);
            throw error;
        }
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            this.client = null;
            this.db = null;
            console.log("🔌 MongoDB connection closed");
        }
    }

    isHealthy() {
        return this.isConnected && this.client;
    }
}

module.exports = new MongoDBService();
