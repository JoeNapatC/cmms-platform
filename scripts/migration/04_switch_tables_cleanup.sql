-- CMMS Database Migration Script: Phase 4 - Switch Tables and Cleanup
-- This script switches the old tables with new ones and performs cleanup
-- 
-- IMPORTANT: This is the final phase and will make the migration permanent
-- Ensure you have a complete backup before running this script

BEGIN;

-- Log migration start
INSERT INTO migration_log (step_name, status, details) 
VALUES ('phase_4_start', 'started', '{"phase": "4", "type": "table_switch_cleanup"}');

-- Step 1: Verify data integrity before switching
INSERT INTO migration_log (step_name, status) VALUES ('verify_data_integrity', 'started');

-- Check record counts match
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'users', 'roles', 'teams', 'locations', 'categories', 'assets',
        'documents', 'sensor_streams', 'work_orders', 'tasks', 
        'maintenance_plans', 'spare_parts', 'inventory_records',
        'work_order_part_usage', 'kpi_records', 'audit_logs'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO old_count;
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name || '_new') INTO new_count;
        
        IF old_count != new_count THEN
            RAISE EXCEPTION 'Data integrity check failed for table %: old_count=%, new_count=%', 
                table_name, old_count, new_count;
        END IF;
        
        INSERT INTO migration_log (step_name, status, details) 
        VALUES ('verify_' || table_name, 'completed', 
                format('{"old_count": %s, "new_count": %s}', old_count, new_count));
    END LOOP;
END $$;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'verify_data_integrity' AND status = 'started';

-- Step 2: Create backup of old tables
INSERT INTO migration_log (step_name, status) VALUES ('backup_old_tables', 'started');

-- Rename old tables to backup
ALTER TABLE users RENAME TO users_backup;
ALTER TABLE roles RENAME TO roles_backup;
ALTER TABLE teams RENAME TO teams_backup;
ALTER TABLE locations RENAME TO locations_backup;
ALTER TABLE categories RENAME TO categories_backup;
ALTER TABLE assets RENAME TO assets_backup;
ALTER TABLE documents RENAME TO documents_backup;
ALTER TABLE sensor_streams RENAME TO sensor_streams_backup;
ALTER TABLE work_orders RENAME TO work_orders_backup;
ALTER TABLE tasks RENAME TO tasks_backup;
ALTER TABLE maintenance_plans RENAME TO maintenance_plans_backup;
ALTER TABLE spare_parts RENAME TO spare_parts_backup;
ALTER TABLE inventory_records RENAME TO inventory_records_backup;
ALTER TABLE work_order_part_usage RENAME TO work_order_part_usage_backup;
ALTER TABLE kpi_records RENAME TO kpi_records_backup;
ALTER TABLE audit_logs RENAME TO audit_logs_backup;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'backup_old_tables' AND status = 'started';

-- Step 3: Switch new tables to production names
INSERT INTO migration_log (step_name, status) VALUES ('switch_to_new_tables', 'started');

-- Rename new tables to production names
ALTER TABLE users_new RENAME TO users;
ALTER TABLE roles_new RENAME TO roles;
ALTER TABLE teams_new RENAME TO teams;
ALTER TABLE locations_new RENAME TO locations;
ALTER TABLE categories_new RENAME TO categories;
ALTER TABLE assets_new RENAME TO assets;
ALTER TABLE documents_new RENAME TO documents;
ALTER TABLE sensor_streams_new RENAME TO sensor_streams;
ALTER TABLE work_orders_new RENAME TO work_orders;
ALTER TABLE tasks_new RENAME TO tasks;
ALTER TABLE maintenance_plans_new RENAME TO maintenance_plans;
ALTER TABLE spare_parts_new RENAME TO spare_parts;
ALTER TABLE inventory_records_new RENAME TO inventory_records;
ALTER TABLE work_order_part_usage_new RENAME TO work_order_part_usage;
ALTER TABLE kpi_records_new RENAME TO kpi_records;
ALTER TABLE audit_logs_new RENAME TO audit_logs;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'switch_to_new_tables' AND status = 'started';

-- Step 4: Create indexes for performance
INSERT INTO migration_log (step_name, status) VALUES ('create_performance_indexes', 'started');

-- Users indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Assets indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_tag ON assets(tag);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_location_id ON assets(location_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_status ON assets(lifecycle_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_criticality ON assets(criticality);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_is_active ON assets(is_active);

-- Work Orders indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_created_by ON work_orders(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_priority ON work_orders(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_scheduled_date ON work_orders(scheduled_date);

-- Tasks indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_work_order_id ON tasks(work_order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Locations indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_parent_id ON locations(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_is_active ON locations(is_active);

-- Categories indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Documents indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_asset_id ON documents(asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_type ON documents(type);

-- Sensor Streams indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensor_streams_asset_id ON sensor_streams(asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensor_streams_is_active ON sensor_streams(is_active);

-- Maintenance Plans indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maintenance_plans_asset_id ON maintenance_plans(asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maintenance_plans_is_active ON maintenance_plans(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maintenance_plans_next_due ON maintenance_plans(next_due);

-- Inventory Records indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_records_part_id ON inventory_records(part_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_records_location_id ON inventory_records(location_id);

-- KPI Records indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kpi_records_asset_id ON kpi_records(asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kpi_records_recorded_date ON kpi_records(recorded_date);

-- Audit Logs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'create_performance_indexes' AND status = 'started';

-- Step 5: Update sequences to match current max IDs
INSERT INTO migration_log (step_name, status) VALUES ('update_sequences', 'started');

-- Update sequences for all tables
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1));
SELECT setval('teams_id_seq', COALESCE((SELECT MAX(id) FROM teams), 1));
SELECT setval('locations_id_seq', COALESCE((SELECT MAX(id) FROM locations), 1));
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('assets_id_seq', COALESCE((SELECT MAX(id) FROM assets), 1));
SELECT setval('documents_id_seq', COALESCE((SELECT MAX(id) FROM documents), 1));
SELECT setval('sensor_streams_id_seq', COALESCE((SELECT MAX(id) FROM sensor_streams), 1));
SELECT setval('work_orders_id_seq', COALESCE((SELECT MAX(id) FROM work_orders), 1));
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1));
SELECT setval('maintenance_plans_id_seq', COALESCE((SELECT MAX(id) FROM maintenance_plans), 1));
SELECT setval('spare_parts_id_seq', COALESCE((SELECT MAX(id) FROM spare_parts), 1));
SELECT setval('inventory_records_id_seq', COALESCE((SELECT MAX(id) FROM inventory_records), 1));
SELECT setval('work_order_part_usage_id_seq', COALESCE((SELECT MAX(id) FROM work_order_part_usage), 1));
SELECT setval('kpi_records_id_seq', COALESCE((SELECT MAX(id) FROM kpi_records), 1));
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1));

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'update_sequences' AND status = 'started';

-- Step 6: Create views for backward compatibility (optional)
INSERT INTO migration_log (step_name, status) VALUES ('create_compatibility_views', 'started');

-- Create a view that maps new integer IDs back to UUIDs for external APIs
CREATE OR REPLACE VIEW users_api_view AS
SELECT 
    uuid as id,  -- Expose UUID as id for API compatibility
    email,
    name,
    role_id,
    team_id,
    is_active,
    created_at,
    updated_at
FROM users;

CREATE OR REPLACE VIEW assets_api_view AS
SELECT 
    uuid as id,  -- Expose UUID as id for API compatibility
    tag,
    serial_number,
    model,
    manufacturer,
    purchase_date,
    commissioning_date,
    warranty_expiry,
    lifecycle_status,
    criticality,
    location_id,
    category_id,
    cost,
    description,
    is_active,
    created_at,
    updated_at
FROM assets;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'create_compatibility_views' AND status = 'started';

-- Step 7: Final verification
INSERT INTO migration_log (step_name, status) VALUES ('final_verification', 'started');

-- Verify all tables exist and have data
DO $$
DECLARE
    table_count INTEGER;
    total_records INTEGER := 0;
    table_name TEXT;
    record_count INTEGER;
    tables_to_verify TEXT[] := ARRAY[
        'users', 'roles', 'teams', 'locations', 'categories', 'assets',
        'documents', 'sensor_streams', 'work_orders', 'tasks', 
        'maintenance_plans', 'spare_parts', 'inventory_records',
        'work_order_part_usage', 'kpi_records', 'audit_logs'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_verify
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
        total_records := total_records + record_count;
        
        INSERT INTO migration_log (step_name, status, details) 
        VALUES ('verify_final_' || table_name, 'completed', 
                format('{"record_count": %s}', record_count));
    END LOOP;
    
    INSERT INTO migration_log (step_name, status, details) 
    VALUES ('final_verification_summary', 'completed', 
            format('{"total_records": %s, "tables_verified": %s}', 
                   total_records, array_length(tables_to_verify, 1)));
END $$;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'final_verification' AND status = 'started';

-- Log completion of entire migration
INSERT INTO migration_log (step_name, status, completed_at, details) 
VALUES ('migration_complete', 'completed', NOW(), 
        '{"message": "Database migration from CUID to integer IDs completed successfully"}');

-- Generate final migration report
INSERT INTO migration_log (step_name, status, completed_at, details)
SELECT 
    'migration_final_report',
    'completed',
    NOW(),
    json_build_object(
        'total_steps', COUNT(*),
        'successful_steps', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed_steps', COUNT(*) FILTER (WHERE status = 'failed'),
        'total_duration_seconds', EXTRACT(EPOCH FROM (MAX(completed_at) - MIN(created_at))),
        'start_time', MIN(created_at),
        'end_time', MAX(completed_at)
    )::text
FROM migration_log;

COMMIT;

-- Migration Complete!
-- 
-- Next Steps:
-- 1. Update your Prisma schema to use the optimized version
-- 2. Generate new Prisma client
-- 3. Update application code to use integer IDs
-- 4. Test thoroughly in development
-- 5. Monitor performance improvements
--
-- Backup tables are preserved with '_backup' suffix for safety
-- ID mapping tables are preserved for reference if needed