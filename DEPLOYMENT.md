# Deployment Guide

This guide provides instructions for deploying the OSRS Price Tracker application to production.

## Prerequisites

- Docker and Docker Compose installed on the server
- A domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Setup

1. Create a `.env.prod` file in the root directory with the following variables:

```env
# Database
POSTGRES_USER=osrsuser
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=osrsdb

# Backend
ENVIRONMENT=production
CORS_ORIGINS=https://your-domain.com

# Frontend
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_WS_URL=wss://your-domain.com
```

2. Update the domain names in the environment variables to match your actual domain.

## Building and Running

1. Build the production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Start the services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Check the logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## Nginx Configuration

The application includes a basic Nginx configuration in `frontend/nginx.conf`. If you're using a reverse proxy or load balancer, make sure to:

1. Configure SSL/TLS termination
2. Set up proper headers for security
3. Configure WebSocket proxy settings
4. Set up proper caching rules

## Monitoring

1. Set up monitoring for:
   - Container health
   - Database performance
   - API response times
   - WebSocket connections
   - Error rates

2. Configure logging:
   - Set up log rotation
   - Configure log aggregation
   - Set up error alerting

## Backup Strategy

1. Database backups:
   - Set up automated daily backups
   - Store backups in a secure location
   - Test backup restoration regularly

2. Configuration backups:
   - Backup environment files
   - Backup Nginx configurations
   - Backup SSL certificates

## Security Considerations

1. Update all passwords and secrets
2. Configure proper firewall rules
3. Enable HTTPS
4. Set up rate limiting
5. Configure CORS properly
6. Regular security updates

## Scaling

The application is designed to be scalable. To scale:

1. Increase the number of backend workers:
   - Update the `--workers` parameter in `backend/Dockerfile.prod`
   - Consider using a process manager like Gunicorn

2. Database scaling:
   - Consider read replicas for heavy read loads
   - Implement connection pooling
   - Monitor database performance

3. Frontend scaling:
   - Use a CDN for static assets
   - Implement proper caching strategies
   - Consider using a load balancer

## Troubleshooting

Common issues and solutions:

1. WebSocket connection issues:
   - Check proxy configuration
   - Verify SSL/TLS settings
   - Check firewall rules

2. Database connection issues:
   - Verify credentials
   - Check network connectivity
   - Monitor connection pool

3. Performance issues:
   - Check resource usage
   - Monitor response times
   - Review caching configuration

## Maintenance

Regular maintenance tasks:

1. Update dependencies
2. Monitor disk usage
3. Check logs for errors
4. Review security updates
5. Test backup restoration
6. Monitor performance metrics

## Rollback Procedure

In case of issues:

1. Stop the current deployment:
```bash
docker-compose -f docker-compose.prod.yml down
```

2. Restore from backup:
```bash
# Restore database
pg_restore -U osrsuser -d osrsdb backup.dump

# Restore configuration
cp backup/.env.prod .env.prod
```

3. Restart with previous version:
```bash
docker-compose -f docker-compose.prod.yml up -d
``` 