-- Drop is_active column and its index since we're using status instead
DROP INDEX IF EXISTS users_is_active_idx;
ALTER TABLE public.users DROP COLUMN IF EXISTS is_active;
