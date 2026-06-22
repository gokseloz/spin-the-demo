-- Spin the Demo — Supabase schema
-- Run this in your Supabase project's SQL editor.

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🎯',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists spins (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete set null,
  participant_name text not null,
  spun_at timestamptz not null default now()
);

create index if not exists spins_spun_at_idx on spins (spun_at desc);

-- Row Level Security: only authenticated users (the shared account) may read or write.
alter table participants enable row level security;
alter table spins enable row level security;

drop policy if exists "auth read participants" on participants;
drop policy if exists "auth write participants" on participants;
drop policy if exists "auth read spins" on spins;
drop policy if exists "auth write spins" on spins;

create policy "auth read participants"
  on participants for select
  to authenticated using (true);

create policy "auth write participants"
  on participants for all
  to authenticated using (true) with check (true);

create policy "auth read spins"
  on spins for select
  to authenticated using (true);

create policy "auth write spins"
  on spins for all
  to authenticated using (true) with check (true);

-- Enable realtime on both tables (Supabase dashboard → Database → Replication → also via SQL):
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table spins;

-- Seed defaults (optional — comment out if you'd rather add via the UI).
insert into participants (name, emoji) values
  ('Göksel',   '🎯'),
  ('Fedi',     '🚀'),
  ('Ali',      '⭐'),
  ('Dhruv',    '🔥'),
  ('Martim',   '🌊'),
  ('Pujitha',  '🌸'),
  ('Sajahan',  '🎨'),
  ('Abhishek', '⚡')
on conflict do nothing;
