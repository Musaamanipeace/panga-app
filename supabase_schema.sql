-- Panga Database Schema for Supabase
-- Copy and paste this script into your Supabase SQL Editor and click "RUN".

-- 1. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
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
  project_id TEXT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'outline',
  "order" INTEGER DEFAULT 0,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

-- 11. Settings (including Gemini API Key, custom categories, Google tokens)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at BIGINT
);

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

-- Allow public access via anon key (personal single-user app)
DROP POLICY IF EXISTS "Public access projects" ON public.projects;
CREATE POLICY "Public access projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access tasks" ON public.tasks;
CREATE POLICY "Public access tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access resources" ON public.resources;
CREATE POLICY "Public access resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access milestones" ON public.milestones;
CREATE POLICY "Public access milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access issues" ON public.issues;
CREATE POLICY "Public access issues" ON public.issues FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access contacts" ON public.contacts;
CREATE POLICY "Public access contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access reminders" ON public.reminders;
CREATE POLICY "Public access reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access calendar_events" ON public.calendar_events;
CREATE POLICY "Public access calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access insights" ON public.insights;
CREATE POLICY "Public access insights" ON public.insights FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access doc_entries" ON public.doc_entries;
CREATE POLICY "Public access doc_entries" ON public.doc_entries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access settings" ON public.settings;
CREATE POLICY "Public access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
