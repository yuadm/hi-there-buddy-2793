-- Enable replica identity for complete row data on employees table
ALTER TABLE employees REPLICA IDENTITY FULL;

-- Add employees table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE employees;