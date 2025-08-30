// Collection name
const COLLECTION_NAME = "analytics_events";

class AnalyticsEvent {
    constructor(data) {
        // Core event data
        this.type = data.type;
        this.websiteId = data.websiteId;
        this.sessionId = data.sessionId;
        this.url = data.url;
        this.referrer = data.referrer || "";
        this.screenWidth = data.screenWidth;
        this.language = data.language;
        this.timestamp =
            data.timestamp instanceof Date
                ? data.timestamp
                : new Date(data.timestamp);

        // Event-specific data (only for event type)
        if (data.type === "event") {
            this.name = data.name;
            this.data = data.data;
        }

        // Server-side enriched data
        this.serverTimestamp =
            data.serverTimestamp instanceof Date
                ? data.serverTimestamp
                : new Date(data.serverTimestamp || Date.now());
        this.userAgent = data.userAgent;
        this.ip = data.ip;
        this.originalIp = data.originalIp;
        this.location = data.location;
        this.headers = data.headers;

        // Processing metadata
        this.processedAt =
            data.processedAt instanceof Date
                ? data.processedAt
                : new Date(data.processedAt || Date.now());
        this.messageId = data.messageId;

        // MongoDB timestamps
        this.createdAt =
            data.createdAt instanceof Date
                ? data.createdAt
                : new Date(data.createdAt || Date.now());
        this.updatedAt =
            data.updatedAt instanceof Date
                ? data.updatedAt
                : new Date(data.updatedAt || Date.now());
    }

    // Validate required fields
    validate() {
        const errors = [];

        if (!this.type || !["pageview", "event"].includes(this.type)) {
            errors.push("Type must be 'pageview' or 'event'");
        }

        if (!this.websiteId) {
            errors.push("Website ID is required");
        }

        if (!this.sessionId) {
            errors.push("Session ID is required");
        }

        if (!this.url) {
            errors.push("URL is required");
        }

        if (!this.timestamp) {
            errors.push("Timestamp is required");
        }

        if (!this.ip) {
            errors.push("IP address is required");
        }

        if (this.type === "event" && !this.name) {
            errors.push("Event name is required for event type");
        }

        return errors.length > 0 ? errors : null;
    }

    // Convert to plain object for MongoDB insertion
    toDocument() {
        const doc = { ...this };

        // Remove any undefined values
        Object.keys(doc).forEach((key) => {
            if (doc[key] === undefined) {
                delete doc[key];
            }
        });

        return doc;
    }

    // Static method to get collection name
    static getCollectionName() {
        return COLLECTION_NAME;
    }

    // Static method to create indexes
    static async createIndexes(db) {
        const collection = db.collection(COLLECTION_NAME);

        try {
            await collection.createIndexes([
                { key: { type: 1 } },
                { key: { websiteId: 1 } },
                { key: { sessionId: 1 } },
                { key: { timestamp: 1 } },
                { key: { serverTimestamp: -1 } },
                { key: { processedAt: 1 } },
                { key: { messageId: 1 } },
                // Compound indexes for common queries
                { key: { websiteId: 1, timestamp: -1 } },
                { key: { websiteId: 1, type: 1, timestamp: -1 } },
                { key: { sessionId: 1, timestamp: 1 } },
                // TTL index to automatically delete old events (optional)
                {
                    key: { processedAt: 1 },
                    options: { expireAfterSeconds: 3600 },
                }, // 1 hour
            ]);
            console.log("✅ MongoDB indexes created successfully");
        } catch (error) {
            // Ignore error if indexes already exist
            if (error.code === 68 || error.codeName === "IndexAlreadyExists") {
                console.log(
                    "ℹ️ MongoDB indexes already exist, skipping creation"
                );
            } else {
                console.error("❌ Failed to create MongoDB indexes:", error);
                throw error;
            }
        }
    }
}

module.exports = AnalyticsEvent;
