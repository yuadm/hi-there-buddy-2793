-- Add languages column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN employees.languages IS 'Array of languages the employee speaks';