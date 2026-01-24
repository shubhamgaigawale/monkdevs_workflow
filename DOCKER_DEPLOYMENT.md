# Docker Deployment Guide

Complete guide to deploy your CRM application using Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 8GB RAM available for Docker
- At least 20GB disk space

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` file with your values (especially change passwords in production):

```bash
# Example secure password generation
JWT_SECRET=$(openssl rand -base64 64)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

### 2. Build Backend Services

First, build all backend services with Maven:

```bash
cd backend
mvn clean package -DskipTests
cd ..
```

This will create JAR files in each service's `target/` directory.

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- 10 Backend microservices (ports 8081-8090)
- API Gateway (port 8000)
- Frontend (port 3000)

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Health Check**: http://localhost:8000/actuator/health

## Service Architecture

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application (Nginx) |
| API Gateway | 8000 | Spring Cloud Gateway |
| User Service | 8081 | Authentication & user management |
| HR Service | 8082 | HR operations |
| Lead Service | 8083 | Lead management |
| Call Service | 8084 | Call tracking |
| Campaign Service | 8085 | Campaign management |
| Integration Service | 8086 | Third-party integrations |
| Notification Service | 8087 | Notifications |
| Billing Service | 8088 | Billing & payments |
| Reporting Service | 8089 | Reports & analytics |
| Customer Admin Service | 8090 | Customer administration |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| PgAdmin | 5050 | Database UI (optional) |

## Common Commands

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f frontend
docker-compose logs -f user-service
```

### Check service status

```bash
docker-compose ps
```

### Restart services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart api-gateway
```

### Stop services

```bash
docker-compose stop
```

### Start stopped services

```bash
docker-compose start
```

### Stop and remove containers

```bash
docker-compose down
```

### Stop and remove containers with volumes (WARNING: deletes data)

```bash
docker-compose down -v
```

### Rebuild services

```bash
# Rebuild specific service
docker-compose build frontend

# Rebuild all services
docker-compose build

# Rebuild and restart
docker-compose up -d --build
```

### Scale services (if needed)

```bash
# Scale a specific service
docker-compose up -d --scale user-service=3
```

## Development Workflow

### Making code changes

#### Backend changes:

```bash
# 1. Make your code changes
# 2. Rebuild the service
cd backend
mvn clean package -DskipTests
cd ..

# 3. Restart the specific service
docker-compose restart user-service
```

#### Frontend changes:

```bash
# 1. Make your code changes
# 2. Rebuild and restart
docker-compose build frontend
docker-compose up -d frontend
```

## Database Management

### Access PostgreSQL CLI

```bash
docker exec -it crm-postgres psql -U crm_user -d crm_db
```

### Backup database

```bash
docker exec crm-postgres pg_dump -U crm_user crm_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore database

```bash
cat backup_file.sql | docker exec -i crm-postgres psql -U crm_user -d crm_db
```

### Access PgAdmin (Optional)

Start with tools profile:

```bash
docker-compose --profile tools up -d pgadmin
```

Access at http://localhost:5050
- Email: admin@crm.local (from .env)
- Password: admin (from .env)

## Monitoring & Health Checks

### Check health of all services

```bash
# API Gateway health
curl http://localhost:8000/actuator/health

# Individual service health
curl http://localhost:8081/actuator/health  # User Service
curl http://localhost:8082/actuator/health  # HR Service
# ... etc
```

### Monitor resource usage

```bash
docker stats
```

## Troubleshooting

### Service won't start

1. Check logs:
   ```bash
   docker-compose logs -f <service-name>
   ```

2. Check if port is already in use:
   ```bash
   lsof -i :<port-number>
   ```

3. Verify dependencies are healthy:
   ```bash
   docker-compose ps
   ```

### Database connection issues

1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify connection from service:
   ```bash
   docker exec -it crm-user-service ping postgres
   ```

### Out of memory errors

1. Increase Docker memory limit in Docker Desktop settings
2. Reduce service heap size:
   ```yaml
   command: ["java", "-Xmx512m", "-jar", "/app/app.jar"]
   ```

### Service containers keep restarting

1. Check health check endpoint:
   ```bash
   docker exec -it <container-name> wget -O- http://localhost:8081/actuator/health
   ```

2. Increase health check start period in docker-compose.yml:
   ```yaml
   healthcheck:
     start_period: 120s  # Increase from 60s
   ```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate strong JWT secret (min 64 characters)
- [ ] Use environment-specific configuration
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Enable container security scanning
- [ ] Implement log aggregation
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure backup strategy
- [ ] Implement CI/CD pipeline

### Performance Optimization

1. **Use production profiles**:
   ```bash
   SPRING_PROFILES_ACTIVE=prod
   NODE_ENV=production
   ```

2. **Optimize Java heap size**:
   ```yaml
   command: ["java", "-Xms512m", "-Xmx1024m", "-jar", "/app/app.jar"]
   ```

3. **Enable connection pooling**:
   Already configured in application.yml for each service

4. **Use read replicas for database**:
   Configure in docker-compose.yml for high-traffic scenarios

### Backup Strategy

1. **Database backups**:
   ```bash
   # Daily backup script
   docker exec crm-postgres pg_dump -U crm_user crm_db > /backups/crm_$(date +%Y%m%d).sql
   ```

2. **Volume backups**:
   ```bash
   docker run --rm -v crm_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
   ```

## Clean Up

### Remove all containers and volumes

```bash
docker-compose down -v
```

### Remove all images

```bash
docker-compose down --rmi all
```

### Clean up Docker system

```bash
docker system prune -a --volumes
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f <service-name>`
2. Verify service health: `docker-compose ps`
3. Review this guide's troubleshooting section
4. Check service-specific logs in backend/<service>/logs/

## Next Steps

1. Configure environment-specific settings
2. Set up CI/CD pipeline
3. Implement monitoring solution
4. Configure automated backups
5. Set up log aggregation
6. Implement security scanning
7. Load testing and optimization
