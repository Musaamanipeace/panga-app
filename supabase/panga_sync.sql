-- Panga sync: one generic table for tasks, thoughts and notes.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Also: Authentication -> Providers -> Email -> turn OFF "Confirm email"
-- (usernames are turned into addresses like name@panga.invalid, so no email is ever sent).

create table if not exists public.panga_records (
  user_id    uuid    not null default auth.uid() references auth.users(id) on delete cascade,
  kind       text    not null check (kind in ('task', 'thought', 'note')),
  id         text    not null,
  data       jsonb,
  updated_at bigint  not null,
  deleted    boolean not null default false,
  primary key (user_id, kind, id)
);

create index if not exists panga_records_user_updated on public.panga_records (user_id, updated_at);

alter table public.panga_records enable row level security;

drop policy if exists "own rows" on public.panga_records;
create policy "own rows" on public.panga_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
