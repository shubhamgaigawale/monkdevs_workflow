#!/bin/bash

# Production script to run all CRM services on AWS/Production
# Prerequisites: PostgreSQL and Redis must be running
# Backend JARs must be built: cd backend && mvn clean package -DskipTests
# Frontend must be built: cd frontend && npm run build

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}     CRM Application - Production Start${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null && pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
elif nc -z localhost 5432 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running on port 5432${NC}"
    echo "Please start PostgreSQL first"
    exit 1
fi

# Check if Redis is running
echo -e "${YELLOW}Checking Redis...${NC}"
if command -v redis-cli &> /dev/null && redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is running${NC}"
elif nc -z localhost 6379 2>/dev/null; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not running on port 6379${NC}"
    echo "Please start Redis first"
    exit 1
fi

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo -e "${RED}✗ Frontend build not found${NC}"
    echo "Please build frontend first: cd frontend && npm run build"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}     Starting Backend Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create logs directory
mkdir -p logs

# Start User Service (8081)
echo -e "${YELLOW}Starting User Service on port 8081...${NC}"
nohup java -jar backend/user-service/target/user-service-1.0.0.jar > logs/user-service.log 2>&1 &
USER_PID=$!
echo $USER_PID > logs/user-service.pid
echo -e "${GREEN}✓ User Service started (PID: $USER_PID)${NC}"
sleep 10

# Start HR Service (8082)
echo -e "${YELLOW}Starting HR Service on port 8082...${NC}"
nohup java -jar backend/hr-service/target/hr-service-1.0.0.jar > logs/hr-service.log 2>&1 &
HR_PID=$!
echo $HR_PID > logs/hr-service.pid
echo -e "${GREEN}✓ HR Service started (PID: $HR_PID)${NC}"
sleep 5

# Start Lead Service (8083)
echo -e "${YELLOW}Starting Lead Service on port 8083...${NC}"
nohup java -jar backend/lead-service/target/lead-service-1.0.0.jar > logs/lead-service.log 2>&1 &
LEAD_PID=$!
echo $LEAD_PID > logs/lead-service.pid
echo -e "${GREEN}✓ Lead Service started (PID: $LEAD_PID)${NC}"
sleep 5

# Start Call Service (8084)
echo -e "${YELLOW}Starting Call Service on port 8084...${NC}"
nohup java -jar backend/call-service/target/call-service-1.0.0.jar > logs/call-service.log 2>&1 &
CALL_PID=$!
echo $CALL_PID > logs/call-service.pid
echo -e "${GREEN}✓ Call Service started (PID: $CALL_PID)${NC}"
sleep 5

# Start Campaign Service (8085)
echo -e "${YELLOW}Starting Campaign Service on port 8085...${NC}"
nohup java -jar backend/campaign-service/target/campaign-service-1.0.0.jar > logs/campaign-service.log 2>&1 &
CAMPAIGN_PID=$!
echo $CAMPAIGN_PID > logs/campaign-service.pid
echo -e "${GREEN}✓ Campaign Service started (PID: $CAMPAIGN_PID)${NC}"
sleep 5

# Start Integration Service (8086)
echo -e "${YELLOW}Starting Integration Service on port 8086...${NC}"
nohup java -jar backend/integration-service/target/integration-service-1.0.0.jar > logs/integration-service.log 2>&1 &
INTEGRATION_PID=$!
echo $INTEGRATION_PID > logs/integration-service.pid
echo -e "${GREEN}✓ Integration Service started (PID: $INTEGRATION_PID)${NC}"
sleep 5

# Start Notification Service (8087)
echo -e "${YELLOW}Starting Notification Service on port 8087...${NC}"
nohup java -jar backend/notification-service/target/notification-service-1.0.0.jar > logs/notification-service.log 2>&1 &
NOTIFICATION_PID=$!
echo $NOTIFICATION_PID > logs/notification-service.pid
echo -e "${GREEN}✓ Notification Service started (PID: $NOTIFICATION_PID)${NC}"
sleep 5

# Start Billing Service (8088)
echo -e "${YELLOW}Starting Billing Service on port 8088...${NC}"
nohup java -jar backend/billing-service/target/billing-service-1.0.0.jar > logs/billing-service.log 2>&1 &
BILLING_PID=$!
echo $BILLING_PID > logs/billing-service.pid
echo -e "${GREEN}✓ Billing Service started (PID: $BILLING_PID)${NC}"
sleep 5

# Start Reporting Service (8089)
echo -e "${YELLOW}Starting Reporting Service on port 8089...${NC}"
nohup java -jar backend/reporting-service/target/reporting-service-1.0.0.jar > logs/reporting-service.log 2>&1 &
REPORTING_PID=$!
echo $REPORTING_PID > logs/reporting-service.pid
echo -e "${GREEN}✓ Reporting Service started (PID: $REPORTING_PID)${NC}"
sleep 5

# Start Customer Admin Service (8090)
echo -e "${YELLOW}Starting Customer Admin Service on port 8090...${NC}"
nohup java -jar backend/customer-admin-service/target/customer-admin-service-1.0.0.jar > logs/customer-admin-service.log 2>&1 &
CUSTOMER_ADMIN_PID=$!
echo $CUSTOMER_ADMIN_PID > logs/customer-admin-service.pid
echo -e "${GREEN}✓ Customer Admin Service started (PID: $CUSTOMER_ADMIN_PID)${NC}"
sleep 10

# Start API Gateway (8000)
echo -e "${YELLOW}Starting API Gateway on port 8000...${NC}"
nohup java -jar backend/api-gateway/target/api-gateway-1.0.0.jar > logs/api-gateway.log 2>&1 &
API_GATEWAY_PID=$!
echo $API_GATEWAY_PID > logs/api-gateway.pid
echo -e "${GREEN}✓ API Gateway started (PID: $API_GATEWAY_PID)${NC}"
sleep 10

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}     Starting Frontend (Production)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Frontend using serve (install if needed)
echo -e "${YELLOW}Starting Frontend on port 3000...${NC}"
cd frontend

# Check if 'serve' is installed globally
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}Installing 'serve' package globally...${NC}"
    npm install -g serve
fi

# Serve the built frontend
nohup serve -s dist -l 3000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}     All Services Started Successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Access URLs:${NC}"
echo "  Frontend:           http://localhost:3000"
echo "  API Gateway:        http://localhost:8000"
echo ""
echo "  User Service:       http://localhost:8081"
echo "  HR Service:         http://localhost:8082"
echo "  Lead Service:       http://localhost:8083"
echo "  Call Service:       http://localhost:8084"
echo "  Campaign Service:   http://localhost:8085"
echo "  Integration:        http://localhost:8086"
echo "  Notification:       http://localhost:8087"
echo "  Billing:            http://localhost:8088"
echo "  Reporting:          http://localhost:8089"
echo "  Customer Admin:     http://localhost:8090"
echo ""
echo -e "${YELLOW}Logs are in: logs/ directory${NC}"
echo -e "${YELLOW}View logs: tail -f logs/api-gateway.log${NC}"
echo ""
echo -e "${YELLOW}To stop all services, run: ./stop-all-services.sh${NC}"
echo ""

# Save all PIDs
cat > logs/all-services.pids << EOF
API_GATEWAY_PID=$API_GATEWAY_PID
USER_PID=$USER_PID
HR_PID=$HR_PID
LEAD_PID=$LEAD_PID
CALL_PID=$CALL_PID
CAMPAIGN_PID=$CAMPAIGN_PID
INTEGRATION_PID=$INTEGRATION_PID
NOTIFICATION_PID=$NOTIFICATION_PID
BILLING_PID=$BILLING_PID
REPORTING_PID=$REPORTING_PID
CUSTOMER_ADMIN_PID=$CUSTOMER_ADMIN_PID
FRONTEND_PID=$FRONTEND_PID
EOF

echo -e "${GREEN}All service PIDs saved to logs/all-services.pids${NC}"
echo ""
echo -e "${BLUE}Checking service health in 10 seconds...${NC}"
sleep 10

# Quick health check
echo ""
echo -e "${YELLOW}Service Health Check:${NC}"
for port in 8081 8082 8083 8084 8085 8086 8087 8088 8089 8090 8000 3000; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Port $port is active${NC}"
    else
        echo -e "${RED}✗ Port $port is not responding${NC}"
    fi
done

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
