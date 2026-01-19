#!/bin/bash

# Multi-Tenant CRM System - Startup Script
# This script starts all microservices and the frontend

set -e

echo "=================================================="
echo "  Starting Multi-Tenant CRM System"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/shubhamgaigawale/monkdevs_workflow"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# Check if Redis is running
echo -e "${YELLOW}Checking Redis...${NC}"
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Starting Redis..."
    redis-server > /dev/null 2>&1 &
    sleep 2
fi
echo -e "${GREEN}✓ Redis is running${NC}"

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! pg_isready > /dev/null 2>&1; then
    echo "PostgreSQL is not running. Please start it first:"
    echo "  brew services start postgresql"
    echo "  OR"
    echo "  sudo systemctl start postgresql"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Function to start a service
start_service() {
    local service_name=$1
    local service_port=$2
    local service_dir="$BACKEND_DIR/$service_name"
    local jar_file="$service_dir/target/$service_name-1.0.0.jar"
    local log_file="/tmp/$service_name.log"
    
    echo -e "${YELLOW}Starting $service_name...${NC}"
    
    # Check if port is already in use
    if lsof -Pi :$service_port -sTCP:LISTEN -t > /dev/null 2>&1; then
        echo "  Port $service_port is already in use. Skipping..."
        return
    fi
    
    # Check if JAR exists
    if [ ! -f "$jar_file" ]; then
        echo "  ERROR: $jar_file not found!"
        echo "  Please build the service first: cd $service_dir && mvn clean install"
        exit 1
    fi
    
    # Start the service
    cd "$service_dir"
    nohup java -jar "$jar_file" > "$log_file" 2>&1 &
    echo -e "${GREEN}✓ $service_name started on port $service_port${NC}"
    echo "  Log: $log_file"
}

# Start services in order
echo "Starting backend services..."
echo ""

# 1. Config Server (must start first)
start_service "config-server" 8888
echo "  Waiting for Config Server to initialize..."
sleep 10

# 2. Core services
start_service "user-service" 8081
sleep 5

start_service "lead-service" 8083
sleep 5

start_service "call-service" 8084
sleep 5

start_service "campaign-service" 8085
sleep 5

start_service "hr-service" 8082
sleep 5

start_service "integration-service" 8088
sleep 5

start_service "notification-service" 8087
sleep 5

# 3. API Gateway (must start last)
start_service "api-gateway" 8000
echo "  Waiting for API Gateway to initialize..."
sleep 5

echo ""
echo -e "${YELLOW}Starting frontend...${NC}"

# Check if node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "  Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
fi

# Start frontend
cd "$FRONTEND_DIR"
if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
    echo "  Port 3000 is already in use. Skipping..."
else
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    echo -e "${GREEN}✓ Frontend started on port 3000${NC}"
    echo "  Log: /tmp/frontend.log"
fi

echo ""
echo "=================================================="
echo "  🎉 All services started successfully!"
echo "=================================================="
echo ""
echo "Service URLs:"
echo "  Frontend:          http://localhost:3000"
echo "  API Gateway:       http://localhost:8000"
echo "  Config Server:     http://localhost:8888"
echo "  User Service:      http://localhost:8081"
echo "  Lead Service:      http://localhost:8083"
echo "  Call Service:      http://localhost:8084"
echo "  Campaign Service:  http://localhost:8085"
echo "  HR Service:        http://localhost:8082"
echo "  Integration:       http://localhost:8088"
echo "  Notification:      http://localhost:8087"
echo ""
echo "📱 Access the application at:"
echo "   http://localhost:3000"
echo ""
echo "🔐 Default Login:"
echo "   Email: shubham@monkdevs.com"
echo "   Password: Monkdevs@259"
echo ""
echo "📋 To view logs:"
echo "   tail -f /tmp/{service-name}.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-all.sh"
echo ""
