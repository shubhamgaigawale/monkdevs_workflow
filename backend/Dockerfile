# Multi-stage build for backend services
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Set working directory
WORKDIR /app

# Copy parent pom and common module first (better caching)
COPY pom.xml .
COPY common ./common

# Copy all service modules
COPY api-gateway ./api-gateway
COPY user-service ./user-service
COPY hr-service ./hr-service
COPY lead-service ./lead-service
COPY call-service ./call-service
COPY campaign-service ./campaign-service
COPY integration-service ./integration-service
COPY notification-service ./notification-service
COPY billing-service ./billing-service
COPY reporting-service ./reporting-service
COPY customer-admin-service ./customer-admin-service

# Build all services
RUN mvn clean package -DskipTests

# Runtime stage - This will be used as base for each service
FROM eclipse-temurin:17-jre-alpine AS runtime

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

# Health check will be overridden per service
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
