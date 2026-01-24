# EC2 Deployment Guide - Simple Setup

Deploy your CRM application to AWS EC2 instance.

## Prerequisites on EC2

Your EC2 instance needs:
- Java 17
- Maven
- Node.js 20+
- PostgreSQL
- Redis
- Git (to clone your repo)

## Quick EC2 Setup

### 1. SSH into your EC2 instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
# or
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# OR
sudo yum update -y  # Amazon Linux

# Install Java 17
sudo apt install openjdk-17-jdk -y  # Ubuntu
# OR
sudo yum install java-17-amazon-corretto -y  # Amazon Linux

# Install Maven
sudo apt install maven -y  # Ubuntu
# OR
sudo yum install maven -y  # Amazon Linux

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs  # Ubuntu
# OR
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y  # Ubuntu
# OR
sudo yum install postgresql15-server -y  # Amazon Linux

# Install Redis
sudo apt install redis-server -y  # Ubuntu
# OR
sudo yum install redis -y  # Amazon Linux
```

### 3. Start PostgreSQL and Redis

```bash
# PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### 4. Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE crm_db;
CREATE USER crm_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
\q

# Allow connections (edit postgresql config if needed)
```

### 5. Clone Your Repository

```bash
cd ~
git clone https://github.com/yourusername/your-crm-repo.git
cd your-crm-repo
```

### 6. Build Application

```bash
# Build backend
cd backend
mvn clean package -DskipTests
cd ..

# Build frontend
cd frontend
npm install
npm run build
cd ..
```

### 7. Run Application

```bash
./run-production.sh
```

## Configure EC2 Security Group

Add these inbound rules to your EC2 security group:

| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | Your IP | SSH |
| 3000 | TCP | 0.0.0.0/0 | Frontend |
| 8000 | TCP | 0.0.0.0/0 | API Gateway |
| 5432 | TCP | Security Group | PostgreSQL (internal) |
| 6379 | TCP | Security Group | Redis (internal) |

## Access Your Application

After deployment:
- **Frontend**: http://YOUR_EC2_PUBLIC_IP:3000
- **API Gateway**: http://YOUR_EC2_PUBLIC_IP:8000

## Make Services Auto-Start on Reboot

To ensure services start automatically when EC2 reboots, you can:

### Option 1: Add to crontab

```bash
crontab -e

# Add this line:
@reboot cd /home/ubuntu/your-crm-repo && ./run-production.sh
```

### Option 2: Use the setup script (recommended)

Run:
```bash
./setup-ec2-autostart.sh
```

This will create a systemd service that auto-starts your application.

## Useful Commands

```bash
# Check if services are running
lsof -i :8000
lsof -i :3000

# View logs
tail -f logs/api-gateway.log
tail -f logs/user-service.log

# Stop all services
./stop-all-services.sh

# Restart services
./stop-all-services.sh
./run-production.sh
```

## Troubleshooting

### Services won't start

```bash
# Check logs
tail -f logs/api-gateway.log

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if Redis is running
sudo systemctl status redis

# Check if ports are free
sudo lsof -i :8000
```

### Can't access from browser

1. Check EC2 Security Group has port 3000 and 8000 open
2. Check if services are running: `lsof -i :3000`
3. Try accessing with EC2 public IP: `http://YOUR_PUBLIC_IP:3000`

### Out of Memory

```bash
# Check memory
free -h

# If low memory, you may need larger EC2 instance (t2.medium or larger recommended)
```

## Production Recommendations

### 1. Use Elastic IP
Attach an Elastic IP to your EC2 so IP doesn't change on restart.

### 2. Setup Domain
Point your domain to EC2 IP:
- Frontend: app.yourdomain.com → EC2_IP:3000
- API: api.yourdomain.com → EC2_IP:8000

### 3. Add NGINX Reverse Proxy (Optional)

Install NGINX to serve on port 80:

```bash
sudo apt install nginx -y

# Configure NGINX to proxy:
# Port 80 → 3000 (frontend)
# Port 80/api → 8000 (backend)
```

### 4. Enable HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### 5. Setup Monitoring

```bash
# Install monitoring tools
sudo apt install htop -y

# Monitor in real-time
htop
```

### 6. Regular Backups

```bash
# Backup database daily
crontab -e

# Add:
0 2 * * * pg_dump -U crm_user crm_db > /home/ubuntu/backups/crm_$(date +\%Y\%m\%d).sql
```

## EC2 Instance Recommendations

### Minimum (for testing):
- Instance Type: t2.small
- RAM: 2GB
- Storage: 20GB

### Recommended (for production):
- Instance Type: t2.medium or t3.medium
- RAM: 4GB
- Storage: 30GB
- Enable auto-scaling if needed

## Cost Optimization

1. Use **t2.micro** for initial testing (free tier eligible)
2. Upgrade to **t2.medium** for production
3. Stop instance when not in use (development)
4. Use **Reserved Instances** for long-term production

## Complete Deployment Script

```bash
#!/bin/bash
# Run this on your EC2 instance

# Update system
sudo apt update && sudo apt upgrade -y

# Install everything
sudo apt install openjdk-17-jdk maven nodejs postgresql redis-server git -y

# Start services
sudo systemctl start postgresql redis
sudo systemctl enable postgresql redis

# Setup database
sudo -u postgres psql -c "CREATE DATABASE crm_db;"
sudo -u postgres psql -c "CREATE USER crm_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;"

# Clone and build
cd ~
git clone YOUR_REPO_URL
cd your-crm-repo

# Build
cd backend && mvn clean package -DskipTests && cd ..
cd frontend && npm install && npm run build && cd ..

# Run
./run-production.sh

echo "Deployment complete!"
echo "Access frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
```

## Summary

1. ✅ Launch EC2 instance
2. ✅ Install Java, Maven, Node.js, PostgreSQL, Redis
3. ✅ Clone your repository
4. ✅ Build backend and frontend
5. ✅ Configure Security Groups (ports 3000, 8000)
6. ✅ Run `./run-production.sh`
7. ✅ Access via http://EC2_PUBLIC_IP:3000

Your CRM is now running on EC2! 🚀
