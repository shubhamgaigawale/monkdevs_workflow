#!/bin/bash

# Script to view logs of running services

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${BLUE}Available services:${NC}"
    echo "  frontend"
    echo "  api-gateway"
    echo "  user-service"
    echo "  hr-service"
    echo "  lead-service"
    echo "  call-service"
    echo "  campaign-service"
    echo "  integration-service"
    echo "  notification-service"
    echo "  billing-service"
    echo "  reporting-service"
    echo "  customer-admin-service"
    echo "  all (show all logs)"
    echo ""
    echo "Usage: ./view-logs.sh [service-name]"
    echo "Example: ./view-logs.sh user-service"
    exit 0
fi

SERVICE=$1

if [ "$SERVICE" == "all" ]; then
    echo -e "${BLUE}Showing all service logs...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    tail -f logs/*.log
else
    if [ -f "logs/${SERVICE}.log" ]; then
        echo -e "${BLUE}Showing logs for ${SERVICE}...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        tail -f "logs/${SERVICE}.log"
    else
        echo -e "${RED}Log file not found: logs/${SERVICE}.log${NC}"
        exit 1
    fi
fi
