-- CMMS Database Rollback Script
-- This script rolls back the database migration from integer IDs back to CUID
-- 
-- WARNING: This will restore the database to its pre-migration state
-- Only use this if the migration has failed or needs to be reverted

BEGIN;

-- Log rollback start
INSERT INTO migration_log (step_name, status, details) 
VALUES ('rollback_start', 'started', '{"action": "rollback_to_cuid"}');

-- Step 1: Verify backup tables exist
DO $$
DECLARE
    table_name TEXT;
    backup_tables TEXT[] := ARRAY[
        'users_backup', 'roles_backup', 'teams_backup', 'locations_backup', 
        'categories_backup', 'assets_backup', 'documents_backup', 
        'sensor_streams_backup', 'work_orders_backup', 'tasks_backup', 
        'maintenance_plans_backup', 'spare_parts_backup', 'inventory_records_backup',
        'work_order_part_usage_backup', 'kpi_records_backup', 'audit_logs_backup'
    ];
    table_exists BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY backup_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = table_name
        ) INTO table_exists;
        
        IF NOT table_exists THEN
            RAISE EXCEPTION 'Backup table % does not exist. Cannot proceed with rollback.', table_name;
        END IF;
    END LOOP;
    
    INSERT INTO migration_log (step_name, status) 
    VALUES ('verify_backup_tables', 'completed');
END $$;

-- Step 2: Drop current tables (integer ID versions)
INSERT INTO migration_log (step_name, status) VALUES ('drop_current_tables', 'started');

-- Drop views first
DROP VIEW IF EXISTS users_api_view CASCADE;
DROP VIEW IF EXISTS assets_api_view CASCADE;

-- Drop current tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS kpi_records CASCADE;
DROP TABLE IF EXISTS work_order_part_usage CASCADE;
DROP TABLE IF EXISTS inventory_records CASCADE;
DROP TABLE IF EXISTS spare_parts CASCADE;
DROP TABLE IF EXISTS maintenance_plans CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS sensor_streams CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'drop_current_tables' AND status = 'started';

-- Step 3: Restore backup tables
INSERT INTO migration_log (step_name, status) VALUES ('restore_backup_tables', 'started');

-- Restore tables from backup
ALTER TABLE roles_backup RENAME TO roles;
ALTER TABLE teams_backup RENAME TO teams;
ALTER TABLE locations_backup RENAME TO locations;
ALTER TABLE categories_backup RENAME TO categories;
ALTER TABLE users_backup RENAME TO users;
ALTER TABLE assets_backup RENAME TO assets;
ALTER TABLE documents_backup RENAME TO documents;
ALTER TABLE sensor_streams_backup RENAME TO sensor_streams;
ALTER TABLE work_orders_backup RENAME TO work_orders;
ALTER TABLE tasks_backup RENAME TO tasks;
ALTER TABLE maintenance_plans_backup RENAME TO maintenance_plans;
ALTER TABLE spare_parts_backup RENAME TO spare_parts;
ALTER TABLE inventory_records_backup RENAME TO inventory_records;
ALTER TABLE work_order_part_usage_backup RENAME TO work_order_part_usage;
ALTER TABLE kpi_records_backup RENAME TO kpi_records;
ALTER TABLE audit_logs_backup RENAME TO audit_logs;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'restore_backup_tables' AND status = 'started';

-- Step 4: Clean up migration artifacts
INSERT INTO migration_log (step_name, status) VALUES ('cleanup_migration_artifacts', 'started');

-- Drop ID mapping tables
DROP TABLE IF EXISTS id_mapping_users CASCADE;
DROP TABLE IF EXISTS id_mapping_roles CASCADE;
DROP TABLE IF EXISTS id_mapping_teams CASCADE;
DROP TABLE IF EXISTS id_mapping_locations CASCADE;
DROP TABLE IF EXISTS id_mapping_categories CASCADE;
DROP TABLE IF EXISTS id_mapping_assets CASCADE;
DROP TABLE IF EXISTS id_mapping_documents CASCADE;
DROP TABLE IF EXISTS id_mapping_sensor_streams CASCADE;
DROP TABLE IF EXISTS id_mapping_work_orders CASCADE;
DROP TABLE IF EXISTS id_mapping_tasks CASCADE;
DROP TABLE IF EXISTS id_mapping_maintenance_plans CASCADE;
DROP TABLE IF EXISTS id_mapping_spare_parts CASCADE;
DROP TABLE IF EXISTS id_mapping_inventory_records CASCADE;
DROP TABLE IF EXISTS id_mapping_work_order_part_usage CASCADE;
DROP TABLE IF EXISTS id_mapping_kpi_records CASCADE;
DROP TABLE IF EXISTS id_mapping_audit_logs CASCADE;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'cleanup_migration_artifacts' AND status = 'started';

-- Step 5: Verify rollback
INSERT INTO migration_log (step_name, status) VALUES ('verify_rollback', 'started');

-- Verify all original tables are restored
DO $$
DECLARE
    table_count INTEGER;
    table_name TEXT;
    tables_to_verify TEXT[] := ARRAY[
        'users', 'roles', 'teams', 'locations', 'categories', 'assets',
        'documents', 'sensor_streams', 'work_orders', 'tasks', 
        'maintenance_plans', 'spare_parts', 'inventory_records',
        'work_order_part_usage', 'kpi_records', 'audit_logs'
    ];
    table_exists BOOLEAN;
    record_count INTEGER;
BEGIN
    FOREACH table_name IN ARRAY tables_to_verify
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = table_name
        ) INTO table_exists;
        
        IF NOT table_exists THEN
            RAISE EXCEPTION 'Table % was not restored properly', table_name;
        END IF;
        
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
        
        INSERT INTO migration_log (step_name, status, details) 
        VALUES ('verify_rollback_' || table_name, 'completed', 
                format('{"record_count": %s}', record_count));
    END LOOP;
END $$;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'verify_rollback' AND status = 'started';

-- Log rollback completion
INSERT INTO migration_log (step_name, status, completed_at, details) 
VALUES ('rollback_complete', 'completed', NOW(), 
        '{"message": "Database successfully rolled back to CUID-based schema"}');

COMMIT;

-- Rollback Complete!
-- 
-- The database has been restored to its original state with CUID-based IDs.
-- All backup tables have been restored and migration artifacts cleaned up.
-- 
-- Next Steps:
-- 1. Ensure your application code is compatible with CUID IDs
-- 2. Update Prisma schema if needed
-- 3. Regenerate Prisma client
-- 4. Test application functionality