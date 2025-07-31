-- CMMS Database Migration Script: Phase 2 - Data Migration
-- This script migrates data from old CUID tables to new integer-based tables
-- 
-- IMPORTANT: This script should be run after Phase 1 (schema creation)

BEGIN;

-- Log migration start
INSERT INTO migration_log (step_name, status, details) 
VALUES ('data_migration_start', 'started', '{"phase": "2", "type": "data_transfer"}');

-- Step 1: Migrate Roles (no dependencies)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_roles', 'started');

INSERT INTO roles_new (name, description, permissions, created_at, updated_at)
SELECT name, description, permissions, created_at, updated_at
FROM roles
ORDER BY created_at;

-- Create ID mapping for roles
INSERT INTO id_mapping_roles (old_id, new_id)
SELECT r_old.id, r_new.id
FROM roles r_old
JOIN roles_new r_new ON r_old.name = r_new.name;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_roles' AND status = 'started';

-- Step 2: Migrate Locations (with hierarchy - need to handle parent relationships)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_locations', 'started');

-- First, migrate root locations (no parent)
INSERT INTO locations_new (name, code, type, gis_coords, description, is_active, created_at, updated_at)
SELECT 
    name, 
    SUBSTRING(name, 1, 50) as code, -- Generate code from name
    type::text, 
    gis_coords, 
    description, 
    true as is_active,
    created_at, 
    updated_at
FROM locations
WHERE parent_id IS NULL
ORDER BY created_at;

-- Create ID mapping for root locations
INSERT INTO id_mapping_locations (old_id, new_id)
SELECT l_old.id, l_new.id
FROM locations l_old
JOIN locations_new l_new ON l_old.name = l_new.name
WHERE l_old.parent_id IS NULL;

-- Migrate child locations (with parent references)
WITH RECURSIVE location_hierarchy AS (
    -- Base case: root locations (already migrated)
    SELECT id, name, type, parent_id, gis_coords, description, created_at, updated_at, 1 as level
    FROM locations
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child locations
    SELECT l.id, l.name, l.type, l.parent_id, l.gis_coords, l.description, l.created_at, l.updated_at, lh.level + 1
    FROM locations l
    JOIN location_hierarchy lh ON l.parent_id = lh.id
)
INSERT INTO locations_new (name, code, type, parent_id, gis_coords, description, is_active, created_at, updated_at)
SELECT 
    lh.name,
    SUBSTRING(lh.name, 1, 50) as code,
    lh.type::text,
    im.new_id as parent_id,
    lh.gis_coords,
    lh.description,
    true as is_active,
    lh.created_at,
    lh.updated_at
FROM location_hierarchy lh
JOIN id_mapping_locations im ON lh.parent_id = im.old_id
WHERE lh.level > 1
ORDER BY lh.level, lh.created_at;

-- Create ID mapping for child locations
INSERT INTO id_mapping_locations (old_id, new_id)
SELECT l_old.id, l_new.id
FROM locations l_old
JOIN locations_new l_new ON l_old.name = l_new.name
LEFT JOIN id_mapping_locations im_existing ON l_old.id = im_existing.old_id
WHERE l_old.parent_id IS NOT NULL AND im_existing.old_id IS NULL;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_locations' AND status = 'started';

-- Step 3: Migrate Teams (depends on locations)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_teams', 'started');

INSERT INTO teams_new (name, site_id, created_at, updated_at)
SELECT 
    t.name,
    im_loc.new_id as site_id,
    t.created_at,
    t.updated_at
FROM teams t
JOIN id_mapping_locations im_loc ON t.site_id = im_loc.old_id
ORDER BY t.created_at;

-- Create ID mapping for teams
INSERT INTO id_mapping_teams (old_id, new_id)
SELECT t_old.id, t_new.id
FROM teams t_old
JOIN teams_new t_new ON t_old.name = t_new.name;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_teams' AND status = 'started';

-- Step 4: Migrate Users (depends on roles and teams)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_users', 'started');

INSERT INTO users_new (uuid, email, name, password, role_id, team_id, is_active, created_at, updated_at)
SELECT 
    u.id as uuid, -- Store old CUID as UUID for external API compatibility
    u.email,
    u.name,
    u.password,
    im_role.new_id as role_id,
    im_team.new_id as team_id,
    u.is_active,
    u.created_at,
    u.updated_at
FROM users u
JOIN id_mapping_roles im_role ON u.role_id = im_role.old_id
LEFT JOIN id_mapping_teams im_team ON u.team_id = im_team.old_id
ORDER BY u.created_at;

-- Create ID mapping for users
INSERT INTO id_mapping_users (old_id, new_id)
SELECT u_old.id, u_new.id
FROM users u_old
JOIN users_new u_new ON u_old.email = u_new.email;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_users' AND status = 'started';

-- Step 5: Migrate Categories (with hierarchy)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_categories', 'started');

-- First, migrate root categories (no parent)
INSERT INTO categories_new (name, code, description, is_active, created_at, updated_at)
SELECT 
    name,
    SUBSTRING(name, 1, 50) as code,
    description,
    true as is_active,
    created_at,
    updated_at
FROM categories
WHERE parent_id IS NULL
ORDER BY created_at;

-- Create ID mapping for root categories
INSERT INTO id_mapping_categories (old_id, new_id)
SELECT c_old.id, c_new.id
FROM categories c_old
JOIN categories_new c_new ON c_old.name = c_new.name
WHERE c_old.parent_id IS NULL;

-- Migrate child categories (similar to locations)
WITH RECURSIVE category_hierarchy AS (
    SELECT id, name, description, parent_id, created_at, updated_at, 1 as level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT c.id, c.name, c.description, c.parent_id, c.created_at, c.updated_at, ch.level + 1
    FROM categories c
    JOIN category_hierarchy ch ON c.parent_id = ch.id
)
INSERT INTO categories_new (name, code, description, parent_id, is_active, created_at, updated_at)
SELECT 
    ch.name,
    SUBSTRING(ch.name, 1, 50) as code,
    ch.description,
    im.new_id as parent_id,
    true as is_active,
    ch.created_at,
    ch.updated_at
FROM category_hierarchy ch
JOIN id_mapping_categories im ON ch.parent_id = im.old_id
WHERE ch.level > 1
ORDER BY ch.level, ch.created_at;

-- Create ID mapping for child categories
INSERT INTO id_mapping_categories (old_id, new_id)
SELECT c_old.id, c_new.id
FROM categories c_old
JOIN categories_new c_new ON c_old.name = c_new.name
LEFT JOIN id_mapping_categories im_existing ON c_old.id = im_existing.old_id
WHERE c_old.parent_id IS NOT NULL AND im_existing.old_id IS NULL;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_categories' AND status = 'started';

-- Step 6: Migrate Assets (depends on locations and categories)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_assets', 'started');

INSERT INTO assets_new (
    uuid, tag, serial_number, model, manufacturer, purchase_date, 
    commissioning_date, warranty_expiry, lifecycle_status, criticality,
    location_id, category_id, cost, description, is_active, created_at, updated_at
)
SELECT 
    a.id as uuid, -- Store old CUID as UUID
    a.tag,
    a.serial_number,
    a.model,
    a.manufacturer,
    a.purchase_date,
    a.commissioning_date,
    a.warranty_expiry,
    a.lifecycle_status::text,
    a.criticality::text,
    im_loc.new_id as location_id,
    im_cat.new_id as category_id,
    a.cost,
    a.description,
    true as is_active,
    a.created_at,
    a.updated_at
FROM assets a
JOIN id_mapping_locations im_loc ON a.location_id = im_loc.old_id
JOIN id_mapping_categories im_cat ON a.category_id = im_cat.old_id
ORDER BY a.created_at;

-- Create ID mapping for assets
INSERT INTO id_mapping_assets (old_id, new_id)
SELECT a_old.id, a_new.id
FROM assets a_old
JOIN assets_new a_new ON a_old.tag = a_new.tag;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_assets' AND status = 'started';

-- Step 7: Migrate Spare Parts (no dependencies)
INSERT INTO migration_log (step_name, status) VALUES ('migrate_spare_parts', 'started');

INSERT INTO spare_parts_new (part_number, name, description, unit_cost, supplier_id, created_at, updated_at)
SELECT part_number, name, description, unit_cost, supplier_id, created_at, updated_at
FROM spare_parts
ORDER BY created_at;

-- Create ID mapping for spare parts
INSERT INTO id_mapping_spare_parts (old_id, new_id)
SELECT sp_old.id, sp_new.id
FROM spare_parts sp_old
JOIN spare_parts_new sp_new ON sp_old.part_number = sp_new.part_number;

UPDATE migration_log SET status = 'completed', completed_at = NOW() 
WHERE step_name = 'migrate_spare_parts' AND status = 'started';

-- Log completion of Phase 2
INSERT INTO migration_log (step_name, status, completed_at) 
VALUES ('phase_2_complete', 'completed', NOW());

COMMIT;

-- Phase 2 Complete
-- Next: Run Phase 3 (migrate remaining dependent tables)