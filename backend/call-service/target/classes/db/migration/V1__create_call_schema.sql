-- V1: Create Call Management schema
-- Calls and call logs

CREATE SCHEMA IF NOT EXISTS call_management;

-- Calls table
CREATE TABLE IF NOT EXISTS call_management.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lead_id UUID,
    user_id UUID NOT NULL,
    phone_number VARCHAR(20),
    direction VARCHAR(20) DEFAULT 'OUTBOUND' CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'MISSED', 'REJECTED', 'FAILED', 'BUSY', 'NO_ANSWER')),
    duration INTEGER DEFAULT 0,
    call_start_time TIMESTAMP,
    call_end_time TIMESTAMP,
    recording_url VARCHAR(500),
    notes TEXT,
    outcome VARCHAR(50),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP,
    external_call_id VARCHAR(100),
    call_metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Call logs table (for detailed activity tracking)
CREATE TABLE IF NOT EXISTS call_management.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    call_id UUID NOT NULL REFERENCES call_management.calls(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calls_tenant_user ON call_management.calls(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_calls_tenant_lead ON call_management.calls(tenant_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_phone ON call_management.calls(tenant_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON call_management.calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_start_time ON call_management.calls(call_start_time DESC);
CREATE INDEX IF NOT EXISTS idx_calls_direction_status ON call_management.calls(direction, status);

CREATE INDEX IF NOT EXISTS idx_call_logs_call ON call_management.call_logs(call_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_event ON call_management.call_logs(event_type);

COMMENT ON TABLE call_management.calls IS 'Call records for inbound/outbound calls';
COMMENT ON TABLE call_management.call_logs IS 'Detailed activity logs for calls';
