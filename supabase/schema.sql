-- Panga App — Supabase / Postgres schema
-- Run this in the Supabase SQL editor (or via migrations).
-- Designed to mirror the local Dexie schema for offline-first + cloud sync.

-- Enable UUID + crypto
create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Core workspace tables (user-scoped)
create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  status text not null default 'active' check (status in ('active', 'archived')),
  kind text default 'project' check (kind in ('project', 'activity', 'idea')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id text,
  parent_id text,
  title text not null,
  notes text default '',
  status text not null default 'active' check (status in ('active', 'inactive', 'completed')),
  completed boolean default false,
  due_date timestamptz,
  order_index integer default 0,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  category text not null default 'notes',
  title text not null default '',
  content jsonb default '{}'::jsonb,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'in_progress' check (status in ('in_progress', 'achieved', 'missed')),
  target_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issues (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('email', 'phone', 'link')),
  value text not null,
  tags text[] default '{}',
  linked_project_ids text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tone_id text,
  linked_entity_type text check (linked_entity_type in ('task', 'note')),
  linked_entity_id text,
  message text not null,
  trigger_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'fired', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  start_at timestamptz not null,
  end_at timestamptz,
  source text default 'local' check (source in ('local', 'google')),
  google_event_id text,
  project_id text references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insights (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doc_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  title text not null,
  body text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete set null,
  title text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id text not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Task lists (top-level containers)
create table if not exists public.task_lists (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  order_index integer default 0,
  folder_id text references public.task_list_folders(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Task list folders (nestable)
create table if not exists public.task_list_folders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_folder_id text references public.task_list_folders(id),
  title text not null,
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link folders
create table if not exists public.link_folders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_folder_id text references public.link_folders(id),
  title text not null,
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Links (dedicated bookmarks)
create table if not exists public.links (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id text,
  title text not null,
  url text not null,
  notes text,
  tags text[] default '{}',
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notes (dedicated notes table)
create table if not exists public.notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text default '',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Note folders (nestable)
create table if not exists public.note_folders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_folder_id text references public.note_folders(id),
  title text not null,
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reminder folders (nestable)
create table if not exists public.reminder_folders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_folder_id text references public.reminder_folders(id),
  title text not null,
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reminders
create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id text references public.reminder_folders(id),
  tone_id text,
  linked_entity_type text check (linked_entity_type in ('task', 'note')),
  linked_entity_id text,
  message text not null,
  trigger_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'fired', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_projects_user on public.projects(user_id);
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_resources_user on public.resources(user_id);
create index if not exists idx_resources_project on public.resources(project_id);
create index if not exists idx_task_lists_user on public.task_lists(user_id);
create index if not exists idx_tasks_list on public.tasks(list_id);
create index if not exists idx_tasks_parent on public.tasks(parent_id);
create index if not exists idx_link_folders_user on public.link_folders(user_id);
create index if not exists idx_links_folder on public.links(folder_id);
create index if not exists idx_notes_user on public.notes(user_id);
create index if not exists idx_task_list_folders_user on public.task_list_folders(user_id);
create index if not exists idx_task_list_folders_parent on public.task_list_folders(parent_folder_id);
create index if not exists idx_task_lists_folder on public.task_lists(folder_id);
create index if not exists idx_note_folders_user on public.note_folders(user_id);
create index if not exists idx_note_folders_parent on public.note_folders(parent_folder_id);
create index if not exists idx_reminder_folders_user on public.reminder_folders(user_id);
create index if not exists idx_reminder_folders_parent on public.reminder_folders(parent_folder_id);
create index if not exists idx_reminders_folder on public.reminders(folder_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;
alter table public.milestones enable row level security;
alter table public.issues enable row level security;
alter table public.contacts enable row level security;
alter table public.reminders enable row level security;
alter table public.calendar_events enable row level security;
alter table public.insights enable row level security;
alter table public.doc_entries enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;
alter table public.task_lists enable row level security;
alter table public.link_folders enable row level security;
alter table public.task_list_folders enable row level security;
alter table public.note_folders enable row level security;
alter table public.reminder_folders enable row level security;
alter table public.links enable row level security;
alter table public.notes enable row level security;

-- Policies: user can only see/edit own rows
create policy "Users own their data" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.resources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.milestones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.issues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.doc_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.task_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.link_folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.task_list_folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.note_folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.reminder_folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their data" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
