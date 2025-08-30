const geoip = require("geoip-lite");
const requestIp = require("request-ip");

/**
 * Extract IP address from request with support for proxies and load balancers
 */
function extractIpAddress(req) {
    // Use request-ip to get the real IP address
    const clientIp = requestIp.getClientIp(req);

    // Additional fallback methods
    const ip =
        clientIp ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1";

    // Clean up IPv6 mapped IPv4 addresses
    return ip.replace(/^::ffff:/, "");
}

/**
 * Get geographic location from IP address
 */
function getLocationFromIp(ip) {
    try {
        // Don't process local/private IPs
        if (isPrivateIp(ip)) {
            return {
                country: null,
                region: null,
                city: null,
                timezone: null,
                coordinates: null,
                isPrivate: true,
            };
        }

        const geo = geoip.lookup(ip);

        if (!geo) {
            return {
                country: null,
                region: null,
                city: null,
                timezone: null,
                coordinates: null,
                isPrivate: false,
            };
        }

        return {
            country: geo.country || null,
            region: geo.region || null,
            city: geo.city || null,
            timezone: geo.timezone || null,
            coordinates: geo.ll
                ? {
                      latitude: geo.ll[0],
                      longitude: geo.ll[1],
                  }
                : null,
            isPrivate: false,
        };
    } catch (error) {
        console.error("Error getting location from IP:", error);
        return {
            country: null,
            region: null,
            city: null,
            timezone: null,
            coordinates: null,
            isPrivate: false,
            error: error.message,
        };
    }
}

/**
 * Check if IP address is private/local
 */
function isPrivateIp(ip) {
    // Local/private IP ranges
    const privateRanges = [
        /^127\./, // 127.0.0.0/8 (localhost)
        /^10\./, // 10.0.0.0/8
        /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
        /^192\.168\./, // 192.168.0.0/16
        /^169\.254\./, // 169.254.0.0/16 (link-local)
        /^::1$/, // IPv6 localhost
        /^fe80:/, // IPv6 link-local
        /^fc00:/, // IPv6 unique local
        /^fd00:/, // IPv6 unique local
    ];

    return privateRanges.some((range) => range.test(ip)) || ip === "localhost";
}

/**
 * Extract complete IP and location information from request
 */
function extractIpAndLocation(req) {
    const ip = extractIpAddress(req);
    const location = getLocationFromIp(ip);

    return {
        ip: ip,
        location: location,
        headers: {
            "x-forwarded-for": req.headers["x-forwarded-for"],
            "x-real-ip": req.headers["x-real-ip"],
            "cf-connecting-ip": req.headers["cf-connecting-ip"], // Cloudflare
            "x-client-ip": req.headers["x-client-ip"],
            "x-cluster-client-ip": req.headers["x-cluster-client-ip"],
        },
    };
}

/**
 * Anonymize IP address for privacy (removes last octet for IPv4)
 */
function anonymizeIp(ip) {
    if (!ip) return null;

    // IPv4 anonymization
    if (ip.includes(".") && !ip.includes(":")) {
        const parts = ip.split(".");
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
    }

    // IPv6 anonymization (keep first 64 bits)
    if (ip.includes(":")) {
        const parts = ip.split(":");
        if (parts.length >= 4) {
            return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
        }
    }

    return ip;
}

module.exports = {
    extractIpAddress,
    getLocationFromIp,
    extractIpAndLocation,
    anonymizeIp,
    isPrivateIp,
};
