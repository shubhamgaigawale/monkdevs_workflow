#!/bin/bash

# Multi-Tenant CRM System - Shutdown Script
# This script stops all microservices and the frontend

echo "=================================================="
echo "  Stopping Multi-Tenant CRM System"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to stop service on a port
stop_service() {
    local service_name=$1
    local port=$2
    
    echo -e "${YELLOW}Stopping $service_name (port $port)...${NC}"
    
    # Find and kill process on port
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -z "$pid" ]; then
        echo "  No process found on port $port"
    else
        kill -9 $pid 2>/dev/null
        echo -e "${GREEN}✓ $service_name stopped${NC}"
    fi
}

# Stop all services
stop_service "Frontend" 3000
stop_service "API Gateway" 8000
stop_service "User Service" 8081
stop_service "HR Service" 8082
stop_service "Lead Service" 8083
stop_service "Call Service" 8084
stop_service "Campaign Service" 8085
stop_service "Notification Service" 8087
stop_service "Integration Service" 8088
stop_service "Config Server" 8888

# Alternative: Kill all Java processes (be careful if you have other Java apps)
echo ""
echo -e "${YELLOW}Checking for remaining Java processes...${NC}"
if pgrep -f "java -jar.*-service" > /dev/null; then
    echo "  Found remaining service processes. Killing..."
    pkill -f "java -jar.*-service"
    echo -e "${GREEN}✓ All Java service processes stopped${NC}"
else
    echo "  No remaining Java service processes found"
fi

# Stop Redis (optional - comment out if you want to keep Redis running)
# echo -e "${YELLOW}Stopping Redis...${NC}"
# redis-cli shutdown
# echo -e "${GREEN}✓ Redis stopped${NC}"

echo ""
echo "=================================================="
echo "  ✅ All services stopped"
echo "=================================================="
echo ""
echo "To start again:"
echo "  ./start-all.sh"
echo ""

# Clean up log files (optional)
read -p "Do you want to delete log files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning up log files..."
    rm -f /tmp/config-server.log
    rm -f /tmp/user-service.log
    rm -f /tmp/lead-service.log
    rm -f /tmp/call-service.log
    rm -f /tmp/campaign-service.log
    rm -f /tmp/hr-service.log
    rm -f /tmp/integration-service.log
    rm -f /tmp/notification-service.log
    rm -f /tmp/api-gateway.log
    rm -f /tmp/frontend.log
    echo -e "${GREEN}✓ Log files deleted${NC}"
fi

echo ""
echo "Done!"
