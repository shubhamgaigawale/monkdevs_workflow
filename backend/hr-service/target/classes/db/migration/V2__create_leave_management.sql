-- V2: Create Leave Management Tables
-- Leave types, balances, requests, approvals, and holiday calendar

-- Leave types table (system-defined and custom)
CREATE TABLE IF NOT EXISTS hr_workflow.leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    is_system_defined BOOLEAN DEFAULT FALSE,
    days_per_year DECIMAL(5,2),
    allow_carry_forward BOOLEAN DEFAULT FALSE,
    max_carry_forward_days DECIMAL(5,2),
    min_notice_days INTEGER DEFAULT 0,
    max_consecutive_days INTEGER,
    is_paid BOOLEAN DEFAULT TRUE,
    color VARCHAR(7),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- Leave balances table (per user, per leave type, per year)
CREATE TABLE IF NOT EXISTS hr_workflow.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    leave_type_id UUID NOT NULL REFERENCES hr_workflow.leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_allocated DECIMAL(5,2) NOT NULL,
    used DECIMAL(5,2) DEFAULT 0,
    pending DECIMAL(5,2) DEFAULT 0,
    available DECIMAL(5,2) NOT NULL,
    carry_forward DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id, leave_type_id, year)
);

-- Leave requests table (all leave applications)
CREATE TABLE IF NOT EXISTS hr_workflow.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    leave_type_id UUID NOT NULL REFERENCES hr_workflow.leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    current_approver_id UUID,
    applied_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP,
    rejected_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leave approvals table (multi-level approval workflow)
CREATE TABLE IF NOT EXISTS hr_workflow.leave_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    leave_request_id UUID NOT NULL REFERENCES hr_workflow.leave_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    level INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments TEXT,
    approved_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Holidays table (company holiday calendar)
CREATE TABLE IF NOT EXISTS hr_workflow.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(20) DEFAULT 'PUBLIC' CHECK (type IN ('PUBLIC', 'OPTIONAL', 'RESTRICTED')),
    description TEXT,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, date)
);

-- Create indexes for Leave Management
CREATE INDEX IF NOT EXISTS idx_leave_type_tenant
    ON hr_workflow.leave_types(tenant_id);

CREATE INDEX IF NOT EXISTS idx_leave_type_tenant_status
    ON hr_workflow.leave_types(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_balance_tenant_user
    ON hr_workflow.leave_balances(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_leave_balance_year
    ON hr_workflow.leave_balances(tenant_id, user_id, year);

CREATE INDEX IF NOT EXISTS idx_leave_request_tenant_user
    ON hr_workflow.leave_requests(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_leave_request_status
    ON hr_workflow.leave_requests(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_request_dates
    ON hr_workflow.leave_requests(tenant_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_leave_request_approver
    ON hr_workflow.leave_requests(tenant_id, current_approver_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_approval_request
    ON hr_workflow.leave_approvals(leave_request_id);

CREATE INDEX IF NOT EXISTS idx_leave_approval_approver
    ON hr_workflow.leave_approvals(tenant_id, approver_id, status);

CREATE INDEX IF NOT EXISTS idx_holiday_tenant_date
    ON hr_workflow.holidays(tenant_id, date);

CREATE INDEX IF NOT EXISTS idx_holiday_tenant_type
    ON hr_workflow.holidays(tenant_id, type);

-- Comments
COMMENT ON TABLE hr_workflow.leave_types IS 'Leave type definitions (CL, SL, EL, custom types)';
COMMENT ON TABLE hr_workflow.leave_balances IS 'Per-user leave balances for each leave type';
COMMENT ON TABLE hr_workflow.leave_requests IS 'All leave applications from employees';
COMMENT ON TABLE hr_workflow.leave_approvals IS 'Multi-level approval workflow for leave requests';
COMMENT ON TABLE hr_workflow.holidays IS 'Company holiday calendar';

-- Seed system-defined leave types (for Indian market)
INSERT INTO hr_workflow.leave_types
    (tenant_id, name, code, description, is_system_defined, days_per_year, allow_carry_forward, max_carry_forward_days, is_paid, color, status)
VALUES
    -- For all tenants, we'll insert during onboarding, but here's a template
    -- These will be inserted via application code per tenant
    ('00000000-0000-0000-0000-000000000000', 'Casual Leave', 'CL', 'Casual leave for personal reasons', TRUE, 12, FALSE, 0, TRUE, '#3b82f6', 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Sick Leave', 'SL', 'Leave for medical reasons', TRUE, 12, FALSE, 0, TRUE, '#ef4444', 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Earned Leave', 'EL', 'Earned/privilege leave', TRUE, 15, TRUE, 15, TRUE, '#10b981', 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Comp Off', 'COMP_OFF', 'Compensatory off for extra hours worked', TRUE, 0, FALSE, 0, TRUE, '#f59e0b', 'ACTIVE')
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION hr_workflow.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leave_types_updated_at
    BEFORE UPDATE ON hr_workflow.leave_types
    FOR EACH ROW
    EXECUTE FUNCTION hr_workflow.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
    BEFORE UPDATE ON hr_workflow.leave_balances
    FOR EACH ROW
    EXECUTE FUNCTION hr_workflow.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON hr_workflow.leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION hr_workflow.update_updated_at_column();
