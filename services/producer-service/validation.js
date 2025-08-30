const Joi = require("joi");

// Schema for analytics event validation
const analyticsEventSchema = Joi.object({
    type: Joi.string().valid("pageview", "event").required(),
    websiteId: Joi.string().uuid().required(),
    sessionId: Joi.string().uuid().required(),
    url: Joi.string().uri().required(),
    referrer: Joi.string().uri().allow("").optional(),
    screenWidth: Joi.number().integer().positive().optional(),
    language: Joi.string().optional(),
    timestamp: Joi.string().isoDate().required(),

    // For event type
    name: Joi.alternatives().conditional("type", {
        is: "event",
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),

    data: Joi.alternatives().conditional("type", {
        is: "event",
        then: Joi.object().optional(),
        otherwise: Joi.forbidden(),
    }),
});

// Schema for enriched analytics event (after server processing)
const enrichedAnalyticsEventSchema = analyticsEventSchema.keys({
    serverTimestamp: Joi.string().isoDate().required(),
    userAgent: Joi.string().optional(),
    ip: Joi.string().ip().required(),
    anonymizedIp: Joi.string().optional(),
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
});

const validateAnalyticsEvent = (data) => {
    return analyticsEventSchema.validate(data);
};

const validateEnrichedEvent = (data) => {
    return enrichedAnalyticsEventSchema.validate(data);
};

module.exports = {
    validateAnalyticsEvent,
    validateEnrichedEvent,
};
