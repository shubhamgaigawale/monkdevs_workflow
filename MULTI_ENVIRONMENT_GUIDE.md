# Multi-Environment Deployment Guide

Complete guide for deploying your CRM application to multiple environments (Development, Staging, Production).

## Overview

This deployment system allows you to run multiple isolated environments simultaneously, each with its own:
- Database (different ports)
- Redis instance (different ports)
- Application services (different ports)
- Configuration (separate .env files)
- Docker containers (isolated networks)

## Quick Start

### 1. Deploy to Development

```bash
./deploy-env.sh development --build
```

### 2. Deploy to Staging

```bash
./deploy-env.sh staging --build
```

### 3. Deploy to Production

```bash
./deploy-env.sh production --build
```

## Environment Configuration

### Development Environment
- **Purpose**: Local development and testing
- **Config File**: `.env.development`
- **Ports**: 3000 (frontend), 8000 (API), 5432 (DB), 6379 (Redis)
- **Features**: Debug logging, SQL logging, PgAdmin enabled
- **Project Name**: `crm_development`

### Staging Environment
- **Purpose**: Pre-production testing
- **Config File**: `.env.staging`
- **Ports**: 3001 (frontend), 8001 (API), 5433 (DB), 6380 (Redis)
- **Features**: INFO logging, resource limits, always restart
- **Project Name**: `crm_staging`

### Production Environment
- **Purpose**: Live production system
- **Config File**: `.env.production`
- **Ports**: 80 (frontend), 8002 (API), 5434 (DB), 6381 (Redis)
- **Features**: WARN logging, strict security, log rotation, backups
- **Project Name**: `crm_production`

## Setup Instructions

### First Time Setup

1. **Create environment files from examples:**

```bash
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

2. **Update each environment file with your values:**

For **Development** (`.env.development`):
```bash
# Can use simple passwords
POSTGRES_PASSWORD=dev_password_123
JWT_SECRET=development-jwt-secret-key...
```

For **Staging** (`.env.staging`):
```bash
# Use secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
```

For **Production** (`.env.production`):
```bash
# Must use very secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
# Update API URL
VITE_API_URL=https://api.yourcompany.com
```

3. **Build backend services:**

```bash
cd backend
mvn clean package -DskipTests
cd ..
```

4. **Deploy to desired environment:**

```bash
# Development
./deploy-env.sh development --build

# Staging
./deploy-env.sh staging --build

# Production
./deploy-env.sh production --build
```

## Using the Scripts

### deploy-env.sh - Environment Deployment

Deploy to specific environment:

```bash
# Deploy development (without rebuild)
./deploy-env.sh development

# Deploy staging with rebuild
./deploy-env.sh staging --build

# Deploy production with rebuild
./deploy-env.sh production --build

# Short forms also work
./deploy-env.sh dev --build
./deploy-env.sh stage --build
./deploy-env.sh prod --build
```

### manage-env.sh - Environment Management

Manage running environments:

```bash
# Start environment
./manage-env.sh start development

# Stop environment
./manage-env.sh stop staging

# Restart environment
./manage-env.sh restart production

# View status
./manage-env.sh status development

# View logs
./manage-env.sh logs staging

# Check health
./manage-env.sh health production

# Backup database
./manage-env.sh backup production

# Restore database
./manage-env.sh restore production backups/production/backup_20240124.sql

# List all environments
./manage-env.sh list

# Clean environment (removes everything)
./manage-env.sh clean development
```

## Running Multiple Environments Simultaneously

You can run all three environments at the same time on the same server:

```bash
# Start development
./deploy-env.sh development

# Start staging (different ports)
./deploy-env.sh staging

# Start production (different ports)
./deploy-env.sh production

# Check all environments
./manage-env.sh list
```

Access them at:
- **Development**: http://localhost:3000
- **Staging**: http://localhost:3001
- **Production**: http://localhost (port 80)

## Docker Compose Commands

### Direct Docker Compose Usage

```bash
# Development
docker-compose -p crm_development --env-file .env.development -f docker-compose.yml -f docker-compose.dev.yml up -d

# Staging
docker-compose -p crm_staging --env-file .env.staging -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production
docker-compose -p crm_production --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### View logs for specific environment

```bash
docker-compose -p crm_development logs -f
docker-compose -p crm_staging logs -f
docker-compose -p crm_production logs -f
```

### Stop specific environment

```bash
docker-compose -p crm_development down
docker-compose -p crm_staging down
docker-compose -p crm_production down
```

## Port Configuration

### Default Ports by Environment

| Service | Development | Staging | Production |
|---------|------------|---------|------------|
| Frontend | 3000 | 3001 | 80 |
| API Gateway | 8000 | 8001 | 8002 |
| User Service | 8081 | 8091 | 8101 |
| HR Service | 8082 | 8092 | 8102 |
| Lead Service | 8083 | 8093 | 8103 |
| Call Service | 8084 | 8094 | 8104 |
| Campaign Service | 8085 | 8095 | 8105 |
| Integration Service | 8086 | 8096 | 8106 |
| Notification Service | 8087 | 8097 | 8107 |
| Billing Service | 8088 | 8098 | 8108 |
| Reporting Service | 8089 | 8099 | 8109 |
| Customer Admin | 8090 | 8100 | 8110 |
| PostgreSQL | 5432 | 5433 | 5434 |
| Redis | 6379 | 6380 | 6381 |
| PgAdmin | 5050 | 5051 | 5052 |

You can customize these in each `.env.*` file.

## Environment-Specific Features

### Development Features
- ✅ Debug logging enabled
- ✅ SQL query logging
- ✅ PgAdmin enabled by default
- ✅ Hot reload support
- ✅ Swagger UI enabled
- ✅ Detailed error messages

### Staging Features
- ✅ INFO level logging
- ✅ Resource limits configured
- ✅ Automatic restart on failure
- ✅ Production-like environment
- ✅ Swagger UI enabled
- ✅ Performance monitoring

### Production Features
- ✅ WARN level logging only
- ✅ Strict resource limits
- ✅ Log rotation (10MB, 3 files)
- ✅ Redis password protection
- ✅ Automatic restarts
- ✅ Health checks
- ✅ Backup volumes
- ✅ PgAdmin disabled by default
- ✅ Swagger UI disabled
- ✅ Security hardened

## Database Management

### Backup Database

```bash
# Backup development
./manage-env.sh backup development

# Backup staging
./manage-env.sh backup staging

# Backup production (creates timestamped backup)
./manage-env.sh backup production
```

Backups are stored in `backups/[environment]/`

### Restore Database

```bash
# Restore production from backup
./manage-env.sh restore production backups/production/backup_20240124_120000.sql

# Restore staging from backup
./manage-env.sh restore staging backups/staging/backup_20240124_120000.sql
```

### Copy Data Between Environments

```bash
# 1. Backup production
./manage-env.sh backup production

# 2. Restore to staging
LATEST_BACKUP=$(ls -t backups/production/*.sql | head -1)
./manage-env.sh restore staging $LATEST_BACKUP
```

## Monitoring & Health Checks

### Check Environment Health

```bash
# Check development health
./manage-env.sh health development

# Check all environments
for env in development staging production; do
    echo "=== $env ==="
    ./manage-env.sh health $env
    echo ""
done
```

### View Logs

```bash
# Follow logs for development
./manage-env.sh logs development

# View specific service logs
docker-compose -p crm_production logs -f api-gateway
docker-compose -p crm_staging logs -f user-service
```

### Check Status

```bash
# Status of all environments
./manage-env.sh list

# Status of specific environment
./manage-env.sh status production
```

## Deployment Workflows

### Typical Development Workflow

```bash
# 1. Start development environment
./deploy-env.sh development

# 2. Make code changes

# 3. Rebuild and restart
cd backend && mvn package -DskipTests && cd ..
docker-compose -p crm_development restart user-service

# 4. View logs
./manage-env.sh logs development
```

### Staging Deployment Workflow

```bash
# 1. Deploy to staging
./deploy-env.sh staging --build

# 2. Run tests
# Run your test suite against staging

# 3. If tests pass, proceed to production
```

### Production Deployment Workflow

```bash
# 1. Backup current production
./manage-env.sh backup production

# 2. Deploy new version
./deploy-env.sh production --build

# 3. Monitor health
./manage-env.sh health production

# 4. Check logs
./manage-env.sh logs production

# 5. If issues, rollback using backup
# ./manage-env.sh restore production backups/production/backup_YYYYMMDD_HHMMSS.sql
```

## Security Best Practices

### For All Environments

1. **Use environment-specific passwords**
   - Never reuse passwords across environments
   - Use strong, random passwords

2. **Secure JWT secrets**
   ```bash
   # Generate secure secrets
   openssl rand -base64 64
   ```

3. **Keep .env files secure**
   - Never commit to git (in .gitignore)
   - Restrict file permissions
   ```bash
   chmod 600 .env.*
   ```

### For Production

1. **Use strong passwords**
2. **Enable Redis password** (already configured in prod)
3. **Disable unnecessary services** (PgAdmin, Swagger)
4. **Set up SSL/TLS** (use reverse proxy)
5. **Configure firewall rules**
6. **Regular backups**
7. **Monitor logs and metrics**

## Troubleshooting

### Port Conflicts

If ports are in use:

```bash
# Check what's using the port
lsof -i :8000

# Change port in environment file
vim .env.staging
# Update: API_GATEWAY_PORT=8011

# Redeploy
./deploy-env.sh staging
```

### Services Not Starting

```bash
# Check logs
./manage-env.sh logs production

# Check specific service
docker-compose -p crm_production logs user-service

# Restart specific service
docker-compose -p crm_production restart user-service
```

### Database Connection Issues

```bash
# Check database is running
docker-compose -p crm_production ps postgres

# Check database logs
docker-compose -p crm_production logs postgres

# Access database shell
docker exec -it crm_production_postgres_1 psql -U crm_user -d crm_production_db
```

### Clean Start

```bash
# Stop and remove everything for environment
./manage-env.sh clean development

# Redeploy fresh
./deploy-env.sh development --build
```

## Advanced Usage

### Custom Environment

Create a custom environment (e.g., testing):

```bash
# 1. Create config
cp .env.staging.example .env.testing

# 2. Update ports and settings in .env.testing

# 3. Deploy
./deploy-env.sh testing --build
```

### Resource Limits

Edit `docker-compose.prod.yml` to adjust resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
    reservations:
      cpus: '2'
      memory: 2G
```

### Scaling Services

```bash
# Scale user service in production
docker-compose -p crm_production up -d --scale user-service=3
```

## File Structure

```
.
├── deploy-env.sh                    # Environment deployment script
├── manage-env.sh                    # Environment management script
├── .env.development.example         # Development config template
├── .env.staging.example             # Staging config template
├── .env.production.example          # Production config template
├── .env.development                 # Development config (git ignored)
├── .env.staging                     # Staging config (git ignored)
├── .env.production                  # Production config (git ignored)
├── docker-compose.yml               # Base compose file
├── docker-compose.dev.yml           # Development overrides
├── docker-compose.staging.yml       # Staging overrides
├── docker-compose.prod.yml          # Production overrides
└── backups/
    ├── development/                 # Dev backups
    ├── staging/                     # Staging backups
    └── production/                  # Production backups
```

## Summary Commands

```bash
# Deploy
./deploy-env.sh [dev|staging|prod] [--build]

# Manage
./manage-env.sh [start|stop|restart|status|logs|health|backup|restore|clean|list] [environment]

# List all environments
./manage-env.sh list

# Health check
./manage-env.sh health production

# Backup
./manage-env.sh backup production

# View logs
./manage-env.sh logs staging
```

## Next Steps

1. ✅ Create environment files from examples
2. ✅ Update configurations with secure values
3. ✅ Deploy to development for testing
4. ✅ Deploy to staging for UAT
5. ✅ Deploy to production when ready
6. 📊 Set up monitoring (Prometheus/Grafana)
7. 🔒 Configure SSL/TLS certificates
8. 💾 Automate backups
9. 🚨 Set up alerting
10. 📝 Document environment-specific procedures

## Support

For issues:
- Check logs: `./manage-env.sh logs [environment]`
- View status: `./manage-env.sh list`
- Health check: `./manage-env.sh health [environment]`
- See main guides: DOCKER_DEPLOYMENT.md, DOCKER_README.md
