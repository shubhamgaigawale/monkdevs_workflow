-- V1: Create HR Workflow schema
-- Time tracking, attendance, performance metrics, KPI data

-- Create hr_workflow schema
CREATE SCHEMA IF NOT EXISTS hr_workflow;

-- Time entries table
CREATE TABLE IF NOT EXISTS hr_workflow.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('LOGIN', 'LOGOUT', 'BREAK_START', 'BREAK_END')),
    timestamp TIMESTAMP NOT NULL,
    location_data JSONB,
    device_info JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS hr_workflow.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    first_login TIME,
    last_logout TIME,
    total_work_hours DECIMAL(5,2),
    total_break_hours DECIMAL(5,2),
    status VARCHAR(20) CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'LEAVE')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, user_id, date)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS hr_workflow.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    metric_type VARCHAR(50),
    metric_value DECIMAL(10,2),
    period_type VARCHAR(20) CHECK (period_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    period_start DATE,
    period_end DATE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- KPI data table
CREATE TABLE IF NOT EXISTS hr_workflow.kpi_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    kpi_name VARCHAR(100),
    target_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    achievement_percentage DECIMAL(5,2),
    period_start DATE,
    period_end DATE,
    unit VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_tenant_user_date
    ON hr_workflow.time_entries(tenant_id, user_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_time_tenant_timestamp
    ON hr_workflow.time_entries(tenant_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_attendance_tenant_user_date
    ON hr_workflow.attendance_records(tenant_id, user_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date
    ON hr_workflow.attendance_records(tenant_id, date);

CREATE INDEX IF NOT EXISTS idx_perf_tenant_user_period
    ON hr_workflow.performance_metrics(tenant_id, user_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_kpi_tenant_user_period
    ON hr_workflow.kpi_data(tenant_id, user_id, period_start, period_end);

-- Comments
COMMENT ON TABLE hr_workflow.time_entries IS 'Records all time tracking events (login, logout, breaks)';
COMMENT ON TABLE hr_workflow.attendance_records IS 'Daily attendance summary per user';
COMMENT ON TABLE hr_workflow.performance_metrics IS 'Performance metrics tracked over time';
COMMENT ON TABLE hr_workflow.kpi_data IS 'Key Performance Indicators with targets and achievements';
