const Joi = require("joi");

// Schema for validating incoming messages from RabbitMQ
const enrichedAnalyticsEventSchema = Joi.object({
    // Core event data
    type: Joi.string().valid("pageview", "event").required(),
    websiteId: Joi.string().uuid().required(),
    sessionId: Joi.string().uuid().required(),
    url: Joi.string().uri().required(),
    referrer: Joi.string().uri().allow("").optional(),
    screenWidth: Joi.number().integer().positive().optional(),
    language: Joi.string().optional(),
    timestamp: Joi.string().isoDate().required(),

    // Event-specific data (only for event type)
    name: Joi.when("type", {
        is: "event",
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
    data: Joi.when("type", {
        is: "event",
        then: Joi.object().optional(),
        otherwise: Joi.forbidden(),
    }),

    // Server-side enriched data
    serverTimestamp: Joi.string().isoDate().required(),
    userAgent: Joi.string().optional(),
    ip: Joi.string().ip().required(),
    originalIp: Joi.string().ip().optional(),
    location: Joi.object({
        country: Joi.string().allow(null).optional(),
        region: Joi.string().allow(null).optional(),
        city: Joi.string().allow(null).optional(),
        timezone: Joi.string().allow(null).optional(),
        coordinates: Joi.object({
            latitude: Joi.number().optional(),
            longitude: Joi.number().optional(),
        })
            .allow(null)
            .optional(),
        isPrivate: Joi.boolean().optional(),
    }).optional(),
    headers: Joi.object().optional(),

    // Message metadata (added by consumer)
    messageId: Joi.string().optional(),
    receivedAt: Joi.date().optional(),
    deliveryTag: Joi.number().optional(),
});

const validateEnrichedEvent = (data) => {
    return enrichedAnalyticsEventSchema.validate(data, {
        stripUnknown: true,
        allowUnknown: false,
    });
};

const sanitizeEventData = (data) => {
    // Convert string dates to Date objects
    const sanitized = { ...data };

    if (sanitized.timestamp) {
        sanitized.timestamp = new Date(sanitized.timestamp);
    }

    if (sanitized.serverTimestamp) {
        sanitized.serverTimestamp = new Date(sanitized.serverTimestamp);
    }

    // Ensure location coordinates are properly formatted
    if (sanitized.location?.coordinates) {
        const { latitude, longitude } = sanitized.location.coordinates;
        if (latitude !== undefined && longitude !== undefined) {
            sanitized.location.coordinates = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            };
        }
    }

    return sanitized;
};

module.exports = {
    validateEnrichedEvent,
    sanitizeEventData,
};
