#!/bin/bash

# Simple script to stop all CRM services

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}     Stopping All CRM Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if PIDs file exists
if [ -f "logs/all-services.pids" ]; then
    echo -e "${YELLOW}Reading service PIDs...${NC}"
    source logs/all-services.pids

    # Stop each service
    services=(
        "FRONTEND_PID:Frontend"
        "API_GATEWAY_PID:API Gateway"
        "CUSTOMER_ADMIN_PID:Customer Admin Service"
        "REPORTING_PID:Reporting Service"
        "BILLING_PID:Billing Service"
        "NOTIFICATION_PID:Notification Service"
        "INTEGRATION_PID:Integration Service"
        "CAMPAIGN_PID:Campaign Service"
        "CALL_PID:Call Service"
        "LEAD_PID:Lead Service"
        "HR_PID:HR Service"
        "USER_PID:User Service"
    )

    for service_info in "${services[@]}"; do
        IFS=':' read -r pid_var service_name <<< "$service_info"
        pid=${!pid_var}

        if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            echo -e "${GREEN}✓ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠ $service_name not running${NC}"
        fi
    done

    # Clean up PID files
    rm -f logs/*.pid logs/all-services.pids
    echo -e "${GREEN}✓ PID files cleaned up${NC}"
else
    echo -e "${YELLOW}No PIDs file found. Searching for running Java processes...${NC}"

    # Alternative: find and kill Java processes on specific ports
    ports=(5173 8000 8081 8082 8083 8084 8085 8086 8087 8088 8089 8090)

    for port in "${ports[@]}"; do
        PID=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo -e "${YELLOW}Stopping process on port $port (PID: $PID)...${NC}"
            kill $PID 2>/dev/null || true
            echo -e "${GREEN}✓ Process on port $port stopped${NC}"
        fi
    done
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}     All Services Stopped${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
