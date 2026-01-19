-- ============================================
-- Salary Management Module
-- ============================================

-- Table: salary_components
-- Defines salary components like Basic, HRA, DA, etc.
CREATE TABLE IF NOT EXISTS hr_workflow.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    component_type VARCHAR(20) NOT NULL, -- EARNING, DEDUCTION
    calculation_type VARCHAR(20), -- FIXED, PERCENTAGE, FORMULA
    percentage DECIMAL(5,2),
    is_taxable BOOLEAN DEFAULT TRUE,
    is_fixed BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_salary_component_tenant_code UNIQUE(tenant_id, code)
);

CREATE INDEX idx_salary_component_tenant ON hr_workflow.salary_components(tenant_id);
CREATE INDEX idx_salary_component_type ON hr_workflow.salary_components(tenant_id, component_type);

-- Table: salary_structures
-- Defines salary structure templates
CREATE TABLE IF NOT EXISTS hr_workflow.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salary_structure_tenant ON hr_workflow.salary_structures(tenant_id);
CREATE INDEX idx_salary_structure_status ON hr_workflow.salary_structures(tenant_id, status);

-- Table: salary_structure_components
-- Links components to salary structures
CREATE TABLE IF NOT EXISTS hr_workflow.salary_structure_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_structure_id UUID NOT NULL REFERENCES hr_workflow.salary_structures(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES hr_workflow.salary_components(id),
    percentage DECIMAL(5,2),
    fixed_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_structure_component UNIQUE(salary_structure_id, component_id)
);

CREATE INDEX idx_structure_component_structure ON hr_workflow.salary_structure_components(salary_structure_id);

-- Table: employee_salaries
-- Assigns salary structures to employees
CREATE TABLE IF NOT EXISTS hr_workflow.employee_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    salary_structure_id UUID NOT NULL REFERENCES hr_workflow.salary_structures(id),
    ctc DECIMAL(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employee_salary_user ON hr_workflow.employee_salaries(tenant_id, user_id);
CREATE INDEX idx_employee_salary_status ON hr_workflow.employee_salaries(tenant_id, status);

-- Table: employee_salary_components
-- Stores calculated component amounts for each employee
CREATE TABLE IF NOT EXISTS hr_workflow.employee_salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_salary_id UUID NOT NULL REFERENCES hr_workflow.employee_salaries(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES hr_workflow.salary_components(id),
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_emp_salary_component UNIQUE(employee_salary_id, component_id)
);

CREATE INDEX idx_emp_salary_comp_emp_salary ON hr_workflow.employee_salary_components(employee_salary_id);

-- Table: salary_slips
-- Monthly salary slips for employees
CREATE TABLE IF NOT EXISTS hr_workflow.salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    employee_salary_id UUID NOT NULL REFERENCES hr_workflow.employee_salaries(id),
    gross_salary DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    paid_days DECIMAL(5,2),
    lop_days DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, GENERATED, PAID
    generated_date TIMESTAMP,
    paid_date DATE,
    file_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_salary_slip_user_month_year UNIQUE(tenant_id, user_id, month, year)
);

CREATE INDEX idx_salary_slip_user_month ON hr_workflow.salary_slips(tenant_id, user_id, year, month);
CREATE INDEX idx_salary_slip_status ON hr_workflow.salary_slips(tenant_id, status);

-- Table: salary_slip_components
-- Component breakdown for each salary slip
CREATE TABLE IF NOT EXISTS hr_workflow.salary_slip_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_slip_id UUID NOT NULL REFERENCES hr_workflow.salary_slips(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES hr_workflow.salary_components(id),
    component_name VARCHAR(100) NOT NULL,
    component_type VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salary_slip_comp_slip ON hr_workflow.salary_slip_components(salary_slip_id);

-- Table: employee_bank_details
-- Employee banking information for salary payment
CREATE TABLE IF NOT EXISTS hr_workflow.employee_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    bank_name VARCHAR(200) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(200),
    account_holder_name VARCHAR(200) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'SAVINGS', -- SAVINGS, CURRENT
    is_primary BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_bank_detail_user UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_bank_detail_user ON hr_workflow.employee_bank_details(tenant_id, user_id);

-- Insert standard salary components for India
-- Earnings
INSERT INTO hr_workflow.salary_components (tenant_id, name, code, component_type, calculation_type, percentage, is_taxable, is_fixed, display_order, status)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'Basic Salary', 'BASIC', 'EARNING', 'PERCENTAGE', 40.00, TRUE, FALSE, 1, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'House Rent Allowance', 'HRA', 'EARNING', 'PERCENTAGE', 25.00, TRUE, FALSE, 2, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Dearness Allowance', 'DA', 'EARNING', 'PERCENTAGE', 15.00, TRUE, FALSE, 3, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Conveyance Allowance', 'CONVEYANCE', 'EARNING', 'FIXED', NULL, TRUE, TRUE, 4, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Medical Allowance', 'MEDICAL', 'EARNING', 'FIXED', NULL, TRUE, TRUE, 5, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Special Allowance', 'SPECIAL', 'EARNING', 'PERCENTAGE', 20.00, TRUE, FALSE, 6, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Performance Bonus', 'BONUS', 'EARNING', 'FIXED', NULL, TRUE, TRUE, 7, 'ACTIVE');

-- Deductions
INSERT INTO hr_workflow.salary_components (tenant_id, name, code, component_type, calculation_type, percentage, is_taxable, is_fixed, display_order, status)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'Provident Fund', 'PF', 'DEDUCTION', 'PERCENTAGE', 12.00, FALSE, FALSE, 1, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Employee State Insurance', 'ESI', 'DEDUCTION', 'PERCENTAGE', 0.75, FALSE, FALSE, 2, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Professional Tax', 'PT', 'DEDUCTION', 'FIXED', NULL, FALSE, TRUE, 3, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Tax Deducted at Source', 'TDS', 'DEDUCTION', 'FORMULA', NULL, FALSE, TRUE, 4, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000000', 'Loan Deduction', 'LOAN', 'DEDUCTION', 'FIXED', NULL, FALSE, TRUE, 5, 'ACTIVE');

COMMENT ON TABLE hr_workflow.salary_components IS 'Defines reusable salary components like Basic, HRA, PF, etc.';
COMMENT ON TABLE hr_workflow.salary_structures IS 'Salary structure templates defining component percentages';
COMMENT ON TABLE hr_workflow.employee_salaries IS 'Assigns salary structures to employees with CTC';
COMMENT ON TABLE hr_workflow.salary_slips IS 'Monthly salary slips for employees';
COMMENT ON TABLE hr_workflow.employee_bank_details IS 'Employee banking information for salary payment';
