.PHONY: help build build-backend build-frontend up down restart logs ps clean backup health

# Colors for terminal output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)CRM Application - Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

build: build-backend build-frontend ## Build all services

build-backend: ## Build backend services with Maven
	@echo "$(BLUE)Building backend services...$(NC)"
	cd backend && mvn clean package -DskipTests
	@echo "$(GREEN)Backend build complete!$(NC)"

build-frontend: ## Build frontend with npm
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)Frontend build complete!$(NC)"

up: ## Start all services in detached mode
	@echo "$(BLUE)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)All services started!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "API Gateway: http://localhost:8000"

up-build: build ## Build and start all services
	@echo "$(BLUE)Building and starting all services...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)All services built and started!$(NC)"

down: ## Stop and remove all containers
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)All services stopped!$(NC)"

down-volumes: ## Stop and remove all containers and volumes (WARNING: deletes data)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)All services and volumes removed!$(NC)"; \
	fi

restart: ## Restart all services
	@echo "$(BLUE)Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)All services restarted!$(NC)"

restart-backend: ## Restart all backend services
	@echo "$(BLUE)Restarting backend services...$(NC)"
	docker-compose restart api-gateway user-service hr-service lead-service call-service campaign-service integration-service notification-service billing-service reporting-service customer-admin-service
	@echo "$(GREEN)Backend services restarted!$(NC)"

restart-frontend: ## Restart frontend service
	@echo "$(BLUE)Restarting frontend...$(NC)"
	docker-compose restart frontend
	@echo "$(GREEN)Frontend restarted!$(NC)"

logs: ## Show logs from all services
	docker-compose logs -f

logs-api: ## Show API Gateway logs
	docker-compose logs -f api-gateway

logs-user: ## Show User Service logs
	docker-compose logs -f user-service

logs-hr: ## Show HR Service logs
	docker-compose logs -f hr-service

logs-frontend: ## Show Frontend logs
	docker-compose logs -f frontend

logs-db: ## Show PostgreSQL logs
	docker-compose logs -f postgres

ps: ## Show status of all services
	@docker-compose ps

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)API Gateway:$(NC)"
	@curl -s http://localhost:8000/actuator/health | jq '.' 2>/dev/null || echo "Not responding"
	@echo ""
	@echo "$(YELLOW)User Service:$(NC)"
	@curl -s http://localhost:8081/actuator/health | jq '.' 2>/dev/null || echo "Not responding"
	@echo ""
	@echo "$(YELLOW)HR Service:$(NC)"
	@curl -s http://localhost:8082/actuator/health | jq '.' 2>/dev/null || echo "Not responding"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/health || echo "Not responding"

clean: ## Clean up Docker resources
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker-compose down --rmi local --volumes --remove-orphans
	@echo "$(GREEN)Cleanup complete!$(NC)"

backup-db: ## Backup PostgreSQL database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	docker exec crm-postgres pg_dump -U crm_user crm_db > backups/crm_backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backup created in backups/ directory$(NC)"

restore-db: ## Restore PostgreSQL database (requires BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Error: BACKUP_FILE variable is required$(NC)"; \
		echo "Usage: make restore-db BACKUP_FILE=backups/crm_backup_20240101_120000.sql"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(BACKUP_FILE)...$(NC)"
	cat $(BACKUP_FILE) | docker exec -i crm-postgres psql -U crm_user -d crm_db
	@echo "$(GREEN)Database restored!$(NC)"

shell-db: ## Open PostgreSQL shell
	docker exec -it crm-postgres psql -U crm_user -d crm_db

shell-redis: ## Open Redis CLI
	docker exec -it crm-redis redis-cli

stats: ## Show Docker container stats
	docker stats

dev: ## Start services for development (with auto-reload)
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-frontend: ## Run frontend in development mode (Vite)
	@echo "$(BLUE)Starting frontend in development mode...$(NC)"
	cd frontend && npm run dev

dev-backend: ## Run backend services locally (without Docker)
	@echo "$(BLUE)Starting backend services...$(NC)"
	./start-all.sh

stop-dev-backend: ## Stop backend services running locally
	@echo "$(YELLOW)Stopping backend services...$(NC)"
	./stop-all.sh

init: ## Initialize the application (first time setup)
	@echo "$(BLUE)Initializing CRM Application...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN).env file created. Please update with your values.$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists.$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo ""
	@echo "$(GREEN)Initialization complete!$(NC)"
	@echo "Next steps:"
	@echo "  1. Update .env file with your configuration"
	@echo "  2. Run 'make build' to build all services"
	@echo "  3. Run 'make up' to start all services"

pgadmin: ## Start PgAdmin for database management
	docker-compose --profile tools up -d pgadmin
	@echo "$(GREEN)PgAdmin started at http://localhost:5050$(NC)"
	@echo "Email: admin@crm.local"
	@echo "Password: admin"

test: ## Run tests (when implemented)
	@echo "$(BLUE)Running tests...$(NC)"
	cd backend && mvn test
	cd frontend && npm test

lint: ## Run linters
	@echo "$(BLUE)Running linters...$(NC)"
	cd frontend && npm run lint

prune: ## Remove all unused Docker resources
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	docker system prune -a --volumes -f
	@echo "$(GREEN)Pruning complete!$(NC)"

update: ## Pull latest images and rebuild
	@echo "$(BLUE)Updating services...$(NC)"
	git pull
	$(MAKE) build
	docker-compose pull
	docker-compose up -d --build
	@echo "$(GREEN)Update complete!$(NC)"

# Default target
.DEFAULT_GOAL := help
