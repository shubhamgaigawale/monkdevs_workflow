#!/bin/bash

# CRM Application Deployment Script
# This script automates the deployment process

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

check_requirements() {
    print_header "Checking Requirements"

    # Check Docker
    if command -v docker &> /dev/null; then
        print_success "Docker is installed: $(docker --version)"
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed: $(docker-compose --version)"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check Maven
    if command -v mvn &> /dev/null; then
        print_success "Maven is installed: $(mvn --version | head -1)"
    else
        print_error "Maven is not installed. Please install Maven first."
        exit 1
    fi

    # Check Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js is installed: $(node --version)"
    else
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    echo ""
}

setup_env() {
    print_header "Setting Up Environment"

    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please update .env with your configuration before proceeding"
        read -p "Press Enter to continue after updating .env..."
    else
        print_success ".env file already exists"
    fi

    echo ""
}

build_backend() {
    print_header "Building Backend Services"

    cd backend
    print_warning "This may take several minutes..."
    mvn clean package -DskipTests
    print_success "Backend services built successfully"
    cd ..

    echo ""
}

build_frontend() {
    print_header "Building Frontend"

    cd frontend

    if [ ! -d "node_modules" ]; then
        print_warning "Installing frontend dependencies..."
        npm install
    fi

    print_warning "Building frontend..."
    npm run build
    print_success "Frontend built successfully"
    cd ..

    echo ""
}

start_services() {
    print_header "Starting Docker Services"

    print_warning "Starting all services..."
    docker-compose up -d

    print_success "All services started!"
    echo ""
}

wait_for_services() {
    print_header "Waiting for Services to be Ready"

    echo "This may take 1-2 minutes for all services to start..."
    echo ""

    max_attempts=60
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/actuator/health > /dev/null 2>&1; then
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
        print_warning "You can check the logs with: docker-compose logs -f"
    fi
}

show_status() {
    print_header "Service Status"

    docker-compose ps
    echo ""
}

show_urls() {
    print_header "Access URLs"

    echo -e "${GREEN}Frontend:${NC}     http://localhost:3000"
    echo -e "${GREEN}API Gateway:${NC}  http://localhost:8000"
    echo -e "${GREEN}PgAdmin:${NC}      http://localhost:5050 (use: docker-compose --profile tools up -d pgadmin)"
    echo ""

    print_header "Service Ports"
    echo "User Service:           http://localhost:8081"
    echo "HR Service:             http://localhost:8082"
    echo "Lead Service:           http://localhost:8083"
    echo "Call Service:           http://localhost:8084"
    echo "Campaign Service:       http://localhost:8085"
    echo "Integration Service:    http://localhost:8086"
    echo "Notification Service:   http://localhost:8087"
    echo "Billing Service:        http://localhost:8088"
    echo "Reporting Service:      http://localhost:8089"
    echo "Customer Admin Service: http://localhost:8090"
    echo ""
}

show_help() {
    print_header "Useful Commands"

    echo "View logs:           docker-compose logs -f"
    echo "View specific logs:  docker-compose logs -f api-gateway"
    echo "Stop services:       docker-compose down"
    echo "Restart services:    docker-compose restart"
    echo "Check status:        docker-compose ps"
    echo ""
    echo "Or use the Makefile:"
    echo "  make help          - Show all available commands"
    echo "  make logs          - View logs"
    echo "  make health        - Check service health"
    echo "  make backup-db     - Backup database"
    echo ""
}

# Main deployment flow
main() {
    clear
    print_header "CRM Application Deployment"
    echo ""

    check_requirements
    setup_env

    read -p "Build backend services? (y/n) [y]: " build_backend_choice
    build_backend_choice=${build_backend_choice:-y}
    if [[ $build_backend_choice =~ ^[Yy]$ ]]; then
        build_backend
    else
        print_warning "Skipping backend build"
        echo ""
    fi

    read -p "Build frontend? (y/n) [y]: " build_frontend_choice
    build_frontend_choice=${build_frontend_choice:-y}
    if [[ $build_frontend_choice =~ ^[Yy]$ ]]; then
        build_frontend
    else
        print_warning "Skipping frontend build"
        echo ""
    fi

    start_services
    wait_for_services
    show_status
    show_urls
    show_help

    print_header "Deployment Complete!"
    echo -e "${GREEN}Your CRM application is now running!${NC}"
    echo ""
}

# Run main function
main
