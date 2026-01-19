-- ================================================
-- Employee Onboarding Module
-- Version: V3
-- Description: Tables for employee onboarding workflow, tasks, documents, and equipment
-- ================================================

-- Onboarding Templates Table
CREATE TABLE IF NOT EXISTS hr_workflow.onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_days INTEGER DEFAULT 90,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_onboarding_template_tenant ON hr_workflow.onboarding_templates(tenant_id);
CREATE INDEX idx_onboarding_template_status ON hr_workflow.onboarding_templates(tenant_id, status);

COMMENT ON TABLE hr_workflow.onboarding_templates IS 'Templates for onboarding workflows';
COMMENT ON COLUMN hr_workflow.onboarding_templates.duration_days IS 'Expected duration of onboarding in days (e.g., 90 days probation)';
COMMENT ON COLUMN hr_workflow.onboarding_templates.is_default IS 'Whether this is the default template for new employees';

-- Onboarding Tasks Table (Template tasks)
CREATE TABLE IF NOT EXISTS hr_workflow.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    template_id UUID NOT NULL REFERENCES hr_workflow.onboarding_templates(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_order INTEGER NOT NULL,
    due_days_from_start INTEGER NOT NULL,
    assigned_to_role VARCHAR(50),
    task_type VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE INDEX idx_onboarding_task_template ON hr_workflow.onboarding_tasks(template_id);
CREATE INDEX idx_onboarding_task_order ON hr_workflow.onboarding_tasks(template_id, task_order);

COMMENT ON TABLE hr_workflow.onboarding_tasks IS 'Template tasks that define the onboarding workflow';
COMMENT ON COLUMN hr_workflow.onboarding_tasks.due_days_from_start IS 'Days from onboarding start date when task is due';
COMMENT ON COLUMN hr_workflow.onboarding_tasks.assigned_to_role IS 'Role responsible for completing task (HR, IT, MANAGER, EMPLOYEE)';
COMMENT ON COLUMN hr_workflow.onboarding_tasks.task_type IS 'Type of task (DOCUMENT_UPLOAD, TRAINING, MEETING, SYSTEM_ACCESS, etc.)';

-- Employee Onboarding Table (Actual onboarding instances)
CREATE TABLE IF NOT EXISTS hr_workflow.employee_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    template_id UUID NOT NULL REFERENCES hr_workflow.onboarding_templates(id),
    start_date DATE NOT NULL,
    expected_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    manager_id UUID,
    buddy_id UUID,
    probation_end_date DATE,
    confirmation_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_employee_onboarding_user ON hr_workflow.employee_onboarding(tenant_id, user_id);
CREATE INDEX idx_employee_onboarding_status ON hr_workflow.employee_onboarding(tenant_id, status);
CREATE INDEX idx_employee_onboarding_manager ON hr_workflow.employee_onboarding(tenant_id, manager_id);

COMMENT ON TABLE hr_workflow.employee_onboarding IS 'Active onboarding records for employees';
COMMENT ON COLUMN hr_workflow.employee_onboarding.status IS 'Status: IN_PROGRESS, COMPLETED, ON_HOLD, TERMINATED';
COMMENT ON COLUMN hr_workflow.employee_onboarding.completion_percentage IS 'Percentage of tasks completed (0-100)';
COMMENT ON COLUMN hr_workflow.employee_onboarding.buddy_id IS 'Assigned buddy/mentor for the new employee';

-- Employee Onboarding Tasks Table (Instance tasks)
CREATE TABLE IF NOT EXISTS hr_workflow.employee_onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    onboarding_id UUID NOT NULL REFERENCES hr_workflow.employee_onboarding(id) ON DELETE CASCADE,
    task_id UUID REFERENCES hr_workflow.onboarding_tasks(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    assigned_to_role VARCHAR(50),
    assigned_to_user_id UUID,
    status VARCHAR(20) DEFAULT 'PENDING',
    completed_date TIMESTAMP,
    completed_by UUID,
    notes TEXT,
    task_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employee_onboarding_task_onboarding ON hr_workflow.employee_onboarding_tasks(onboarding_id);
CREATE INDEX idx_employee_onboarding_task_status ON hr_workflow.employee_onboarding_tasks(tenant_id, status);
CREATE INDEX idx_employee_onboarding_task_assigned ON hr_workflow.employee_onboarding_tasks(assigned_to_user_id, status);

COMMENT ON TABLE hr_workflow.employee_onboarding_tasks IS 'Actual task instances for each employee onboarding';
COMMENT ON COLUMN hr_workflow.employee_onboarding_tasks.status IS 'Status: PENDING, IN_PROGRESS, COMPLETED, SKIPPED';
COMMENT ON COLUMN hr_workflow.employee_onboarding_tasks.task_id IS 'Reference to template task (nullable for custom tasks)';

-- Employee Documents Table
CREATE TABLE IF NOT EXISTS hr_workflow.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    onboarding_id UUID REFERENCES hr_workflow.employee_onboarding(id),
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING_VERIFICATION',
    verified_by UUID,
    verified_date TIMESTAMP,
    verification_notes TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID
);

CREATE INDEX idx_employee_document_user ON hr_workflow.employee_documents(tenant_id, user_id);
CREATE INDEX idx_employee_document_onboarding ON hr_workflow.employee_documents(onboarding_id);
CREATE INDEX idx_employee_document_status ON hr_workflow.employee_documents(tenant_id, status);
CREATE INDEX idx_employee_document_type ON hr_workflow.employee_documents(tenant_id, document_type);

COMMENT ON TABLE hr_workflow.employee_documents IS 'Employee documents uploaded during onboarding and later';
COMMENT ON COLUMN hr_workflow.employee_documents.document_type IS 'Type: AADHAAR, PAN, PASSPORT, EDUCATION_CERTIFICATE, EXPERIENCE_LETTER, etc.';
COMMENT ON COLUMN hr_workflow.employee_documents.status IS 'Status: PENDING_VERIFICATION, VERIFIED, REJECTED, EXPIRED';
COMMENT ON COLUMN hr_workflow.employee_documents.expiry_date IS 'For documents like passport, visa that have expiry';

-- Equipment Assignments Table
CREATE TABLE IF NOT EXISTS hr_workflow.equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    onboarding_id UUID REFERENCES hr_workflow.employee_onboarding(id),
    equipment_type VARCHAR(100) NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(200),
    asset_tag VARCHAR(100),
    assigned_date DATE NOT NULL,
    return_date DATE,
    expected_return_date DATE,
    status VARCHAR(20) DEFAULT 'ASSIGNED',
    condition_at_assignment VARCHAR(50),
    condition_at_return VARCHAR(50),
    notes TEXT,
    assigned_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_assignment_user ON hr_workflow.equipment_assignments(tenant_id, user_id);
CREATE INDEX idx_equipment_assignment_status ON hr_workflow.equipment_assignments(tenant_id, status);
CREATE INDEX idx_equipment_assignment_type ON hr_workflow.equipment_assignments(tenant_id, equipment_type);

COMMENT ON TABLE hr_workflow.equipment_assignments IS 'Equipment assigned to employees (laptops, phones, etc.)';
COMMENT ON COLUMN hr_workflow.equipment_assignments.equipment_type IS 'Type: LAPTOP, DESKTOP, MOBILE, MONITOR, KEYBOARD, MOUSE, HEADSET, etc.';
COMMENT ON COLUMN hr_workflow.equipment_assignments.status IS 'Status: ASSIGNED, RETURNED, LOST, DAMAGED, UNDER_REPAIR';
COMMENT ON COLUMN hr_workflow.equipment_assignments.condition_at_assignment IS 'Condition: NEW, GOOD, FAIR, REFURBISHED';

-- Insert Default Onboarding Template
INSERT INTO hr_workflow.onboarding_templates (id, tenant_id, name, description, duration_days, is_default, status)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid, -- System template
    'Standard Onboarding',
    'Default onboarding workflow for new employees',
    90,
    true,
    'ACTIVE'
);

-- Get the template ID for inserting tasks
DO $$
DECLARE
    template_uuid UUID;
BEGIN
    SELECT id INTO template_uuid
    FROM hr_workflow.onboarding_templates
    WHERE name = 'Standard Onboarding'
    AND tenant_id = '00000000-0000-0000-0000-000000000000'::uuid;

    -- Insert Default Onboarding Tasks
    INSERT INTO hr_workflow.onboarding_tasks (tenant_id, template_id, title, description, task_order, due_days_from_start, assigned_to_role, task_type, is_mandatory)
    VALUES
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Upload Aadhaar Card', 'Upload scanned copy of Aadhaar card for identity verification', 1, 1, 'EMPLOYEE', 'DOCUMENT_UPLOAD', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Upload PAN Card', 'Upload scanned copy of PAN card for tax purposes', 2, 1, 'EMPLOYEE', 'DOCUMENT_UPLOAD', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Upload Education Certificates', 'Upload degree certificates and mark sheets', 3, 2, 'EMPLOYEE', 'DOCUMENT_UPLOAD', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Upload Bank Details', 'Upload cancelled cheque or bank passbook for salary credit', 4, 2, 'EMPLOYEE', 'DOCUMENT_UPLOAD', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Complete IT Setup', 'Setup email, laptop, and access to company systems', 5, 3, 'IT', 'SYSTEM_ACCESS', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Assign Equipment', 'Assign laptop, phone, and other equipment to employee', 6, 3, 'IT', 'EQUIPMENT', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Manager Introduction Meeting', 'Schedule and complete introduction meeting with reporting manager', 7, 5, 'MANAGER', 'MEETING', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Team Introduction', 'Introduce new employee to the team', 8, 5, 'MANAGER', 'MEETING', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Company Policy Training', 'Complete training on company policies and code of conduct', 9, 7, 'HR', 'TRAINING', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Security & Compliance Training', 'Complete security and compliance training modules', 10, 7, 'HR', 'TRAINING', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Set Goals & Objectives', 'Set initial goals and objectives for probation period', 11, 14, 'MANAGER', 'MEETING', true),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, '30-Day Check-in', '30-day review meeting with manager', 12, 30, 'MANAGER', 'MEETING', false),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, '60-Day Check-in', '60-day review meeting with manager', 13, 60, 'MANAGER', 'MEETING', false),
        ('00000000-0000-0000-0000-000000000000'::uuid, template_uuid, 'Probation Completion Review', 'Final review before probation completion', 14, 85, 'MANAGER', 'MEETING', true);
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Onboarding module tables created successfully';
END $$;
