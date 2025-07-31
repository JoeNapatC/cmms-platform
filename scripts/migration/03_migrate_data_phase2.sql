-- CMMS Database Migration Script: Phase 3 - Migrate Dependent Tables
-- This script migrates the remaining tables that depend on the core entities
-- 
-- IMPORTANT: This script should be run after Phase 2 (data migration)

BEGIN;

-- Log migration start
INSERT INTO migration_log (step_name, status, details) 
VALUES ('phase_3_start', 'started', '{"phase": "3", "type": "dependent_tables"}');

-- Step 1: Migrate Documents (depends on assets)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_documents', 'started');

INSERT INTO documents_new (
    uuid, name, type, file_path, file_size, mime_type, 
    asset_id, uploaded_by, created_at, updated_at
)
SELECT 
    d.id as uuid,
    d.name,
    d.type::text,
    d.file_path,
    d.file_size,
    d.mime_type,
    im_asset.new_id as asset_id,
    im_user.new_id as uploaded_by,
    d.created_at,
    d.updated_at
FROM documents d
JOIN id_mapping_assets im_asset ON d.asset_id = im_asset.old_id
JOIN id_mapping_users im_user ON d.uploaded_by = im_user.old_id
ORDER BY d.created_at;

-- Create ID mapping for documents
INSERT INTO id_mapping_documents (old_id, new_id)
SELECT d_old.id, d_new.id
FROM documents d_old
JOIN documents_new d_new ON d_old.id = d_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_documents' AND status = 'started';

-- Step 2: Migrate Sensor Streams (depends on assets)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_sensor_streams', 'started');

INSERT INTO sensor_streams_new (
    uuid, name, sensor_type, unit, asset_id, 
    is_active, created_at, updated_at
)
SELECT 
    ss.id as uuid,
    ss.name,
    ss.sensor_type::text,
    ss.unit,
    im_asset.new_id as asset_id,
    ss.is_active,
    ss.created_at,
    ss.updated_at
FROM sensor_streams ss
JOIN id_mapping_assets im_asset ON ss.asset_id = im_asset.old_id
ORDER BY ss.created_at;

-- Create ID mapping for sensor streams
INSERT INTO id_mapping_sensor_streams (old_id, new_id)
SELECT ss_old.id, ss_new.id
FROM sensor_streams ss_old
JOIN sensor_streams_new ss_new ON ss_old.id = ss_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_sensor_streams' AND status = 'started';

-- Step 3: Migrate Work Orders (depends on assets and users)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_work_orders', 'started');

INSERT INTO work_orders_new (
    uuid, title, description, priority, status, type, 
    asset_id, assigned_to, created_by, scheduled_date, 
    completed_date, estimated_hours, actual_hours, 
    created_at, updated_at
)
SELECT 
    wo.id as uuid,
    wo.title,
    wo.description,
    wo.priority::text,
    wo.status::text,
    wo.type::text,
    im_asset.new_id as asset_id,
    im_assigned.new_id as assigned_to,
    im_created.new_id as created_by,
    wo.scheduled_date,
    wo.completed_date,
    wo.estimated_hours,
    wo.actual_hours,
    wo.created_at,
    wo.updated_at
FROM work_orders wo
JOIN id_mapping_assets im_asset ON wo.asset_id = im_asset.old_id
LEFT JOIN id_mapping_users im_assigned ON wo.assigned_to = im_assigned.old_id
JOIN id_mapping_users im_created ON wo.created_by = im_created.old_id
ORDER BY wo.created_at;

-- Create ID mapping for work orders
INSERT INTO id_mapping_work_orders (old_id, new_id)
SELECT wo_old.id, wo_new.id
FROM work_orders wo_old
JOIN work_orders_new wo_new ON wo_old.id = wo_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_work_orders' AND status = 'started';

-- Step 4: Migrate Tasks (depends on work orders and users)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_tasks', 'started');

INSERT INTO tasks_new (
    uuid, title, description, status, work_order_id, 
    assigned_to, estimated_hours, actual_hours, 
    completed_date, created_at, updated_at
)
SELECT 
    t.id as uuid,
    t.title,
    t.description,
    t.status::text,
    im_wo.new_id as work_order_id,
    im_user.new_id as assigned_to,
    t.estimated_hours,
    t.actual_hours,
    t.completed_date,
    t.created_at,
    t.updated_at
FROM tasks t
JOIN id_mapping_work_orders im_wo ON t.work_order_id = im_wo.old_id
LEFT JOIN id_mapping_users im_user ON t.assigned_to = im_user.old_id
ORDER BY t.created_at;

-- Create ID mapping for tasks
INSERT INTO id_mapping_tasks (old_id, new_id)
SELECT t_old.id, t_new.id
FROM tasks t_old
JOIN tasks_new t_new ON t_old.id = t_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_tasks' AND status = 'started';

-- Step 5: Migrate Maintenance Plans (depends on assets and users)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_maintenance_plans', 'started');

INSERT INTO maintenance_plans_new (
    uuid, name, description, frequency_type, frequency_value,
    asset_id, created_by, is_active, last_executed, 
    next_due, created_at, updated_at
)
SELECT 
    mp.id as uuid,
    mp.name,
    mp.description,
    mp.frequency_type::text,
    mp.frequency_value,
    im_asset.new_id as asset_id,
    im_user.new_id as created_by,
    mp.is_active,
    mp.last_executed,
    mp.next_due,
    mp.created_at,
    mp.updated_at
FROM maintenance_plans mp
JOIN id_mapping_assets im_asset ON mp.asset_id = im_asset.old_id
JOIN id_mapping_users im_user ON mp.created_by = im_user.old_id
ORDER BY mp.created_at;

-- Create ID mapping for maintenance plans
INSERT INTO id_mapping_maintenance_plans (old_id, new_id)
SELECT mp_old.id, mp_new.id
FROM maintenance_plans mp_old
JOIN maintenance_plans_new mp_new ON mp_old.id = mp_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_maintenance_plans' AND status = 'started';

-- Step 6: Migrate Inventory Records (depends on spare parts and locations)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_inventory_records', 'started');

INSERT INTO inventory_records_new (
    uuid, part_id, location_id, quantity, min_stock_level,
    max_stock_level, reorder_point, last_updated, created_at, updated_at
)
SELECT 
    ir.id as uuid,
    im_part.new_id as part_id,
    im_loc.new_id as location_id,
    ir.quantity,
    ir.min_stock_level,
    ir.max_stock_level,
    ir.reorder_point,
    ir.last_updated,
    ir.created_at,
    ir.updated_at
FROM inventory_records ir
JOIN id_mapping_spare_parts im_part ON ir.part_id = im_part.old_id
JOIN id_mapping_locations im_loc ON ir.location_id = im_loc.old_id
ORDER BY ir.created_at;

-- Create ID mapping for inventory records
INSERT INTO id_mapping_inventory_records (old_id, new_id)
SELECT ir_old.id, ir_new.id
FROM inventory_records ir_old
JOIN inventory_records_new ir_new ON ir_old.id = ir_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_inventory_records' AND status = 'started';

-- Step 7: Migrate Work Order Part Usage (depends on work orders and spare parts)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_work_order_part_usage', 'started');

INSERT INTO work_order_part_usage_new (
    uuid, work_order_id, part_id, quantity_used, 
    unit_cost, total_cost, created_at, updated_at
)
SELECT 
    wopu.id as uuid,
    im_wo.new_id as work_order_id,
    im_part.new_id as part_id,
    wopu.quantity_used,
    wopu.unit_cost,
    wopu.total_cost,
    wopu.created_at,
    wopu.updated_at
FROM work_order_part_usage wopu
JOIN id_mapping_work_orders im_wo ON wopu.work_order_id = im_wo.old_id
JOIN id_mapping_spare_parts im_part ON wopu.part_id = im_part.old_id
ORDER BY wopu.created_at;

-- Create ID mapping for work order part usage
INSERT INTO id_mapping_work_order_part_usage (old_id, new_id)
SELECT wopu_old.id, wopu_new.id
FROM work_order_part_usage wopu_old
JOIN work_order_part_usage_new wopu_new ON wopu_old.id = wopu_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_work_order_part_usage' AND status = 'started';

-- Step 8: Migrate KPI Records (depends on assets)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_kpi_records', 'started');

INSERT INTO kpi_records_new (
    uuid, kpi_name, value, unit, asset_id, 
    recorded_date, created_at, updated_at
)
SELECT 
    kr.id as uuid,
    kr.kpi_name,
    kr.value,
    kr.unit,
    im_asset.new_id as asset_id,
    kr.recorded_date,
    kr.created_at,
    kr.updated_at
FROM kpi_records kr
JOIN id_mapping_assets im_asset ON kr.asset_id = im_asset.old_id
ORDER BY kr.created_at;

-- Create ID mapping for KPI records
INSERT INTO id_mapping_kpi_records (old_id, new_id)
SELECT kr_old.id, kr_new.id
FROM kpi_records kr_old
JOIN kpi_records_new kr_new ON kr_old.id = kr_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_kpi_records' AND status = 'started';

-- Step 9: Migrate Audit Logs (depends on users)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_audit_logs', 'started');

INSERT INTO audit_logs_new (
    uuid, action, entity_type, entity_id, old_values, 
    new_values, user_id, ip_address, user_agent, created_at
)
SELECT 
    al.id as uuid,
    al.action::text,
    al.entity_type,
    al.entity_id, -- Keep as string for now, will need mapping later
    al.old_values,
    al.new_values,
    im_user.new_id as user_id,
    al.ip_address,
    al.user_agent,
    al.created_at
FROM audit_logs al
LEFT JOIN id_mapping_users im_user ON al.user_id = im_user.old_id
ORDER BY al.created_at;

-- Create ID mapping for audit logs
INSERT INTO id_mapping_audit_logs (old_id, new_id)
SELECT al_old.id, al_new.id
FROM audit_logs al_old
JOIN audit_logs_new al_new ON al_old.id = al_new.uuid;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_audit_logs' AND status = 'started';

-- Log completion of Phase 3
INSERT INTO migration_log (step_name, status, completed_at, details) 
VALUES ('phase_3_complete', 'completed', NOW(), '{"message": "All dependent tables migrated successfully"}');

-- Generate migration summary
INSERT INTO migration_log (step_name, status, completed_at, details)
SELECT 
    'migration_summary',
    'completed',
    NOW(),
    json_build_object(
        'total_tables_migrated', COUNT(*),
        'migration_duration', EXTRACT(EPOCH FROM (MAX(completed_at) - MIN(created_at))),
        'tables', array_agg(step_name)
    )::text
FROM migration_log 
WHERE step_name LIKE 'migrate_%' AND status = 'completed';

COMMIT;

-- Phase 3 Complete
-- Next: Run Phase 4 (switch tables and cleanup)