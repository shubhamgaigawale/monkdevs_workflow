-- Create schema
CREATE SCHEMA IF NOT EXISTS campaign_management;

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaign_management.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    preview_text VARCHAR(500),
    from_name VARCHAR(255),
    reply_to VARCHAR(255),
    status VARCHAR(50) DEFAULT 'DRAFT',
    campaign_type VARCHAR(50) DEFAULT 'EMAIL',
    mailchimp_campaign_id VARCHAR(100),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    unique_opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign recipients table
CREATE TABLE IF NOT EXISTS campaign_management.campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaign_management.campaigns(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    mailchimp_member_id VARCHAR(100),
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign templates table
CREATE TABLE IF NOT EXISTS campaign_management.campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subject VARCHAR(500),
    preview_text VARCHAR(500),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mailchimp lists table
CREATE TABLE IF NOT EXISTS campaign_management.mailchimp_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    mailchimp_list_id VARCHAR(100) NOT NULL,
    description TEXT,
    total_subscribers INTEGER DEFAULT 0,
    last_synced_at TIMESTAMP,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, mailchimp_list_id)
);

-- Create indexes
CREATE INDEX idx_campaigns_tenant_id ON campaign_management.campaigns(tenant_id);
CREATE INDEX idx_campaigns_tenant_user ON campaign_management.campaigns(tenant_id, user_id);
CREATE INDEX idx_campaigns_status ON campaign_management.campaigns(tenant_id, status);
CREATE INDEX idx_campaigns_sent_at ON campaign_management.campaigns(sent_at);
CREATE INDEX idx_campaigns_scheduled_at ON campaign_management.campaigns(scheduled_at);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_management.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_tenant ON campaign_management.campaign_recipients(tenant_id);
CREATE INDEX idx_campaign_recipients_lead ON campaign_management.campaign_recipients(tenant_id, lead_id);
CREATE INDEX idx_campaign_recipients_email ON campaign_management.campaign_recipients(email);
CREATE INDEX idx_campaign_recipients_status ON campaign_management.campaign_recipients(campaign_id, status);

CREATE INDEX idx_campaign_templates_tenant ON campaign_management.campaign_templates(tenant_id);
CREATE INDEX idx_campaign_templates_active ON campaign_management.campaign_templates(tenant_id, is_active);
CREATE INDEX idx_campaign_templates_category ON campaign_management.campaign_templates(tenant_id, category);

CREATE INDEX idx_mailchimp_lists_tenant ON campaign_management.mailchimp_lists(tenant_id);
CREATE INDEX idx_mailchimp_lists_default ON campaign_management.mailchimp_lists(tenant_id, is_default);
