-- WISO Tools now use admin-mediated local execution; remote tool_jobs are obsolete.
-- The table is dropped only after removing all application references to it.
DROP TABLE IF EXISTS public.tool_jobs;
