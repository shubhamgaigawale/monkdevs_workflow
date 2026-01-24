#!/bin/bash

# Multi-Environment Setup Wizard
# This script helps you set up all environments easily

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

clear
print_header "CRM Multi-Environment Setup Wizard"

echo "This wizard will help you set up Development, Staging, and Production environments."
echo ""
read -p "Press Enter to continue..."

# Check requirements
print_header "Checking Requirements"

MISSING_DEPS=0

if command -v docker &> /dev/null; then
    print_success "Docker: $(docker --version | head -1)"
else
    print_error "Docker not found"
    MISSING_DEPS=1
fi

if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose: $(docker-compose --version)"
else
    print_error "Docker Compose not found"
    MISSING_DEPS=1
fi

if command -v mvn &> /dev/null; then
    print_success "Maven: $(mvn --version | head -1)"
else
    print_error "Maven not found"
    MISSING_DEPS=1
fi

if command -v node &> /dev/null; then
    print_success "Node.js: $(node --version)"
else
    print_error "Node.js not found"
    MISSING_DEPS=1
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    print_error "Please install missing dependencies and run this script again"
    exit 1
fi

# Environment selection
print_header "Environment Selection"

echo "Which environments do you want to set up?"
echo ""
echo "1) Development only"
echo "2) Development + Staging"
echo "3) All environments (Development + Staging + Production)"
echo ""
read -p "Choose (1-3): " env_choice

case $env_choice in
    1) ENVIRONMENTS=("development") ;;
    2) ENVIRONMENTS=("development" "staging") ;;
    3) ENVIRONMENTS=("development" "staging" "production") ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Generate secrets
print_header "Generating Secure Secrets"

generate_secret() {
    openssl rand -base64 $1 | tr -d '\n'
}

JWT_SECRET_DEV="development-jwt-secret-key-that-is-long-enough-for-hs512-algorithm-at-least-64-chars"
JWT_SECRET_STAGING=$(generate_secret 64)
JWT_SECRET_PROD=$(generate_secret 64)

DB_PASSWORD_DEV="dev_password_123"
DB_PASSWORD_STAGING=$(generate_secret 24)
DB_PASSWORD_PROD=$(generate_secret 32)

print_success "Secure secrets generated"

# Create environment files
print_header "Creating Environment Files"

for env in "${ENVIRONMENTS[@]}"; do
    ENV_FILE=".env.${env}"
    ENV_EXAMPLE=".env.${env}.example"

    if [ -f "$ENV_FILE" ]; then
        print_warning "$ENV_FILE already exists"
        read -p "Overwrite? (y/n): " overwrite
        if [[ ! $overwrite =~ ^[Yy]$ ]]; then
            print_info "Skipping $ENV_FILE"
            continue
        fi
    fi

    if [ -f "$ENV_EXAMPLE" ]; then
        print_info "Creating $ENV_FILE from template..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"

        # Replace secrets
        case $env in
            development)
                sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET_DEV}|g" "$ENV_FILE"
                sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASSWORD_DEV}|g" "$ENV_FILE"
                ;;
            staging)
                sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET_STAGING}|g" "$ENV_FILE"
                sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASSWORD_STAGING}|g" "$ENV_FILE"
                ;;
            production)
                sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET_PROD}|g" "$ENV_FILE"
                sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASSWORD_PROD}|g" "$ENV_FILE"
                ;;
        esac

        rm -f "${ENV_FILE}.bak"
        print_success "$ENV_FILE created with secure secrets"
    else
        print_error "$ENV_EXAMPLE not found"
    fi
done

# Production-specific configuration
if [[ " ${ENVIRONMENTS[@]} " =~ " production " ]]; then
    print_header "Production Configuration"

    echo "Please provide your production domain/URL"
    read -p "Production API URL (e.g., https://api.yourcompany.com): " prod_api_url
    if [ ! -z "$prod_api_url" ]; then
        sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=${prod_api_url}|g" .env.production
        rm -f .env.production.bak
        print_success "Production API URL configured"
    fi

    read -p "Production admin email (for PgAdmin): " admin_email
    if [ ! -z "$admin_email" ]; then
        sed -i.bak "s|PGADMIN_EMAIL=.*|PGADMIN_EMAIL=${admin_email}|g" .env.production
        rm -f .env.production.bak
        print_success "Admin email configured"
    fi
fi

# Build backend
print_header "Building Backend Services"

read -p "Build backend now? (y/n) [y]: " build_backend
build_backend=${build_backend:-y}

if [[ $build_backend =~ ^[Yy]$ ]]; then
    print_info "Building backend... This may take several minutes..."
    cd backend
    mvn clean package -DskipTests
    print_success "Backend built successfully"
    cd ..
else
    print_warning "Skipping backend build"
    print_info "You'll need to build it later: cd backend && mvn clean package -DskipTests"
fi

# Install frontend dependencies
print_header "Frontend Dependencies"

read -p "Install frontend dependencies now? (y/n) [y]: " install_frontend
install_frontend=${install_frontend:-y}

if [[ $install_frontend =~ ^[Yy]$ ]]; then
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    print_success "Frontend dependencies installed"
    cd ..
else
    print_warning "Skipping frontend dependencies"
    print_info "You'll need to install them later: cd frontend && npm install"
fi

# Deploy environments
print_header "Environment Deployment"

echo "Do you want to deploy the environments now?"
echo ""
for env in "${ENVIRONMENTS[@]}"; do
    read -p "Deploy $env? (y/n) [n]: " deploy_env
    if [[ $deploy_env =~ ^[Yy]$ ]]; then
        print_info "Deploying $env environment..."
        ./deploy-env.sh $env
        print_success "$env environment deployed"
    else
        print_info "Skipping $env deployment"
        echo "To deploy later: ./deploy-env.sh $env"
    fi
    echo ""
done

# Create backup directories
print_header "Setting Up Backup Directories"

for env in "${ENVIRONMENTS[@]}"; do
    mkdir -p "backups/${env}"
    print_success "Created backups/${env}/"
done

# Summary
print_header "Setup Complete!"

echo -e "${GREEN}✓ Environment files created and configured${NC}"
echo -e "${GREEN}✓ Secure secrets generated${NC}"
echo -e "${GREEN}✓ Backup directories created${NC}"
echo ""

echo "Environment Configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for env in "${ENVIRONMENTS[@]}"; do
    case $env in
        development)
            echo -e "${BLUE}Development${NC}"
            echo "  Frontend: http://localhost:3000"
            echo "  API:      http://localhost:8000"
            echo "  Config:   .env.development"
            ;;
        staging)
            echo -e "${YELLOW}Staging${NC}"
            echo "  Frontend: http://localhost:3001"
            echo "  API:      http://localhost:8001"
            echo "  Config:   .env.staging"
            ;;
        production)
            echo -e "${RED}Production${NC}"
            echo "  Frontend: http://localhost (port 80)"
            echo "  API:      http://localhost:8002"
            echo "  Config:   .env.production"
            ;;
    esac
    echo ""
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Useful Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploy:        ./deploy-env.sh [environment]"
echo "  Manage:        ./manage-env.sh [command] [environment]"
echo "  List all:      ./manage-env.sh list"
echo "  View logs:     ./manage-env.sh logs [environment]"
echo "  Check health:  ./manage-env.sh health [environment]"
echo "  Backup DB:     ./manage-env.sh backup [environment]"
echo ""

echo "Documentation:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Quick Start:   MULTI_ENV_README.md"
echo "  Full Guide:    MULTI_ENVIRONMENT_GUIDE.md"
echo "  Docker Guide:  DOCKER_DEPLOYMENT.md"
echo ""

print_info "Setup information saved to setup_summary.txt"

# Save summary
cat > setup_summary.txt << EOF
CRM Multi-Environment Setup Summary
Generated: $(date)

Environments Configured:
$(for env in "${ENVIRONMENTS[@]}"; do echo "  - $env"; done)

Configuration Files:
$(for env in "${ENVIRONMENTS[@]}"; do echo "  - .env.$env"; done)

Secrets Generated:
  - JWT secrets for each environment
  - Database passwords for each environment

Next Steps:
1. Review and customize environment files if needed
2. Deploy environments: ./deploy-env.sh [environment]
3. Check deployment: ./manage-env.sh list
4. Access applications:
$(for env in "${ENVIRONMENTS[@]}"; do
    case $env in
        development) echo "   - Development: http://localhost:3000" ;;
        staging) echo "   - Staging: http://localhost:3001" ;;
        production) echo "   - Production: http://localhost" ;;
    esac
done)

Commands:
  - Deploy: ./deploy-env.sh [environment]
  - List:   ./manage-env.sh list
  - Logs:   ./manage-env.sh logs [environment]
  - Health: ./manage-env.sh health [environment]

Documentation:
  - MULTI_ENV_README.md
  - MULTI_ENVIRONMENT_GUIDE.md
  - DOCKER_DEPLOYMENT.md
EOF

echo -e "${GREEN}Your multi-environment setup is ready!${NC}"
echo ""
