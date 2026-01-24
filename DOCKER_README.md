# Docker Deployment - Quick Start

This guide will help you deploy your CRM application using Docker in just a few steps.

## One-Command Deployment

```bash
./deploy.sh
```

This interactive script will:
- Check all requirements
- Set up environment variables
- Build backend and frontend
- Start all services with Docker Compose
- Show you the access URLs

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Java 17 (for building backend)
- Maven 3.9+
- Node.js 20+
- At least 8GB RAM for Docker
- At least 20GB disk space

## Quick Setup

### Option 1: Automated Deployment (Recommended)

```bash
# Make the script executable (first time only)
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Option 2: Using Makefile

```bash
# Initialize (first time only)
make init

# Build and start everything
make build
make up

# Or in one command
make up-build
```

### Option 3: Manual Steps

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your values

# 2. Build backend
cd backend
mvn clean package -DskipTests
cd ..

# 3. Build frontend
cd frontend
npm install
npm run build
cd ..

# 4. Start services
docker-compose up -d
```

## Access Your Application

After deployment:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Health**: http://localhost:8000/actuator/health

## Common Commands

```bash
# Using Makefile (recommended)
make help              # Show all commands
make logs              # View all logs
make logs-api          # View API Gateway logs
make health            # Check service health
make restart           # Restart all services
make down              # Stop all services
make backup-db         # Backup database

# Using Docker Compose directly
docker-compose ps      # Show service status
docker-compose logs -f # Follow all logs
docker-compose restart # Restart services
docker-compose down    # Stop services
```

## Service Architecture

The application consists of:

### Core Services
- **API Gateway** (8000) - Entry point for all API requests
- **Frontend** (3000) - React UI served by Nginx

### Microservices
- **User Service** (8081) - Authentication & users
- **HR Service** (8082) - HR management
- **Lead Service** (8083) - Lead tracking
- **Call Service** (8084) - Call management
- **Campaign Service** (8085) - Marketing campaigns
- **Integration Service** (8086) - Third-party integrations
- **Notification Service** (8087) - Notifications
- **Billing Service** (8088) - Billing & payments
- **Reporting Service** (8089) - Reports & analytics
- **Customer Admin Service** (8090) - Customer management

### Infrastructure
- **PostgreSQL** (5432) - Database
- **Redis** (6379) - Cache
- **PgAdmin** (5050) - Database UI (optional)

## Troubleshooting

### Services won't start
```bash
# Check logs
make logs

# Check specific service
docker-compose logs -f user-service

# Restart services
make restart
```

### Port already in use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process or change port in .env
```

### Out of memory
- Increase Docker memory in Docker Desktop settings
- Minimum recommended: 8GB

### Database issues
```bash
# Check database
make shell-db

# Restart database
docker-compose restart postgres
```

## Development Workflow

### Making Changes

#### Backend Changes
```bash
# 1. Make code changes
# 2. Rebuild
cd backend && mvn clean package -DskipTests && cd ..
# 3. Restart service
docker-compose restart user-service
```

#### Frontend Changes
```bash
# 1. Make code changes
# 2. Rebuild and restart
make restart-frontend

# Or rebuild container
docker-compose build frontend
docker-compose up -d frontend
```

### Development Mode

Run frontend with hot reload:
```bash
make dev-frontend
```

Run backend services locally (without Docker):
```bash
make dev-backend
```

## Database Management

### Backup
```bash
make backup-db
```

### Restore
```bash
make restore-db BACKUP_FILE=backups/crm_backup_20240101_120000.sql
```

### Access Database
```bash
# PostgreSQL CLI
make shell-db

# PgAdmin UI
make pgadmin
# Then visit http://localhost:5050
```

## Monitoring

### Check Health
```bash
make health
```

### View Resource Usage
```bash
make stats
```

### View Logs
```bash
# All services
make logs

# Specific service
make logs-api
make logs-user
make logs-frontend
```

## Cleanup

### Stop Services
```bash
make down
```

### Remove Everything (including volumes)
```bash
make down-volumes
# WARNING: This deletes all data!
```

### Clean Docker System
```bash
make prune
# Removes all unused Docker resources
```

## Production Deployment

For production:

1. **Update .env file** with secure values:
   ```bash
   # Generate secure secrets
   JWT_SECRET=$(openssl rand -base64 64)
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Enable HTTPS** - Configure reverse proxy (nginx/traefik)

3. **Set resource limits** - Update docker-compose.yml

4. **Configure backups** - Set up automated database backups

5. **Enable monitoring** - Add Prometheus/Grafana

6. **Review security** - Check the security checklist in DOCKER_DEPLOYMENT.md

## Files Created

```
.
├── docker-compose.yml          # Main Docker Compose configuration
├── .env.example                # Example environment variables
├── .env                        # Your environment variables (git ignored)
├── Makefile                    # Convenient make commands
├── deploy.sh                   # Automated deployment script
├── DOCKER_DEPLOYMENT.md        # Detailed deployment guide
├── DOCKER_README.md            # This file
├── backend/
│   ├── Dockerfile              # Backend services Dockerfile
│   └── .dockerignore           # Backend Docker ignore file
└── frontend/
    ├── Dockerfile              # Frontend Dockerfile
    ├── nginx.conf              # Nginx configuration
    └── .dockerignore           # Frontend Docker ignore file
```

## Next Steps

1. ✅ Deploy application
2. 📝 Configure environment variables for your needs
3. 🔐 Set up authentication and create users
4. 📊 Import your data
5. 🎨 Customize frontend branding
6. 🔒 Set up HTTPS for production
7. 📈 Configure monitoring and logging
8. 💾 Set up automated backups

## Support

- **Full Documentation**: See DOCKER_DEPLOYMENT.md
- **View Logs**: `make logs`
- **Check Health**: `make health`
- **Get Help**: `make help`

## Tips

- Use `make help` to see all available commands
- Always check logs if something isn't working: `make logs`
- The first startup takes longer as services initialize
- Keep your .env file secure and never commit it to git
- Regular backups are crucial: `make backup-db`
