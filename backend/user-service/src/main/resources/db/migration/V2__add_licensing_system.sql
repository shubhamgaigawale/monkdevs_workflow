-- V2__add_licensing_system.sql
-- Adds module-based licensing system for multi-tenant SaaS
-- Each tenant gets their own license with enabled modules

BEGIN;

-- =====================================================
-- 1. TENANT LICENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenant_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    license_key TEXT UNIQUE NOT NULL,
    plan_name VARCHAR(100), -- BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM
    user_limit INTEGER NOT NULL DEFAULT 10,
    issue_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    grace_period_days INTEGER DEFAULT 15,
    billing_cycle VARCHAR(20), -- MONTHLY, YEARLY, LIFETIME
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_license UNIQUE(tenant_id) -- One license per tenant
);

CREATE INDEX idx_tenant_licenses_tenant ON public.tenant_licenses(tenant_id);
CREATE INDEX idx_tenant_licenses_expiry ON public.tenant_licenses(expiry_date);
CREATE INDEX idx_tenant_licenses_active ON public.tenant_licenses(is_active);

COMMENT ON TABLE public.tenant_licenses IS 'Stores license information for each tenant';
COMMENT ON COLUMN public.tenant_licenses.license_key IS 'Unique license key generated for the tenant';
COMMENT ON COLUMN public.tenant_licenses.user_limit IS 'Maximum number of users allowed for this tenant';
COMMENT ON COLUMN public.tenant_licenses.grace_period_days IS 'Days after expiry before disabling modules';

-- =====================================================
-- 2. MODULES TABLE (Shared across all tenants)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- DASHBOARD, HRMS, SALES, BILLING, REPORTS, SUPPORT, INTEGRATIONS
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_core_module BOOLEAN NOT NULL DEFAULT FALSE, -- Core modules always enabled
    base_price DECIMAL(10,2), -- Monthly price for this module
    required_permissions JSONB, -- Permissions needed for this module
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_code ON public.modules(code);
CREATE INDEX idx_modules_core ON public.modules(is_core_module);
CREATE INDEX idx_modules_order ON public.modules(display_order);

COMMENT ON TABLE public.modules IS 'Available modules that can be enabled per tenant';
COMMENT ON COLUMN public.modules.is_core_module IS 'If true, this module is always enabled for all tenants';
COMMENT ON COLUMN public.modules.base_price IS 'Base monthly price for this module';

-- =====================================================
-- 3. TENANT ENABLED MODULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenant_enabled_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    enabled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_module UNIQUE(tenant_id, module_id)
);

CREATE INDEX idx_tenant_modules_tenant ON public.tenant_enabled_modules(tenant_id);
CREATE INDEX idx_tenant_modules_module ON public.tenant_enabled_modules(module_id);
CREATE INDEX idx_tenant_modules_status ON public.tenant_enabled_modules(tenant_id, is_enabled);

COMMENT ON TABLE public.tenant_enabled_modules IS 'Tracks which modules are enabled for each tenant';

-- =====================================================
-- 4. TENANT BRANDING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenant_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    portal_name VARCHAR(255),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7), -- Hex color code (e.g., #0066CC)
    secondary_color VARCHAR(7),
    font_family VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(20) DEFAULT 'HH:mm',
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_branding UNIQUE(tenant_id)
);

CREATE INDEX idx_tenant_branding_tenant ON public.tenant_branding(tenant_id);

COMMENT ON TABLE public.tenant_branding IS 'Custom branding settings per tenant';
COMMENT ON COLUMN public.tenant_branding.primary_color IS 'Primary brand color in hex format';

-- =====================================================
-- 5. SEED DEFAULT MODULES
-- =====================================================
INSERT INTO public.modules (code, name, description, icon, display_order, is_core_module, base_price, required_permissions) VALUES
('DASHBOARD', 'Dashboard', 'Main dashboard and analytics', 'LayoutDashboard', 0, TRUE, 0.00, '[]'::jsonb),
('HRMS', 'HR Management', 'Time tracking, leave management, salary, onboarding, tax management', 'Users', 1, FALSE, 49.99, '["hr:read", "hr:manage"]'::jsonb),
('SALES', 'Sales Management', 'Lead management, call tracking, campaign management', 'Briefcase', 2, FALSE, 39.99, '["leads:read", "leads:write", "calls:read", "calls:write", "campaigns:read", "campaigns:write"]'::jsonb),
('BILLING', 'Billing', 'Subscription management, payments, invoices', 'Wallet', 3, FALSE, 29.99, '["billing:read", "billing:write"]'::jsonb),
('REPORTS', 'Reports & Analytics', 'Custom reports, data export, advanced analytics', 'FileText', 4, FALSE, 19.99, '["reports:read_own", "reports:read_team", "reports:read_all"]'::jsonb),
('SUPPORT', 'Customer Support', 'Help desk, ticket management, knowledge base', 'MessageSquare', 5, FALSE, 34.99, '["support:read", "support:write"]'::jsonb),
('INTEGRATIONS', 'Third-Party Integrations', 'Connect with external services and APIs', 'Puzzle', 6, FALSE, 24.99, '["integrations:read", "integrations:write"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 6. ENABLE CORE MODULE (DASHBOARD) FOR ALL EXISTING TENANTS
-- =====================================================
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT
    t.id as tenant_id,
    m.id as module_id,
    TRUE as is_enabled,
    CURRENT_TIMESTAMP as enabled_at
FROM public.tenants t
CROSS JOIN public.modules m
WHERE m.is_core_module = TRUE
ON CONFLICT (tenant_id, module_id) DO NOTHING;

-- =====================================================
-- 7. CREATE DEFAULT LICENSE FOR EXISTING TENANTS (OPTIONAL)
-- =====================================================
-- Uncomment this section if you want to automatically create licenses for existing tenants
-- with all modules enabled and 1 year expiry
/*
INSERT INTO public.tenant_licenses (tenant_id, license_key, plan_name, user_limit, issue_date, expiry_date, is_active, grace_period_days, billing_cycle)
SELECT
    id as tenant_id,
    'LIC-' || UPPER(SUBSTRING(id::text, 1, 8)) || '-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint as license_key,
    'ENTERPRISE' as plan_name,
    1000 as user_limit,
    CURRENT_TIMESTAMP as issue_date,
    CURRENT_TIMESTAMP + INTERVAL '1 year' as expiry_date,
    TRUE as is_active,
    30 as grace_period_days,
    'YEARLY' as billing_cycle
FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;

-- Enable all modules for existing tenants
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT
    t.id as tenant_id,
    m.id as module_id,
    TRUE as is_enabled,
    CURRENT_TIMESTAMP as enabled_at
FROM public.tenants t
CROSS JOIN public.modules m
WHERE NOT EXISTS (
    SELECT 1 FROM public.tenant_enabled_modules tem
    WHERE tem.tenant_id = t.id AND tem.module_id = m.id
)
ON CONFLICT (tenant_id, module_id) DO NOTHING;
*/

-- =====================================================
-- 8. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_licenses_updated_at
    BEFORE UPDATE ON public.tenant_licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_branding_updated_at
    BEFORE UPDATE ON public.tenant_branding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
