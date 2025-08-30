# NanoMetrics Producer Service

A Node.js microservice for handling analytics data from client-side tracking scripts and publishing events to RabbitMQ.

## Features

-   **RESTful API**: Accepts analytics events via HTTP POST
-   **Data Validation**: Validates incoming analytics data using Joi schemas
-   **RabbitMQ Integration**: Publishes events to RabbitMQ for further processing
-   **IP & Location Extraction**: Automatically extracts and geolocates client IP addresses
-   **Privacy Features**: Configurable IP anonymization and location storage
-   **CORS Support**: Configurable CORS for cross-origin requests
-   **Rate Limiting**: Protects against abuse with configurable rate limits
-   **Health Checks**: Health endpoint for monitoring service status
-   **Security**: Helmet.js for security headers
-   **Graceful Shutdown**: Proper cleanup on service termination

## Installation

```bash
npm install
```

## Configuration

Copy the `.env` file and adjust the settings:

```bash
cp .env.example .env
```

Key environment variables:

-   `PORT`: Service port (default: 8082)
-   `RABBITMQ_URL`: RabbitMQ connection string
-   `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
-   `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per time window
-   `ANONYMIZE_IP`: Whether to anonymize IP addresses (true/false)
-   `STORE_LOCATION`: Whether to store location data (true/false)

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### POST /track

Accepts analytics events from client tracking scripts.

**Request Body:**

```json
{
    "type": "pageview",
    "websiteId": "123e4567-e89b-12d3-a456-426614174000",
    "sessionId": "987fcdeb-51d2-43a7-b123-456789abcdef",
    "url": "https://example.com/page",
    "referrer": "https://google.com",
    "screenWidth": 1920,
    "language": "en-US",
    "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Event tracked successfully",
    "eventId": "987fcdeb-51d2-43a7-b123-456789abcdef"
}
```

### GET /health

Health check endpoint for monitoring.

**Response:**

```json
{
    "status": "OK",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "uptime": 3600.123,
    "services": {
        "rabbitmq": "healthy"
    }
}
```

## Event Types

### Pageview Events

```json
{
    "type": "pageview",
    "websiteId": "uuid",
    "sessionId": "uuid",
    "url": "string",
    "referrer": "string",
    "timestamp": "ISO date"
}
```

### Custom Events

```json
{
    "type": "event",
    "name": "button_click",
    "data": { "button": "signup" },
    "websiteId": "uuid",
    "sessionId": "uuid",
    "url": "string",
    "timestamp": "ISO date"
}
```

## Client Integration

Include the tracking script on your website:

```html
<script
    src="https://your-domain.com/script.js"
    data-website-id="your-website-uuid"
    defer
></script>
```

The script will automatically:

-   Send pageview events on page load
-   Provide `window.analytics.track()` for custom events

## Dependencies

-   **express**: Web framework
-   **cors**: Cross-origin resource sharing
-   **helmet**: Security headers
-   **amqplib**: RabbitMQ client
-   **joi**: Data validation
-   **express-rate-limit**: Rate limiting
-   **dotenv**: Environment configuration

## IP Address and Location Features

The service automatically extracts and processes IP addresses from incoming requests with the following capabilities:

### IP Extraction

-   Supports requests behind proxies and load balancers
-   Checks multiple headers: `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`, etc.
-   Handles IPv6 mapped IPv4 addresses
-   Provides fallback methods for IP detection

### Geolocation

-   Automatically geolocates IP addresses using the GeoIP database
-   Provides country, region, city, timezone, and coordinates
-   Detects and handles private/local IP addresses
-   Returns structured location data

### Privacy Features

-   **IP Anonymization**: Configurable anonymization (removes last octet for IPv4)
-   **Location Control**: Option to disable location storage entirely
-   **Private IP Detection**: Automatically identifies and handles private networks

### Enhanced Event Data

Events are enriched with the following location data:

```json
{
    "ip": "203.0.113.1",
    "location": {
        "country": "US",
        "region": "CA",
        "city": "San Francisco",
        "timezone": "America/Los_Angeles",
        "coordinates": {
            "latitude": 37.7749,
            "longitude": -122.4194
        },
        "isPrivate": false
    },
    "headers": {
        "x-forwarded-for": "203.0.113.1, 10.0.0.1",
        "x-real-ip": "203.0.113.1"
    }
}
```

### Testing

Test the IP and location functionality:

```bash
node test-ip-location.js
```

## License

MIT
