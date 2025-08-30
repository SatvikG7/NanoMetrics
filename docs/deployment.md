# Deployment Guide

*This documentation is in development.*

## Production Deployment

### Docker Compose Production

```bash
# Production deployment with external volumes and networks
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes

Kubernetes manifests coming soon.

### Cloud Providers

- AWS deployment guide - Coming soon
- Google Cloud deployment guide - Coming soon  
- Azure deployment guide - Coming soon

### Environment Configuration

Production environment variables and security considerations coming soon.

---

For now, please refer to the [main README](../README.md) for Docker Compose setup instructions.