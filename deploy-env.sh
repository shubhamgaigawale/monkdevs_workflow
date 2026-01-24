#!/bin/bash

# Multi-Environment Deployment Script
# Usage: ./deploy-env.sh [environment] [options]
# Example: ./deploy-env.sh production --build

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Parse arguments
ENVIRONMENT=${1:-development}
BUILD_FLAG=${2:-}

# Validate environment
case $ENVIRONMENT in
    development|dev)
        ENV="development"
        ENV_FILE=".env.development"
        COMPOSE_FILE="docker-compose.yml"
        COMPOSE_OVERRIDE="docker-compose.dev.yml"
        ;;
    staging|stage)
        ENV="staging"
        ENV_FILE=".env.staging"
        COMPOSE_FILE="docker-compose.yml"
        COMPOSE_OVERRIDE="docker-compose.staging.yml"
        ;;
    production|prod)
        ENV="production"
        ENV_FILE=".env.production"
        COMPOSE_FILE="docker-compose.yml"
        COMPOSE_OVERRIDE="docker-compose.prod.yml"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        echo "Valid environments: development, staging, production"
        exit 1
        ;;
esac

clear
print_header "CRM Multi-Environment Deployment"
echo -e "${GREEN}Environment: ${ENV}${NC}"
echo -e "${GREEN}Config File: ${ENV_FILE}${NC}"
echo ""

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file $ENV_FILE not found!"

    if [ -f ".env.${ENV}.example" ]; then
        print_info "Creating from .env.${ENV}.example..."
        cp ".env.${ENV}.example" "$ENV_FILE"
        print_success "Created $ENV_FILE"
        print_warning "Please update $ENV_FILE with your configuration"
        read -p "Press Enter after updating the file..."
    else
        print_error "No example file found. Creating minimal configuration..."
        cat > "$ENV_FILE" << EOF
# $ENV Environment Configuration
ENVIRONMENT=$ENV
COMPOSE_PROJECT_NAME=crm_$ENV

# Database
POSTGRES_DB=crm_${ENV}_db
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=change_this_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=generate_secure_secret_here

# Ports (adjust if multiple environments on same host)
FRONTEND_PORT=3000
API_GATEWAY_PORT=8000
USER_SERVICE_PORT=8081
HR_SERVICE_PORT=8082
LEAD_SERVICE_PORT=8083
CALL_SERVICE_PORT=8084
CAMPAIGN_SERVICE_PORT=8085
INTEGRATION_SERVICE_PORT=8086
NOTIFICATION_SERVICE_PORT=8087
BILLING_SERVICE_PORT=8088
REPORTING_SERVICE_PORT=8089
CUSTOMER_ADMIN_SERVICE_PORT=8090
POSTGRES_PORT=5432
REDIS_PORT=6379
PGADMIN_PORT=5050

# Application Settings
SPRING_PROFILES_ACTIVE=$ENV
NODE_ENV=$ENV
EOF
        print_success "Created minimal $ENV_FILE"
        print_warning "Please update $ENV_FILE with your configuration"
        read -p "Press Enter after updating the file..."
    fi
fi

# Load environment variables
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

print_header "Environment Configuration"
echo "Project Name: ${COMPOSE_PROJECT_NAME:-crm_$ENV}"
echo "Database: ${POSTGRES_DB}"
echo "Spring Profile: ${SPRING_PROFILES_ACTIVE}"
echo "Node Environment: ${NODE_ENV}"
echo "Frontend Port: ${FRONTEND_PORT}"
echo "API Gateway Port: ${API_GATEWAY_PORT}"
echo ""

# Confirm for production
if [ "$ENV" = "production" ]; then
    print_warning "You are about to deploy to PRODUCTION!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Deployment cancelled"
        exit 0
    fi
fi

# Check if services are already running
if docker-compose -p "${COMPOSE_PROJECT_NAME:-crm_$ENV}" ps | grep -q "Up"; then
    print_warning "Services are already running in $ENV environment"
    read -p "Do you want to restart them? (y/n): " restart_choice
    if [[ $restart_choice =~ ^[Yy]$ ]]; then
        print_info "Stopping existing services..."
        docker-compose -p "${COMPOSE_PROJECT_NAME:-crm_$ENV}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" $([ -f "$COMPOSE_OVERRIDE" ] && echo "-f $COMPOSE_OVERRIDE") down
    else
        print_info "Deployment cancelled"
        exit 0
    fi
fi

# Build if requested
if [ "$BUILD_FLAG" = "--build" ] || [ "$BUILD_FLAG" = "-b" ]; then
    print_header "Building Services"

    # Build backend
    print_info "Building backend services..."
    cd backend
    mvn clean package -DskipTests -P${ENV}
    print_success "Backend built successfully"
    cd ..

    # Build frontend
    print_info "Building frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    print_success "Frontend built successfully"
    cd ..
fi

# Create compose command
COMPOSE_CMD="docker-compose -p ${COMPOSE_PROJECT_NAME:-crm_$ENV} --env-file $ENV_FILE -f $COMPOSE_FILE"
if [ -f "$COMPOSE_OVERRIDE" ]; then
    COMPOSE_CMD="$COMPOSE_CMD -f $COMPOSE_OVERRIDE"
fi

# Pull images if not building
if [ "$BUILD_FLAG" != "--build" ] && [ "$BUILD_FLAG" != "-b" ]; then
    print_header "Pulling Docker Images"
    $COMPOSE_CMD pull
fi

# Start services
print_header "Starting Services"
print_info "This may take a few minutes..."
echo ""

if [ "$BUILD_FLAG" = "--build" ] || [ "$BUILD_FLAG" = "-b" ]; then
    $COMPOSE_CMD up -d --build
else
    $COMPOSE_CMD up -d
fi

print_success "Services started successfully"
echo ""

# Wait for services
print_header "Waiting for Services"
print_info "Waiting for API Gateway to be ready..."

max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:${API_GATEWAY_PORT}/actuator/health > /dev/null 2>&1; then
        print_success "API Gateway is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

echo ""
echo ""

if [ $attempt -eq $max_attempts ]; then
    print_warning "Services are taking longer than expected to start"
    print_info "Check logs with: docker-compose -p ${COMPOSE_PROJECT_NAME:-crm_$ENV} logs -f"
fi

# Show status
print_header "Service Status"
$COMPOSE_CMD ps
echo ""

# Show URLs
print_header "Access URLs - $ENV Environment"
echo -e "${GREEN}Frontend:${NC}     http://localhost:${FRONTEND_PORT}"
echo -e "${GREEN}API Gateway:${NC}  http://localhost:${API_GATEWAY_PORT}"
echo -e "${GREEN}Health Check:${NC} http://localhost:${API_GATEWAY_PORT}/actuator/health"
echo ""

# Show service ports
print_header "Service Ports"
echo "User Service:           http://localhost:${USER_SERVICE_PORT}"
echo "HR Service:             http://localhost:${HR_SERVICE_PORT}"
echo "Lead Service:           http://localhost:${LEAD_SERVICE_PORT}"
echo "Call Service:           http://localhost:${CALL_SERVICE_PORT}"
echo "Campaign Service:       http://localhost:${CAMPAIGN_SERVICE_PORT}"
echo "Integration Service:    http://localhost:${INTEGRATION_SERVICE_PORT}"
echo "Notification Service:   http://localhost:${NOTIFICATION_SERVICE_PORT}"
echo "Billing Service:        http://localhost:${BILLING_SERVICE_PORT}"
echo "Reporting Service:      http://localhost:${REPORTING_SERVICE_PORT}"
echo "Customer Admin Service: http://localhost:${CUSTOMER_ADMIN_SERVICE_PORT}"
echo ""

# Show useful commands
print_header "Useful Commands"
echo "View logs:     docker-compose -p ${COMPOSE_PROJECT_NAME:-crm_$ENV} logs -f"
echo "Stop services: docker-compose -p ${COMPOSE_PROJECT_NAME:-crm_$ENV} down"
echo "Restart:       ./deploy-env.sh $ENV"
echo "Rebuild:       ./deploy-env.sh $ENV --build"
echo ""
echo "Or use Makefile with environment:"
echo "  make logs ENV=$ENV"
echo "  make down ENV=$ENV"
echo "  make health ENV=$ENV"
echo ""

print_header "Deployment Complete!"
echo -e "${GREEN}$ENV environment is now running!${NC}"
echo ""

# Save deployment info
cat > ".deployment_${ENV}.info" << EOF
Environment: $ENV
Deployed: $(date)
Config File: $ENV_FILE
Compose Project: ${COMPOSE_PROJECT_NAME:-crm_$ENV}
Frontend URL: http://localhost:${FRONTEND_PORT}
API Gateway URL: http://localhost:${API_GATEWAY_PORT}
EOF

print_success "Deployment info saved to .deployment_${ENV}.info"
