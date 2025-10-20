-- Phase 1: Fix data inconsistencies and clean up
-- First, update any employees where branch_id doesn't match the branch name
UPDATE employees e
SET branch_id = b.id
FROM branches b
WHERE e.branch = b.name
  AND (e.branch_id IS NULL OR e.branch_id != b.id);

-- Phase 2: Drop all related triggers first
DROP TRIGGER IF EXISTS sync_employee_branch ON employees;
DROP TRIGGER IF EXISTS trg_sync_employee_branch_id ON employees;
DROP TRIGGER IF EXISTS sync_employee_branch_id_trigger ON employees;
DROP TRIGGER IF EXISTS sync_employee_branch_trigger ON employees;

-- Drop the function using CASCADE to clean up any remaining dependencies
DROP FUNCTION IF EXISTS sync_employee_branch_id() CASCADE;

-- Phase 3: Remove the redundant branch text column
ALTER TABLE employees DROP COLUMN IF EXISTS branch;