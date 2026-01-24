# Multi-Environment Deployment - Quick Reference

Deploy your CRM application to Development, Staging, and Production environments with isolated configurations.

## 🚀 Quick Start

### Deploy to Any Environment

```bash
# Development
./deploy-env.sh development --build

# Staging
./deploy-env.sh staging --build

# Production
./deploy-env.sh production --build
```

## 📋 Setup (First Time)

```bash
# 1. Create environment files
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production

# 2. Update each file with your configuration
# Edit .env.development, .env.staging, .env.production

# 3. Generate secure secrets for staging/production
openssl rand -base64 64  # Use for JWT_SECRET
openssl rand -base64 32  # Use for POSTGRES_PASSWORD

# 4. Deploy
./deploy-env.sh development --build
```

## 🎯 Environments

| Environment | Ports | Use Case | Config File |
|------------|-------|----------|-------------|
| **Development** | 3000, 8000 | Local dev & testing | `.env.development` |
| **Staging** | 3001, 8001 | Pre-production testing | `.env.staging` |
| **Production** | 80, 8002 | Live production | `.env.production` |

## 🛠️ Management Commands

```bash
# Deploy
./deploy-env.sh [dev|staging|prod] [--build]

# Start/Stop
./manage-env.sh start production
./manage-env.sh stop staging
./manage-env.sh restart development

# Status & Health
./manage-env.sh list                    # All environments
./manage-env.sh status production       # Specific environment
./manage-env.sh health staging          # Health check

# Logs
./manage-env.sh logs development        # Follow logs

# Database
./manage-env.sh backup production       # Backup database
./manage-env.sh restore prod backup.sql # Restore database

# Clean
./manage-env.sh clean development       # Remove everything
```

## 📊 Environment Details

### Development
- **URL**: http://localhost:3000
- **API**: http://localhost:8000
- **Features**: Debug logging, SQL logging, PgAdmin enabled
- **Database Port**: 5432
- **Redis Port**: 6379

### Staging
- **URL**: http://localhost:3001
- **API**: http://localhost:8001
- **Features**: INFO logging, resource limits, production-like
- **Database Port**: 5433
- **Redis Port**: 6380

### Production
- **URL**: http://localhost (port 80)
- **API**: http://localhost:8002
- **Features**: WARN logging, security hardened, auto-restart
- **Database Port**: 5434
- **Redis Port**: 6381

## 🔄 Common Workflows

### Deploy New Code to Staging

```bash
# 1. Build backend
cd backend && mvn clean package -DskipTests && cd ..

# 2. Deploy to staging
./deploy-env.sh staging --build

# 3. Check health
./manage-env.sh health staging

# 4. View logs
./manage-env.sh logs staging
```

### Promote Staging to Production

```bash
# 1. Backup production
./manage-env.sh backup production

# 2. Deploy to production
./deploy-env.sh production --build

# 3. Monitor health
./manage-env.sh health production
```

### Copy Production Data to Staging

```bash
# 1. Backup production
./manage-env.sh backup production

# 2. Find latest backup
ls -t backups/production/*.sql | head -1

# 3. Restore to staging
./manage-env.sh restore staging backups/production/backup_YYYYMMDD_HHMMSS.sql
```

## 🔧 Port Configuration

All ports are configurable in `.env.*` files:

```bash
# Frontend
FRONTEND_PORT=3000

# API Gateway
API_GATEWAY_PORT=8000

# Services (8081-8090 for dev, 8091-8100 for staging, 8101-8110 for prod)
USER_SERVICE_PORT=8081
HR_SERVICE_PORT=8082
# ... etc
```

## 🏃 Running Multiple Environments

Run all three environments simultaneously:

```bash
# Start all
./deploy-env.sh development
./deploy-env.sh staging
./deploy-env.sh production

# Check all
./manage-env.sh list

# Access
# Dev:     http://localhost:3000
# Staging: http://localhost:3001
# Prod:    http://localhost (or :80)
```

## 📦 What's Included

### Scripts
- **deploy-env.sh** - Deploy to any environment
- **manage-env.sh** - Manage environments (start/stop/logs/backup)

### Configuration Files
- **.env.development.example** - Dev config template
- **.env.staging.example** - Staging config template
- **.env.production.example** - Production config template

### Docker Compose Files
- **docker-compose.yml** - Base configuration
- **docker-compose.dev.yml** - Development overrides
- **docker-compose.staging.yml** - Staging overrides
- **docker-compose.prod.yml** - Production overrides

## 🔒 Security Checklist

### Development
- [x] Simple passwords OK
- [x] Debug enabled
- [x] PgAdmin enabled

### Staging
- [ ] Secure passwords
- [ ] INFO logging
- [ ] Swagger enabled for testing
- [ ] Production-like config

### Production
- [ ] Very secure passwords (generated with openssl)
- [ ] Strong JWT secret (64+ characters)
- [ ] WARN logging only
- [ ] Swagger disabled
- [ ] PgAdmin disabled
- [ ] SSL/TLS configured
- [ ] Firewall rules set
- [ ] Backups automated
- [ ] Monitoring enabled

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :8000

# Change port in .env file
vim .env.staging
# Update: API_GATEWAY_PORT=8011
```

### Services Won't Start
```bash
# Check logs
./manage-env.sh logs production

# Restart
./manage-env.sh restart production

# Clean start
./manage-env.sh clean production
./deploy-env.sh production --build
```

### Database Issues
```bash
# Check database logs
docker-compose -p crm_production logs postgres

# Access database
docker exec -it crm_production_postgres_1 psql -U crm_user -d crm_production_db
```

## 📚 Full Documentation

- **MULTI_ENVIRONMENT_GUIDE.md** - Complete multi-environment guide
- **DOCKER_DEPLOYMENT.md** - Detailed Docker deployment guide
- **DOCKER_README.md** - Docker quick start guide

## 🎯 Examples

```bash
# Example 1: Fresh development deployment
./deploy-env.sh development --build

# Example 2: Quick staging restart
./manage-env.sh restart staging

# Example 3: Production backup before deploy
./manage-env.sh backup production
./deploy-env.sh production --build

# Example 4: View all environment status
./manage-env.sh list

# Example 5: Copy staging DB to development
./manage-env.sh backup staging
BACKUP=$(ls -t backups/staging/*.sql | head -1)
./manage-env.sh restore development $BACKUP
```

## ✅ Summary

| Task | Command |
|------|---------|
| Deploy environment | `./deploy-env.sh [env] --build` |
| List all environments | `./manage-env.sh list` |
| Start environment | `./manage-env.sh start [env]` |
| Stop environment | `./manage-env.sh stop [env]` |
| View logs | `./manage-env.sh logs [env]` |
| Check health | `./manage-env.sh health [env]` |
| Backup database | `./manage-env.sh backup [env]` |
| Restore database | `./manage-env.sh restore [env] [file]` |
| Clean environment | `./manage-env.sh clean [env]` |

Where `[env]` = `development`, `staging`, or `production`

---

**Need Help?**
- Run `./manage-env.sh help` for all commands
- See `MULTI_ENVIRONMENT_GUIDE.md` for detailed guide
- Check `./manage-env.sh list` for environment status
