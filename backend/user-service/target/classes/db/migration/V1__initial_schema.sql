-- V1: Initial schema for User Management
-- Creates tables for tenants, users, roles, permissions

-- Create user_management schema
CREATE SCHEMA IF NOT EXISTS user_management;

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_tier VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS user_management.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS user_management.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS user_management.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (resource, action)
);

-- User-Role mapping table
CREATE TABLE IF NOT EXISTS user_management.user_roles (
    user_id UUID NOT NULL REFERENCES user_management.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_management.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Role-Permission mapping table
CREATE TABLE IF NOT EXISTS user_management.role_permissions (
    role_id UUID NOT NULL REFERENCES user_management.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES user_management.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON user_management.users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON user_management.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON user_management.users(email);

-- Insert default roles
INSERT INTO user_management.roles (name, description) VALUES
('ADMIN', 'Full system access including billing and settings'),
('SUPERVISOR', 'Team management, reporting, and lead assignment'),
('AGENT', 'Access to assigned leads and own data only')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions
-- User permissions
INSERT INTO user_management.permissions (resource, action, description) VALUES
('users', 'read', 'View user information'),
('users', 'write', 'Create and update users'),
('users', 'delete', 'Delete users'),
-- Lead permissions
('leads', 'read', 'View leads'),
('leads', 'write', 'Create and update leads'),
('leads', 'delete', 'Delete leads'),
('leads', 'assign', 'Assign leads to agents'),
('leads', 'reassign', 'Reassign leads between agents'),
('leads', 'import', 'Import leads from Excel'),
-- Call permissions
('calls', 'read', 'View call logs'),
('calls', 'write', 'Create and update call logs'),
('calls', 'delete', 'Delete call logs'),
-- Campaign permissions
('campaigns', 'read', 'View campaigns'),
('campaigns', 'write', 'Create and update campaigns'),
('campaigns', 'delete', 'Delete campaigns'),
('campaigns', 'send', 'Send email campaigns'),
-- Report permissions
('reports', 'read_all', 'View all reports'),
('reports', 'read_team', 'View team reports'),
('reports', 'read_own', 'View own reports'),
('reports', 'generate', 'Generate custom reports'),
-- Integration permissions
('integrations', 'read', 'View integration settings'),
('integrations', 'write', 'Configure integrations'),
-- Billing permissions
('billing', 'read', 'View billing information'),
('billing', 'write', 'Manage subscriptions and payments'),
-- Settings permissions
('settings', 'read', 'View settings'),
('settings', 'write', 'Update settings')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign permissions to ADMIN role
INSERT INTO user_management.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM user_management.roles r
CROSS JOIN user_management.permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Assign permissions to SUPERVISOR role
INSERT INTO user_management.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM user_management.roles r
CROSS JOIN user_management.permissions p
WHERE r.name = 'SUPERVISOR'
AND p.resource IN ('users') AND p.action = 'read'
OR p.resource IN ('leads', 'calls', 'campaigns') AND p.action IN ('read', 'write', 'assign', 'reassign', 'import')
OR p.resource = 'reports' AND p.action IN ('read_all', 'read_team', 'generate')
OR p.resource = 'integrations' AND p.action = 'read'
OR p.resource = 'billing' AND p.action = 'read'
OR p.resource = 'settings' AND p.action = 'read'
OR p.resource = 'hr' AND p.action = 'read'  -- All employees need hr:read for time tracking, leave, salary, etc.
ON CONFLICT DO NOTHING;

-- Assign permissions to AGENT role
INSERT INTO user_management.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM user_management.roles r
CROSS JOIN user_management.permissions p
WHERE r.name = 'AGENT'
AND (
    (p.resource IN ('leads', 'calls') AND p.action IN ('read', 'write'))
    OR (p.resource = 'reports' AND p.action = 'read_own')
    OR (p.resource = 'hr' AND p.action = 'read')  -- All employees need hr:read for time tracking, leave, salary, etc.
    -- Removed users:read permission - agents should not see all users
    -- OR (p.resource = 'users' AND p.action = 'read')
)
ON CONFLICT DO NOTHING;

-- Insert demo tenant
INSERT INTO public.tenants (name, subdomain, subscription_tier, is_active)
VALUES ('Demo Company', 'demo', 'premium', true)
ON CONFLICT (subdomain) DO NOTHING;
