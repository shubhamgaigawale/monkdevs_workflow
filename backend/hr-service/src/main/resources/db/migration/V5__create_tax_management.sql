-- Tax Declaration Module Migration
-- Creates tables for Indian tax declaration management (Old & New regime)

-- Table: tax_regimes
-- Stores tax regime definitions (Old regime and New regime)
CREATE TABLE hr_workflow.tax_regimes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    financial_year VARCHAR(10) NOT NULL, -- e.g., "2025-26"
    regime_type VARCHAR(20) NOT NULL, -- OLD, NEW
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, financial_year, regime_type)
);
CREATE INDEX idx_tax_regime_tenant_fy ON hr_workflow.tax_regimes(tenant_id, financial_year);

-- Table: tax_slabs
-- Stores tax slab details for each regime
CREATE TABLE hr_workflow.tax_slabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_regime_id UUID NOT NULL REFERENCES hr_workflow.tax_regimes(id) ON DELETE CASCADE,
    min_income DECIMAL(12,2) NOT NULL,
    max_income DECIMAL(12,2), -- NULL for highest slab
    tax_rate DECIMAL(5,2) NOT NULL, -- percentage
    slab_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tax_slab_regime ON hr_workflow.tax_slabs(tax_regime_id);

-- Table: employee_tax_declarations
-- Main tax declaration for each employee per financial year
CREATE TABLE hr_workflow.employee_tax_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    financial_year VARCHAR(10) NOT NULL,
    regime_type VARCHAR(20) NOT NULL, -- OLD, NEW
    total_declared_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED
    submitted_date TIMESTAMP,
    approved_date TIMESTAMP,
    approved_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id, financial_year)
);
CREATE INDEX idx_tax_declaration_user_fy ON hr_workflow.employee_tax_declarations(tenant_id, user_id, financial_year);
CREATE INDEX idx_tax_declaration_status ON hr_workflow.employee_tax_declarations(tenant_id, status);

-- Table: tax_declaration_items
-- Individual investment/deduction items
CREATE TABLE hr_workflow.tax_declaration_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    declaration_id UUID NOT NULL REFERENCES hr_workflow.employee_tax_declarations(id) ON DELETE CASCADE,
    section VARCHAR(20) NOT NULL, -- 80C, 80D, 80G, etc.
    sub_section VARCHAR(100), -- e.g., "PPF", "ELSS", "LIC Premium"
    description VARCHAR(500),
    declared_amount DECIMAL(10,2) NOT NULL,
    proof_file_path VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    verified_by UUID,
    verified_date TIMESTAMP,
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tax_item_declaration ON hr_workflow.tax_declaration_items(declaration_id);
CREATE INDEX idx_tax_item_section ON hr_workflow.tax_declaration_items(section);

-- Table: hra_declarations
-- Separate table for HRA declaration (requires detailed landlord info)
CREATE TABLE hr_workflow.hra_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    declaration_id UUID NOT NULL REFERENCES hr_workflow.employee_tax_declarations(id) ON DELETE CASCADE,
    rent_paid_monthly DECIMAL(10,2) NOT NULL,
    landlord_name VARCHAR(200) NOT NULL,
    landlord_pan VARCHAR(20),
    landlord_address TEXT,
    metro_city BOOLEAN DEFAULT FALSE,
    rent_receipts_path VARCHAR(500),
    calculated_exemption DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, declaration_id)
);
CREATE INDEX idx_hra_declaration ON hr_workflow.hra_declarations(declaration_id);

-- Table: tax_calculations
-- Stores calculated tax for both regimes
CREATE TABLE hr_workflow.tax_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    financial_year VARCHAR(10) NOT NULL,
    regime_type VARCHAR(20) NOT NULL,
    gross_salary DECIMAL(12,2) NOT NULL,
    standard_deduction DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) DEFAULT 0,
    taxable_income DECIMAL(12,2) NOT NULL,
    total_tax DECIMAL(12,2) NOT NULL,
    cess DECIMAL(12,2) DEFAULT 0, -- 4% health and education cess
    tds_monthly DECIMAL(10,2) DEFAULT 0,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tax_calc_user_fy ON hr_workflow.tax_calculations(tenant_id, user_id, financial_year);
CREATE INDEX idx_tax_calc_regime ON hr_workflow.tax_calculations(tenant_id, user_id, financial_year, regime_type);

-- Seed tax regimes for FY 2025-26

-- Insert OLD tax regime for FY 2025-26
INSERT INTO hr_workflow.tax_regimes (tenant_id, financial_year, regime_type, description, is_default)
SELECT tenant_id, '2025-26', 'OLD', 'Old tax regime with deductions and exemptions', FALSE
FROM hr_workflow.salary_components
GROUP BY tenant_id;

-- Insert NEW tax regime for FY 2025-26
INSERT INTO hr_workflow.tax_regimes (tenant_id, financial_year, regime_type, description, is_default)
SELECT tenant_id, '2025-26', 'NEW', 'New tax regime with lower rates, no deductions', TRUE
FROM hr_workflow.salary_components
GROUP BY tenant_id;

-- Seed tax slabs for OLD regime (FY 2025-26)
-- Up to ₹2.5 lakh: Nil
-- ₹2.5 lakh to ₹5 lakh: 5%
-- ₹5 lakh to ₹10 lakh: 20%
-- Above ₹10 lakh: 30%
INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 0, 250000, 0, 1 FROM hr_workflow.tax_regimes WHERE regime_type = 'OLD' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 250000, 500000, 5, 2 FROM hr_workflow.tax_regimes WHERE regime_type = 'OLD' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 500000, 1000000, 20, 3 FROM hr_workflow.tax_regimes WHERE regime_type = 'OLD' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 1000000, NULL, 30, 4 FROM hr_workflow.tax_regimes WHERE regime_type = 'OLD' AND financial_year = '2025-26';

-- Seed tax slabs for NEW regime (FY 2025-26)
-- Up to ₹3 lakh: Nil
-- ₹3 lakh to ₹6 lakh: 5%
-- ₹6 lakh to ₹9 lakh: 10%
-- ₹9 lakh to ₹12 lakh: 15%
-- ₹12 lakh to ₹15 lakh: 20%
-- Above ₹15 lakh: 30%
INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 0, 300000, 0, 1 FROM hr_workflow.tax_regimes WHERE regime_type = 'NEW' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 300000, 600000, 5, 2 FROM hr_workflow.tax_regimes WHERE regime_type = 'NEW' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 600000, 900000, 10, 3 FROM hr_workflow.tax_regimes WHERE regime_type = 'NEW' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 900000, 1200000, 15, 4 FROM hr_workflow.tax_regimes WHERE regime_type = 'NEW' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 1200000, 1500000, 20, 5 FROM hr_workflow.tax_regimes WHERE regime_type = 'NEW' AND financial_year = '2025-26';

INSERT INTO hr_workflow.tax_slabs (tax_regime_id, min_income, max_income, tax_rate, slab_order)
SELECT id, 1500000, NULL, 30, 6 FROM hr_workflow.tax_regimes WHERE regime_type = 'NEW' AND financial_year = '2025-26';
