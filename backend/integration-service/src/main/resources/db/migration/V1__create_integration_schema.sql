-- V1: Create Integration Management schema
-- OAuth tokens, integrations, appointments, e-signatures

CREATE SCHEMA IF NOT EXISTS integration_management;

-- Integration configurations table
CREATE TABLE IF NOT EXISTS integration_management.integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('CALENDLY', 'RINGCENTRAL', 'PANDADOC', 'DOCUSIGN', 'MAILCHIMP')),
    is_enabled BOOLEAN DEFAULT false,
    config_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, integration_type)
);

-- OAuth tokens table
CREATE TABLE IF NOT EXISTS integration_management.oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(20) DEFAULT 'Bearer',
    expires_at TIMESTAMP,
    scope TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id, integration_type)
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS integration_management.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    webhook_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table (Calendly)
CREATE TABLE IF NOT EXISTS integration_management.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lead_id UUID,
    user_id UUID NOT NULL,
    external_id VARCHAR(255),
    event_type VARCHAR(100),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
    meeting_url TEXT,
    invitee_name VARCHAR(255),
    invitee_email VARCHAR(255),
    invitee_phone VARCHAR(50),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- E-signatures table (PandaDoc/DocuSign)
CREATE TABLE IF NOT EXISTS integration_management.e_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lead_id UUID,
    user_id UUID NOT NULL,
    external_id VARCHAR(255),
    provider VARCHAR(20) CHECK (provider IN ('PANDADOC', 'DOCUSIGN')),
    document_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'COMPLETED', 'DECLINED', 'EXPIRED')),
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    document_url TEXT,
    signed_url TEXT,
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    signed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integration_configs_tenant ON integration_management.integration_configs(tenant_id, integration_type);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_tenant_user ON integration_management.oauth_tokens(tenant_id, user_id, integration_type);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires ON integration_management.oauth_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON integration_management.webhooks(tenant_id, integration_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON integration_management.webhooks(processed, created_at);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON integration_management.appointments(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON integration_management.appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON integration_management.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_external ON integration_management.appointments(external_id);

CREATE INDEX IF NOT EXISTS idx_signatures_tenant ON integration_management.e_signatures(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_signatures_lead ON integration_management.e_signatures(lead_id);
CREATE INDEX IF NOT EXISTS idx_signatures_status ON integration_management.e_signatures(status);
CREATE INDEX IF NOT EXISTS idx_signatures_external ON integration_management.e_signatures(external_id);

COMMENT ON TABLE integration_management.integration_configs IS 'Integration configuration per tenant';
COMMENT ON TABLE integration_management.oauth_tokens IS 'OAuth2 tokens for third-party integrations';
COMMENT ON TABLE integration_management.webhooks IS 'Webhook events from integrations';
COMMENT ON TABLE integration_management.appointments IS 'Scheduled appointments from Calendly';
COMMENT ON TABLE integration_management.e_signatures IS 'Document signatures from PandaDoc/DocuSign';
