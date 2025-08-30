# NanoMetrics Aggregation Service

A Go-based microservice that performs scheduled stats-cron-job of analytics data from MongoDB and stores the results in a `stats` collection. The service runs as a cron job every 5 minutes to aggregate analytics events into meaningful statistics.

## Features

-   **Scheduled Aggregation**: Runs every 5 minutes using cron
-   **Comprehensive Metrics**: Aggregates pageviews, unique visitors, sessions, and events
-   **Top Statistics**: Generates top pages, referrers, countries, browsers, and languages
-   **Session Metrics**: Calculates bounce rate and average session duration
-   **Health Monitoring**: Built-in health check endpoints
-   **Robust Error Handling**: Retry mechanisms and graceful error handling
-   **Production Ready**: Includes Docker support and proper logging

## Architecture

The service aggregates raw analytics events from the `analytics_events` collection and produces summarized statistics in the `stats` collection. Each stats-cron-job covers a 5-minute window and includes:

### Basic Metrics

-   Total pageviews
-   Unique visitors (by IP)
-   Unique sessions
-   Total events

### Top Lists (Top 10)

-   Most visited pages
-   Top referrers
-   Top countries
-   Most used browsers
-   Common screen sizes
-   Popular languages

### Session Analytics

-   Average session duration
-   Bounce rate calculation

## Configuration

The service is configured via environment variables:

### MongoDB Configuration

-   `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/nanometrics`)
-   `MONGODB_DB_NAME`: Database name (default: `nanometrics`)
-   `MONGODB_TIMEOUT_SECONDS`: Connection timeout (default: `30`)

### Cron Configuration

-   `CRON_SCHEDULE`: Cron expression for stats-cron-job schedule (default: `*/5 * * * *`)
-   `AGGREGATION_WINDOW_MINUTES`: Time window for each stats-cron-job (default: `5`)

### Application Configuration

-   `LOG_LEVEL`: Logging level (default: `info`)
-   `LOG_FORMAT`: Log format - `json` or `text` (default: `json`)
-   `HEALTH_CHECK_PORT`: Port for health endpoints (default: `8084`)
-   `BATCH_SIZE`: Processing batch size (default: `1000`)
-   `MAX_RETRIES`: Maximum retry attempts (default: `3`)
-   `RETRY_DELAY_SECONDS`: Delay between retries (default: `5`)

## Installation and Setup

### Prerequisites

-   Go 1.21 or later
-   MongoDB 4.4 or later
-   Access to the analytics events collection

### Local Development

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd services/stats-cron-job
    ```

2. **Install dependencies**:

    ```bash
    go mod download
    ```

3. **Set up environment variables**:

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. **Run the service**:
    ```bash
    go run main.go
    ```

### Docker Deployment

1. **Build the Docker image**:

    ```bash
    docker build -t nanometrics-stats-cron-job .
    ```

2. **Run with Docker**:
    ```bash
    docker run -d \
      --name nanometrics-stats-cron-job \
      -e MONGODB_URI=mongodb://mongodb:27017/nanometrics \
      -e CRON_SCHEDULE="*/5 * * * *" \
      -p 8084:8084 \
      nanometrics-stats-cron-job
    ```

### Docker Compose

The service is included in the main docker-compose.yml file:

```yaml
stats-cron-job:
    build:
        context: ./services/stats-cron-job
    environment:
        MONGODB_URI: mongodb://admin:password@mongodb:27017/nanometrics?authSource=admin
        CRON_SCHEDULE: "*/5 * * * *"
    depends_on:
        - mongodb
```

## API Endpoints

### Health Check

-   **GET** `/health` - Returns service and database health status
-   **GET** `/ready` - Returns readiness status

Example health response:

```json
{
    "status": "OK",
    "timestamp": "2025-01-15T10:30:00Z",
    "services": {
        "mongodb": "healthy"
    }
}
```

## Data Schema

### Input: Analytics Events Collection

The service reads from the `analytics_events` collection which contains:

-   Event type (pageview, event)
-   Website ID
-   Session information
-   Geographic data
-   Device/browser information
-   Timestamps

### Output: Stats Collection

The service writes to the `stats` collection with the following structure:

```go
type AggregatedStats struct {
    WebsiteID         string
    PeriodStart       time.Time
    PeriodEnd         time.Time
    AggregationType   string  // "5min"

    // Basic metrics
    Pageviews         int64
    UniqueVisitors    int64
    UniqueSessions    int64
    Events            int64

    // Top lists
    TopPages          []PageStats
    TopReferrers      []ReferrerStats
    Countries         []CountryStats
    Browsers          []BrowserStats
    ScreenSizes       []ScreenStats
    Languages         []LanguageStats

    // Session metrics
    AverageSessionDuration float64
    BounceRate            float64

    CreatedAt         time.Time
    UpdatedAt         time.Time
}
```

## Monitoring and Logging

### Logging

The service uses structured logging with configurable levels:

-   `debug`: Detailed debugging information
-   `info`: General operational messages
-   `warn`: Warning conditions
-   `error`: Error conditions
-   `fatal`: Critical errors that cause the service to exit

### Health Monitoring

-   Health check endpoint at `:8084/health`
-   MongoDB connection monitoring
-   Automatic retry mechanisms for failed operations

### Metrics

The service logs the following metrics:

-   Aggregation duration
-   Number of websites processed
-   Processing errors
-   Database health status

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**:

    - Verify MongoDB URI and credentials
    - Check network connectivity
    - Ensure MongoDB is running and accessible

2. **Aggregation Failures**:

    - Check logs for specific error messages
    - Verify the analytics_events collection exists and has data
    - Ensure proper indexes are created for performance

3. **Performance Issues**:
    - Monitor stats-cron-job duration in logs
    - Consider adjusting batch size
    - Verify MongoDB indexes are properly configured

### Debug Mode

Enable debug logging to see detailed processing information:

```bash
export LOG_LEVEL=debug
```

## Development

### Project Structure

```
.
├── aggregator/         # Aggregation service logic
├── config/            # Configuration management
├── database/          # Database connection and utilities
├── models/            # Data models and structures
├── main.go           # Application entry point
├── Dockerfile        # Docker configuration
├── go.mod           # Go module definition
└── README.md        # This file
```

### Testing

```bash
go test ./...
```

### Building

```bash
go build -o stats-cron-job .
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
