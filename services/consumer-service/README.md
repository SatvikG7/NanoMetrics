# NanoMetrics Consumer Service

A Node.js microservice that consumes analytics events from RabbitMQ and stores them in MongoDB.

## Features

-   **RabbitMQ Consumer**: Consumes analytics events from the message queue
-   **MongoDB Storage**: Stores analytics events with proper indexing
-   **Data Validation**: Validates incoming messages using Joi schemas
-   **Error Handling**: Retry mechanism with dead letter queue support
-   **Health Monitoring**: Health check and statistics endpoints
-   **Graceful Shutdown**: Properly closes connections on shutdown
-   **Auto-reconnection**: Automatically reconnects to RabbitMQ and MongoDB

## Prerequisites

-   Node.js 16+
-   RabbitMQ server
-   MongoDB server

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy the environment configuration:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=8083

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=analytics_exchange
RABBITMQ_QUEUE=analytics_events
RABBITMQ_ROUTING_KEY=analytics.events

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nanometrics
MONGODB_DB_NAME=nanometrics

# Consumer Configuration
CONSUMER_PREFETCH_COUNT=10
CONSUMER_AUTO_ACK=false
RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
```

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

### Health Check

```
GET /health
```

Returns the health status of RabbitMQ, MongoDB, and consumer statistics.

### Statistics

```
GET /stats
```

Returns detailed statistics about processed messages and database metrics.

## Data Structure

The consumer expects enriched analytics events from the producer with the following structure:

```json
{
    "type": "pageview|event",
    "websiteId": "uuid",
    "sessionId": "uuid",
    "url": "https://example.com",
    "referrer": "https://google.com",
    "screenWidth": 1920,
    "language": "en",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "name": "button_click",
    "data": { "button": "signup" },
    "serverTimestamp": "2023-01-01T00:00:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.1",
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
    }
}
```

## MongoDB Schema

Analytics events are stored in the `analytics_events` collection with the following indexes:

-   `{ websiteId: 1, timestamp: -1 }`
-   `{ websiteId: 1, type: 1, timestamp: -1 }`
-   `{ sessionId: 1, timestamp: 1 }`
-   `{ serverTimestamp: -1 }`

## Error Handling

The consumer implements a retry mechanism:

1. Messages that fail processing are retried up to 3 times
2. Failed messages include retry count in headers
3. After max retries, messages are rejected (can be sent to dead letter queue)
4. Connection failures trigger automatic reconnection

## Monitoring

The service provides comprehensive monitoring through:

-   Health check endpoint showing service status
-   Statistics endpoint with processing metrics
-   Console logging of all events
-   Error tracking and retry monitoring

## Docker Support

The service can be containerized. Example Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --only=production
COPY . .
EXPOSE 8083
CMD ["npm", "start"]
```

## Architecture

The consumer follows a modular architecture:

-   `server.js` - Main application and HTTP endpoints
-   `rabbitmq.js` - RabbitMQ consumer logic
-   `database.js` - MongoDB connection and operations
-   `models/AnalyticsEvent.js` - MongoDB document model
-   `validation.js` - Data validation schemas

## Development

For development with auto-reload:

```bash
npm run dev
```

Run tests:

```bash
npm test
```
