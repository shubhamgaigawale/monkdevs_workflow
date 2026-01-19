-- Initialize CRM Database
-- This script runs when PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas for different services (optional, for better organization)
CREATE SCHEMA IF NOT EXISTS user_management;
CREATE SCHEMA IF NOT EXISTS hr_workflow;
CREATE SCHEMA IF NOT EXISTS lead_management;
CREATE SCHEMA IF NOT EXISTS call_management;
CREATE SCHEMA IF NOT EXISTS campaign_management;
CREATE SCHEMA IF NOT EXISTS integration_management;
CREATE SCHEMA IF NOT EXISTS billing_management;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA user_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA user_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hr_workflow TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hr_workflow TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA lead_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA lead_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA call_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA call_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA campaign_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA campaign_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA integration_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA integration_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA billing_management TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA billing_management TO crm_user;

-- Set default schema
ALTER DATABASE crm_db SET search_path TO public, user_management, hr_workflow, lead_management, call_management, campaign_management, integration_management, billing_management;
