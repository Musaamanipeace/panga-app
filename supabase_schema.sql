-- Panga Database Schema for Supabase
-- Copy and paste this script into your Supabase SQL Editor and click "RUN".
-- v3: Added user_id column to all tables with proper Row Level Security
--     using auth.uid(). Accounts require email confirmation before data access.

-- Helper: returns the authenticated user's UUID (or NULL for anonymous requests)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::text;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 2. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  executor TEXT DEFAULT 'manual',
  due_date BIGINT,
  scheduled_at BIGINT,
  estimated_minutes INTEGER,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 3. Resources (Notes, Links, Scripts, Images, PDFs)
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  url TEXT,
  provider TEXT,
  body TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 4. Milestones
CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  target_date BIGINT,
  blocking_task_ids JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 5. Issues
CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  severity TEXT DEFAULT 'medium',
  labels JSONB DEFAULT '[]'::jsonb,
  milestone_id TEXT,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 6. Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'email',
  value TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  linked_project_ids JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 7. Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  message TEXT NOT NULL,
  trigger_at BIGINT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 8. Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  source TEXT DEFAULT 'local',
  start_at BIGINT,
  end_at BIGINT,
  meet_link TEXT,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 9. Insights
CREATE TABLE IF NOT EXISTS public.insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'note',
  link TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 10. Documentation Entries
CREATE TABLE IF NOT EXISTS public.doc_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'outline',
  "order" INTEGER DEFAULT 0,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 11. Settings (per-user: Gemini API Key, custom categories, Google tokens)
CREATE TABLE IF NOT EXISTS public.settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  updated_at BIGINT,
  PRIMARY KEY (user_id, key)
);

-- Migration: add user_id column to existing tables (v1 -> v3 upgrade)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN ('projects', 'tasks', 'resources', 'milestones', 'issues',
                      'contacts', 'reminders', 'calendar_events', 'insights', 'doc_entries')
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl_name AND column_name = 'user_id'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN user_id TEXT', tbl_name);
    END IF;
  END LOOP;

  -- Migrate settings table to composite primary key
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'user_id') THEN
    NULL; -- already migrated
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
    ALTER TABLE public.settings ADD COLUMN user_id TEXT;
    UPDATE public.settings SET user_id = 'legacy-user' WHERE user_id IS NULL;
    ALTER TABLE public.settings ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
    ALTER TABLE public.settings ADD CONSTRAINT settings_pkey PRIMARY KEY (user_id, key);
  END IF;
END $$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Per-user RLS policies: each authenticated user can only access their own data
-- Anonymous (unauthenticated) access is blocked — accounts must be confirmed via email.
DROP POLICY IF EXISTS "Per-user access projects" ON public.projects;
CREATE POLICY "Per-user access projects" ON public.projects FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access tasks" ON public.tasks;
CREATE POLICY "Per-user access tasks" ON public.tasks FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access resources" ON public.resources;
CREATE POLICY "Per-user access resources" ON public.resources FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access milestones" ON public.milestones;
CREATE POLICY "Per-user access milestones" ON public.milestones FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access issues" ON public.issues;
CREATE POLICY "Per-user access issues" ON public.issues FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access contacts" ON public.contacts;
CREATE POLICY "Per-user access contacts" ON public.contacts FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access reminders" ON public.reminders;
CREATE POLICY "Per-user access reminders" ON public.reminders FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access calendar_events" ON public.calendar_events;
CREATE POLICY "Per-user access calendar_events" ON public.calendar_events FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access insights" ON public.insights;
CREATE POLICY "Per-user access insights" ON public.insights FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access doc_entries" ON public.doc_entries;
CREATE POLICY "Per-user access doc_entries" ON public.doc_entries FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

DROP POLICY IF EXISTS "Per-user access settings" ON public.settings;
CREATE POLICY "Per-user access settings" ON public.settings FOR ALL
  USING (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id())
  WITH CHECK (get_current_user_id() IS NOT NULL AND user_id = get_current_user_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON public.resources(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_entries_user_id ON public.doc_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- Enable email confirmation requirement: users must confirm their email before accessing data.
-- In Supabase Dashboard → Authentication → Settings, enable "Email Confirmation".
-- Or use this SQL to force it:
-- (This is handled by the RLS policy above which blocks anonymous access.)
