# NanoMetrics - Privacy-First Web Analytics

<div align="center">
  <img src="web/public/globe.svg" alt="NanoMetrics Logo" width="120" height="120">
  <p><em>A lightweight, privacy-focused web analytics platform that respects user privacy while providing essential insights</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Docker Compose](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
  [![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black.svg)](https://nextjs.org/)
  [![Go](https://img.shields.io/badge/Go-1.21-00ADD8.svg)](https://golang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
</div>

## 🌟 Overview

NanoMetrics is a modern, open-source web analytics platform built with privacy at its core. Unlike traditional analytics solutions, NanoMetrics doesn't track personal data or use invasive tracking methods. Instead, it provides essential website insights while respecting user privacy and complying with privacy regulations like GDPR.

### ✨ Key Features

- **🔒 Privacy-First**: No personal data collection, IP anonymization, GDPR compliant
- **⚡ Real-time Analytics**: Live visitor tracking and event processing
- **📊 Essential Insights**: Page views, unique visitors, referrers, and custom events
- **🏗️ Microservices Architecture**: Scalable, maintainable, and resilient design
- **🐳 Docker-Ready**: Easy deployment with Docker Compose
- **🔓 Open Source**: Fully transparent, self-hosted solution
- **📱 Responsive Dashboard**: Beautiful, mobile-friendly analytics interface
- **🔄 Event-Driven**: Real-time processing with RabbitMQ message queues
- **📈 Custom Events**: Track user interactions and conversions
- **🌍 Geographic Insights**: Country-level visitor analytics (without IP tracking)

## 🏛️ Architecture

NanoMetrics follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │───▶│   API Gateway   │───▶│  Auth Service   │
│   (Next.js)     │    │   (Port 8080)   │    │   (Port 8081)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Producer Service│───▶│    RabbitMQ     │───▶│Consumer Service │
│   (Port 8082)   │    │  Message Broker │    │   (Port 8083)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Stats Cron Job  │    │    MongoDB      │
                       │   (Port 8085)   │    │    Database     │
                       └─────────────────┘    └─────────────────┘
                                │                       ▲
                                └───────────────────────┘
                                            │
                                            ▼
                                ┌─────────────────┐
                                │ Stats Service   │
                                │   (Port 8084)   │
                                └─────────────────┘
```

### 🧩 Services Overview

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **Web Frontend** | Next.js + TypeScript | 3000 | React-based dashboard and analytics interface |
| **API Gateway** | Spring Boot + Java 17 | 8080 | Central entry point, routing, and load balancing |
| **Auth Service** | Spring Boot + Java 17 | 8081 | User authentication, authorization, and site management |
| **Producer Service** | Node.js + Express | 8082 | Collects analytics events from tracking scripts |
| **Consumer Service** | Node.js + Express | 8083 | Processes events from queue and stores in database |
| **Stats Service** | Spring Boot + Java 17 | 8084 | Provides analytics data and aggregations via REST API |
| **Stats Cron Job** | Go | 8085 | Background service for data aggregation every 5 minutes |

### 🗄️ Data Flow

1. **Collection**: Client-side tracking script sends events to Producer Service
2. **Queueing**: Producer publishes events to RabbitMQ with enriched metadata
3. **Processing**: Consumer Service processes events and stores them in MongoDB
4. **Aggregation**: Go-based cron job aggregates raw events into statistics
5. **Visualization**: Web dashboard fetches data through Stats Service API

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (recommended)
- Or for local development:
  - Java 17+ (for Spring Boot services)
  - Node.js 18+ (for Node.js services)
  - Go 1.21+ (for aggregation service)
  - MongoDB 4.4+
  - RabbitMQ 3.8+

### 🐳 Docker Compose Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SatvikG7/NanoMetrics.git
   cd NanoMetrics
   ```

2. **Start all services**:
   ```bash
   docker compose up -d
   ```

3. **Access the application**:
   - **Web Dashboard**: http://localhost:3000
   - **API Gateway**: http://localhost:8080
   - **RabbitMQ Management**: http://localhost:15672 (admin/password)
   - **MongoDB**: localhost:27017

4. **Create your first site**:
   - Open http://localhost:3000
   - Sign up for an account
   - Add your website domain
   - Get the tracking script

### 🛠️ Local Development Setup

<details>
<summary>Click to expand local development instructions</summary>

#### 1. Start Infrastructure Services

```bash
# Start MongoDB
docker run -d --name nanometrics-mongo -p 27017:27017 mongo:7.0

# Start RabbitMQ
docker run -d --name nanometrics-rabbitmq -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=password \
  rabbitmq:4-management
```

#### 2. Configure Environment Variables

Copy `.env.example` to `.env` in each service directory and adjust settings:

```bash
# For each service directory
cp .env.example .env
```

#### 3. Start Services

**Java Services (API Gateway, Auth Service, Stats Service):**
```bash
cd services/auth-service
./mvnw spring-boot:run
```

**Node.js Services (Producer, Consumer):**
```bash
cd services/producer-service
npm install
npm run dev
```

**Go Service (Stats Cron Job):**
```bash
cd services/stats-cron-job
go mod download
go run main.go
```

**Web Frontend:**
```bash
cd web
npm install
npm run dev
```

</details>

## 📝 Usage

### Adding NanoMetrics to Your Website

1. **Create a Site**: Log into your NanoMetrics dashboard and add your website
2. **Copy Tracking Code**: Get your unique tracking script
3. **Install Script**: Add the script to your website's `<head>` section:

```html
<script
  src="http://localhost:3000/script.js"
  data-website-id="your-site-id"
  defer
></script>
```

> **Note**: In production, replace `localhost:3000` with your actual NanoMetrics domain.

### Tracking Custom Events

```javascript
// Track custom events
window.analytics.track('button_click', {
  button: 'signup',
  location: 'header'
});

// Track conversions
window.analytics.track('conversion', {
  type: 'purchase',
  value: 29.99
});
```

### API Endpoints

<details>
<summary>View API Documentation</summary>

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/user` - Get current user

#### Site Management
- `GET /sites` - List user's sites
- `POST /sites` - Create new site
- `PUT /sites/{id}` - Update site
- `DELETE /sites/{id}` - Delete site

#### Analytics
- `GET /stats/{siteId}` - Get site statistics
- `GET /stats/{siteId}/realtime` - Real-time statistics
- `GET /stats/{siteId}/events` - Event data
- `POST /track` - Track analytics event

</details>

## 🔧 Configuration

### Environment Variables

Each service can be configured using environment variables:

<details>
<summary>View Configuration Options</summary>

#### Producer Service
```env
PORT=8082
RABBITMQ_URL=amqp://localhost:5672
ANONYMIZE_IP=true
STORE_LOCATION=true
RATE_LIMIT_MAX_REQUESTS=1000
```

#### Consumer Service
```env
PORT=8083
RABBITMQ_URL=amqp://localhost:5672
MONGODB_URI=mongodb://localhost:27017/nanometrics
RETRY_ATTEMPTS=3
```

#### Stats Cron Job
```env
MONGODB_URI=mongodb://localhost:27017/nanometrics
CRON_SCHEDULE=*/5 * * * *
LOG_LEVEL=info
```

</details>

## 🚨 Troubleshooting

<details>
<summary>Common Issues and Solutions</summary>

### Docker Issues

**Services failing to start:**
```bash
# Check service logs
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]

# Clean restart all services
docker compose down && docker compose up -d
```

**Port conflicts:**
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :8080

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Issues

**MongoDB connection failed:**
- Ensure MongoDB container is running: `docker compose ps`
- Check MongoDB logs: `docker compose logs mongodb`
- Verify connection string in environment variables

**RabbitMQ connection failed:**
- Check RabbitMQ management UI: http://localhost:15672
- Default credentials: admin/password
- Restart RabbitMQ: `docker compose restart rabbitmq`

### Build Issues

**Java services failing to build:**
```bash
# Check Java version (requires 17+)
java -version

# Clean and rebuild
./mvnw clean compile
```

**Node.js services failing:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules && npm install
```

**Permission denied errors:**
```bash
# Fix file permissions
chmod +x mvnw
chmod +x services/*/mvnw
```

### Analytics Not Working

**Events not being tracked:**
1. Check browser console for JavaScript errors
2. Verify the tracking script is loaded
3. Ensure the `data-website-id` attribute is set correctly
4. Check network tab for blocked requests

**Dashboard showing no data:**
1. Verify events are being sent (check browser network tab)
2. Check producer service logs for errors
3. Ensure consumer service is processing events
4. Wait for the stats cron job to aggregate data (runs every 5 minutes)

</details>

## 🧪 Testing

Run tests for all services:

```bash
# Java services
./mvnw test

# Node.js services
npm test

# Go services
go test ./...

# Frontend
npm run test
```

## 📊 Monitoring

### Health Checks

Each service provides health check endpoints:

- Producer: `GET /health`
- Consumer: `GET /health`
- Stats Service: `GET /actuator/health`
- Stats Cron Job: `GET /health`

### Logging

All services use structured logging with configurable levels:
- **Debug**: Detailed debugging information
- **Info**: General operational messages
- **Warn**: Warning conditions
- **Error**: Error conditions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test` / `./mvnw test` / `go test`
5. Commit with descriptive messages
6. Push to your fork and submit a pull request

### Code Style

- **Java**: Follow Google Java Style Guide
- **JavaScript/TypeScript**: Use Prettier and ESLint
- **Go**: Use `go fmt` and `golint`

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Development Setup](docs/development.md)
- [Architecture Deep Dive](docs/architecture.md)

## 🔐 Security

### Privacy Features

- **No Personal Data**: We don't collect emails, names, or personal information
- **IP Anonymization**: IP addresses are hashed and anonymized
- **No Cookies**: We don't set tracking cookies
- **GDPR Compliant**: Privacy-by-design architecture
- **Data Retention**: Configurable data retention policies

### Reporting Security Issues

Please report security vulnerabilities privately to the maintainers.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the open-source community
- Inspired by privacy-focused analytics solutions
- Special thanks to all contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SatvikG7/NanoMetrics/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SatvikG7/NanoMetrics/discussions)
- **Documentation**: [Wiki](https://github.com/SatvikG7/NanoMetrics/wiki)

---

<div align="center">
  <p><strong>NanoMetrics</strong> - Analytics that respect privacy</p>
  <p>Made with ❤️ for a privacy-first web</p>
</div>
