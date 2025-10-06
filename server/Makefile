# Chess Arena Docker Management

.PHONY: help build up down restart logs clean dev prod

# Default target
help:
	@echo "Chess Arena Docker Management"
	@echo "============================="
	@echo ""
	@echo "Available commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make prod         - Start production environment"
	@echo "  make build        - Build all images"
	@echo "  make up           - Start services"
	@echo "  make down         - Stop services"
	@echo "  make restart      - Restart services"
	@echo "  make logs         - Show logs"
	@echo "  make clean        - Clean up containers and volumes"
	@echo "  make db-migrate   - Run database migrations"
	@echo "  make db-seed      - Seed database"
	@echo "  make db-reset     - Reset database"

# Development environment (full)
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "API: http://localhost:3000"
	@echo "WebSocket: ws://localhost:3001"
	@echo "Bull Board: http://localhost:8084"
	@echo "Redis Commander: http://localhost:8081"

# Development environment (minimal - only DB & Redis)
dev-minimal:
	@echo "Starting minimal development environment (DB + Redis only)..."
	docker-compose -f docker-compose.dev-minimal.yml up -d
	@echo "Minimal development environment started!"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"
	@echo "pgAdmin: http://localhost:8082"
	@echo "Redis Commander: http://localhost:8081"
	@echo "Bull Board: http://localhost:8084"
	@echo ""
	@echo "Now run: npm run start:dev"

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose up -d
	@echo "Production environment started!"
	@echo "API: http://localhost:3000"
	@echo "WebSocket: ws://localhost:3001"
	@echo "Bull Board: http://localhost:8084"
	@echo "Redis Commander: http://localhost:8081"

# Build images
build:
	@echo "Building images..."
	docker-compose build
	@echo "Images built successfully!"

# Start services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started!"

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down
	@echo "Services stopped!"

# Restart services
restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "Services restarted!"

# Show logs
logs:
	docker-compose logs -f

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup completed!"

# Database operations
db-migrate:
	@echo "Running database migrations..."
	docker-compose exec app npx prisma migrate dev
	@echo "Migrations completed!"

db-seed:
	@echo "Seeding database..."
	docker-compose exec app npx prisma db seed
	@echo "Database seeded!"

db-reset:
	@echo "Resetting database..."
	docker-compose exec app npx prisma migrate reset --force
	@echo "Database reset!"

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:3000/health || echo "API not responding"
	@curl -f http://localhost:8084/health || echo "Bull Board not responding"
	@echo "Health check completed!"

# Install dependencies
install:
	@echo "Installing dependencies..."
	docker-compose exec app npm install
	@echo "Dependencies installed!"

# Run tests
test:
	@echo "Running tests..."
	docker-compose exec app npm run test
	@echo "Tests completed!"

# Lint code
lint:
	@echo "Running linter..."
	docker-compose exec app npm run lint
	@echo "Linting completed!"
