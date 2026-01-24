#!/bin/bash

# Environment Management Script
# Usage: ./manage-env.sh [command] [environment]

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Functions
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

COMMAND=${1:-help}
ENVIRONMENT=${2:-development}

# Validate environment
case $ENVIRONMENT in
    development|dev) ENV="development" ;;
    staging|stage) ENV="staging" ;;
    production|prod) ENV="production" ;;
    *)
        if [ "$COMMAND" != "help" ] && [ "$COMMAND" != "list" ]; then
            print_error "Invalid environment: $ENVIRONMENT"
            echo "Valid: development, staging, production"
            exit 1
        fi
        ;;
esac

ENV_FILE=".env.${ENV}"
COMPOSE_PROJECT="crm_${ENV}"

# Load environment if file exists
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
fi

case $COMMAND in
    help)
        echo "Environment Management Commands"
        echo ""
        echo "Usage: ./manage-env.sh [command] [environment]"
        echo ""
        echo "Commands:"
        echo "  start [env]      - Start services in environment"
        echo "  stop [env]       - Stop services in environment"
        echo "  restart [env]    - Restart services in environment"
        echo "  status [env]     - Show status of environment"
        echo "  logs [env]       - View logs for environment"
        echo "  health [env]     - Check health of environment"
        echo "  backup [env]     - Backup database for environment"
        echo "  restore [env]    - Restore database for environment"
        echo "  clean [env]      - Stop and remove environment"
        echo "  list             - List all environments and their status"
        echo "  switch [env]     - Switch to different environment"
        echo ""
        echo "Environments: development, staging, production"
        echo ""
        echo "Examples:"
        echo "  ./manage-env.sh start development"
        echo "  ./manage-env.sh logs staging"
        echo "  ./manage-env.sh backup production"
        echo "  ./manage-env.sh list"
        ;;

    start)
        print_info "Starting $ENV environment..."
        ./deploy-env.sh $ENV
        ;;

    stop)
        print_info "Stopping $ENV environment..."
        docker-compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" down
        print_success "$ENV environment stopped"
        ;;

    restart)
        print_info "Restarting $ENV environment..."
        docker-compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" restart
        print_success "$ENV environment restarted"
        ;;

    status)
        echo "Status of $ENV environment:"
        echo ""
        docker-compose -p "$COMPOSE_PROJECT" ps
        ;;

    logs)
        docker-compose -p "$COMPOSE_PROJECT" logs -f
        ;;

    health)
        print_info "Checking health of $ENV environment..."
        echo ""
        API_PORT=${API_GATEWAY_PORT:-8000}

        if curl -s http://localhost:${API_PORT}/actuator/health > /dev/null 2>&1; then
            print_success "API Gateway is healthy"
            curl -s http://localhost:${API_PORT}/actuator/health | jq '.'
        else
            print_error "API Gateway is not responding"
        fi
        ;;

    backup)
        print_info "Backing up $ENV database..."
        mkdir -p "backups/${ENV}"
        BACKUP_FILE="backups/${ENV}/backup_$(date +%Y%m%d_%H%M%S).sql"

        docker exec ${COMPOSE_PROJECT}_postgres_1 pg_dump -U ${POSTGRES_USER:-crm_user} ${POSTGRES_DB} > "$BACKUP_FILE"
        print_success "Backup created: $BACKUP_FILE"
        ;;

    restore)
        if [ -z "$3" ]; then
            print_error "Please specify backup file"
            echo "Usage: ./manage-env.sh restore $ENV <backup_file>"
            exit 1
        fi

        BACKUP_FILE=$3
        if [ ! -f "$BACKUP_FILE" ]; then
            print_error "Backup file not found: $BACKUP_FILE"
            exit 1
        fi

        print_warning "This will restore $ENV database from $BACKUP_FILE"
        read -p "Continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Restore cancelled"
            exit 0
        fi

        cat "$BACKUP_FILE" | docker exec -i ${COMPOSE_PROJECT}_postgres_1 psql -U ${POSTGRES_USER:-crm_user} ${POSTGRES_DB}
        print_success "Database restored from $BACKUP_FILE"
        ;;

    clean)
        print_warning "This will stop and remove all containers, networks, and volumes for $ENV"
        read -p "Continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Clean cancelled"
            exit 0
        fi

        docker-compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" down -v
        print_success "$ENV environment cleaned"
        ;;

    list)
        echo "Environment Status:"
        echo ""

        for env in development staging production; do
            ENV_FILE=".env.${env}"
            PROJECT="crm_${env}"

            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo -e "${BLUE}${env^^} Environment${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            if [ -f "$ENV_FILE" ]; then
                print_success "Config file exists: $ENV_FILE"

                # Check if services are running
                RUNNING=$(docker-compose -p "$PROJECT" ps -q 2>/dev/null | wc -l | xargs)
                if [ "$RUNNING" -gt 0 ]; then
                    print_success "$RUNNING services running"
                    docker-compose -p "$PROJECT" ps --format table
                else
                    print_warning "No services running"
                fi
            else
                print_warning "Config file missing: $ENV_FILE"
                echo "Run: cp ${ENV_FILE}.example $ENV_FILE"
            fi
            echo ""
        done
        ;;

    switch)
        print_info "Switching to $ENV environment"

        # Create a symlink to the current environment
        if [ -f "$ENV_FILE" ]; then
            ln -sf "$ENV_FILE" .env.current
            print_success "Switched to $ENV environment"
            print_info "Current environment config: $ENV_FILE"
        else
            print_error "Environment file not found: $ENV_FILE"
            exit 1
        fi
        ;;

    *)
        print_error "Unknown command: $COMMAND"
        echo "Run './manage-env.sh help' for usage"
        exit 1
        ;;
esac
