-- V1: Create Lead Management schema
-- Leads, assignments, history, Excel imports

CREATE SCHEMA IF NOT EXISTS lead_management;

-- Leads table
CREATE TABLE IF NOT EXISTS lead_management.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    custom_fields JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Lead assignments table
CREATE TABLE IF NOT EXISTS lead_management.lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lead_id UUID NOT NULL REFERENCES lead_management.leads(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assignment_type VARCHAR(20) DEFAULT 'MANUAL' CHECK (assignment_type IN ('AUTO', 'MANUAL')),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT true
);

-- Lead history table (audit trail)
CREATE TABLE IF NOT EXISTS lead_management.lead_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lead_id UUID NOT NULL REFERENCES lead_management.leads(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Excel imports table
CREATE TABLE IF NOT EXISTS lead_management.excel_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    uploaded_by UUID NOT NULL,
    file_name VARCHAR(255),
    s3_key VARCHAR(500),
    total_rows INTEGER,
    successful_rows INTEGER,
    failed_rows INTEGER,
    status VARCHAR(20) DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    error_log TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON lead_management.leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_phone ON lead_management.leads(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_email ON lead_management.leads(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON lead_management.leads(created_at);

CREATE INDEX IF NOT EXISTS idx_assignments_tenant_user ON lead_management.lead_assignments(tenant_id, assigned_to, is_current);
CREATE INDEX IF NOT EXISTS idx_assignments_lead ON lead_management.lead_assignments(lead_id, is_current);

CREATE INDEX IF NOT EXISTS idx_history_lead_timestamp ON lead_management.lead_history(lead_id, timestamp);

-- Full-text search index for leads
CREATE INDEX IF NOT EXISTS idx_leads_fulltext ON lead_management.leads
    USING gin(to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(company, '') || ' ' || COALESCE(email, '')));

COMMENT ON TABLE lead_management.leads IS 'Customer leads/prospects';
COMMENT ON TABLE lead_management.lead_assignments IS 'Lead assignments to agents';
COMMENT ON TABLE lead_management.lead_history IS 'Audit trail for lead changes';
COMMENT ON TABLE lead_management.excel_imports IS 'Excel import tracking';
