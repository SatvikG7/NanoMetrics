# Stats Service

This is the Stats Service for NanoMetrics, responsible for fetching and aggregating analytics data from MongoDB.

## Features

-   Fetch real-time analytics statistics
-   Aggregate data for different time periods
-   MongoDB integration for analytics events
-   RESTful API endpoints
-   Spring Boot application

## API Endpoints

### Get Stats

-   `GET /api/stats/{siteId}` - Get aggregated stats for a site
-   Query parameters:
    -   `startDate` (optional) - Start date (ISO format)
    -   `endDate` (optional) - End date (ISO format)

### Real-time Stats

-   `GET /api/stats/{siteId}/realtime` - Get real-time statistics

### Events

-   `GET /api/stats/{siteId}/events` - Get paginated analytics events
-   Query parameters:
    -   `startDate` (optional)
    -   `endDate` (optional)
    -   `page` (default: 0)
    -   `size` (default: 20)
    -   `sortBy` (default: timestamp)
    -   `sortDirection` (default: desc)

### Aggregated Stats

-   `GET /api/stats/{siteId}/aggregated` - Get aggregated statistics
-   Query parameters:
    -   `periodType` (default: daily) - daily, weekly, monthly
    -   `startDate` (optional)
    -   `endDate` (optional)

## Configuration

The service connects to MongoDB for analytics data storage. Configure the connection in `application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/nanometrics
spring.data.mongodb.database=nanometrics
```

## Running the Service

```bash
./mvnw spring-boot:run
```

Or build and run the JAR:

```bash
./mvnw clean package
java -jar target/StatsService-0.0.1-SNAPSHOT.jar
```

## Docker

Build the Docker image:

```bash
docker build -t stats-service .
```

Run the container:

```bash
docker run -p 8083:8083 stats-service
```
