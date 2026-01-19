-- ============================================================================
-- Script to remove users:read permission from AGENT role
-- Run this on existing database to apply the permission change
-- ============================================================================

-- Remove users:read permission from AGENT role
DELETE FROM user_management.role_permissions
WHERE role_id = (SELECT id FROM user_management.roles WHERE name = 'AGENT')
AND permission_id = (SELECT id FROM user_management.permissions WHERE resource = 'users' AND action = 'read');

-- Verify the removal
SELECT
    r.name as role_name,
    p.resource,
    p.action,
    rp.id as role_permission_id
FROM user_management.role_permissions rp
JOIN user_management.roles r ON r.id = rp.role_id
JOIN user_management.permissions p ON p.id = rp.permission_id
WHERE r.name = 'AGENT'
ORDER BY p.resource, p.action;

-- Expected result: AGENT should only have:
-- - leads:read, leads:write
-- - calls:read, calls:write
-- - reports:read_own
--
-- Should NOT have:
-- - users:read (removed by this script)
