-- CMMS Database Migration Script: Phase 1 - Schema Optimization
-- This script migrates from CUID-based IDs to integer-based IDs
-- 
-- IMPORTANT: Run this script in a transaction and test thoroughly before production use
-- 
-- Prerequisites:
-- 1. Full database backup completed
-- 2. Application downtime scheduled
-- 3. Rollback plan prepared

BEGIN;

-- Create a migration log table to track progress
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    details JSONB
);

-- Log migration start
INSERT INTO migration_log (step_name, status, details) 
VALUES ('migration_start', 'started', '{"version": "1.0", "type": "cuid_to_integer"}');

-- Step 1: Create new optimized tables with integer IDs
INSERT INTO migration_log (step_name, status) VALUES ('create_new_tables', 'started');

-- New Users table with integer ID
CREATE TABLE users_new (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(25) UNIQUE NOT NULL DEFAULT '', -- Will be populated from old id
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    team_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Roles table with integer ID
CREATE TABLE roles_new (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Teams table with integer ID
CREATE TABLE teams_new (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    site_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Locations table with integer ID
CREATE TABLE locations_new (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    type VARCHAR(50) NOT NULL,
    parent_id INTEGER,
    gis_coords JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Categories table with integer ID
CREATE TABLE categories_new (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    parent_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Assets table with integer ID
CREATE TABLE assets_new (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(25) UNIQUE NOT NULL DEFAULT '', -- Will be populated from old id
    tag VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(255),
    model VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    purchase_date DATE,
    commissioning_date DATE,
    warranty_expiry DATE,
    lifecycle_status VARCHAR(50) DEFAULT 'ACTIVE',
    criticality VARCHAR(50) DEFAULT 'MEDIUM',
    location_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    cost DECIMAL(15,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Work Orders table with integer ID
CREATE TABLE work_orders_new (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL,
    requestor_id INTEGER NOT NULL,
    assignee_id INTEGER,
    status VARCHAR(50) DEFAULT 'DRAFT',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Tasks table with integer ID
CREATE TABLE tasks_new (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_by INTEGER,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Maintenance Plans table with integer ID
CREATE TABLE maintenance_plans_new (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    frequency INTEGER,
    meter_threshold INTEGER,
    is_active BOOLEAN DEFAULT true,
    next_due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Spare Parts table with integer ID
CREATE TABLE spare_parts_new (
    id SERIAL PRIMARY KEY,
    part_number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_cost DECIMAL(15,2) NOT NULL,
    supplier_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Inventory Records table with integer ID
CREATE TABLE inventory_records_new (
    id SERIAL PRIMARY KEY,
    part_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    quantity_on_hand INTEGER NOT NULL,
    reorder_point INTEGER NOT NULL,
    safety_stock INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(part_id, location_id)
);

-- New Work Order Part Usage table with integer ID
CREATE TABLE work_order_part_usage_new (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL,
    part_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Documents table with integer ID
CREATE TABLE documents_new (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER,
    work_order_id INTEGER,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_uri VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Sensor Streams table with integer ID
CREATE TABLE sensor_streams_new (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    sampling_rate INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New KPI Records table with integer ID
CREATE TABLE kpi_records_new (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER,
    metric_type VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- New Audit Logs table with integer ID
CREATE TABLE audit_logs_new (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    action VARCHAR(255) NOT NULL,
    before_data JSONB,
    after_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'create_new_tables' AND status = 'started';

-- Step 2: Create ID mapping tables to track old CUID to new integer ID relationships
INSERT INTO migration_log (step_name, status) VALUES ('create_id_mappings', 'started');

CREATE TABLE id_mapping_users (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_roles (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_teams (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_locations (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_categories (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_assets (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_work_orders (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_tasks (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_maintenance_plans (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_spare_parts (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_inventory_records (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_work_order_part_usage (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_documents (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_sensor_streams (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_kpi_records (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE id_mapping_audit_logs (
    old_id VARCHAR(25) PRIMARY KEY,
    new_id INTEGER NOT NULL
);

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'create_id_mappings' AND status = 'started';

-- Log completion of Phase 1
INSERT INTO migration_log (step_name, status, completed_at) 
VALUES ('phase_1_complete', 'completed', NOW());

COMMIT;

-- Phase 1 Complete
-- Next: Run data migration script (migrate_data.sql)