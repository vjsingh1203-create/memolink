
create table if not exists users_ml (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text,
  depot text,
  team text,
  phone text,
  status text default 'active',
  created_at timestamp with time zone default now()
);

create table if not exists memos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due date not null,
  file_key text not null,
  file_url text not null,
  version text not null default '1.0',
  created_at timestamp with time zone default now()
);

create table if not exists assignment_targets (
  id uuid primary key default gen_random_uuid(),
  memo_id uuid references memos(id) on delete cascade,
  user_id uuid references users_ml(id) on delete cascade,
  status text default 'assigned',
  assigned_at timestamp with time zone default now()
);

create table if not exists assignment_links (
  id uuid primary key default gen_random_uuid(),
  memo_id uuid references memos(id) on delete cascade,
  assignment_target_id uuid references assignment_targets(id) on delete cascade,
  token text unique not null,
  created_at timestamp with time zone default now()
);

create table if not exists acknowledgements (
  id uuid primary key default gen_random_uuid(),
  assignment_target_id uuid references assignment_targets(id) on delete cascade,
  signed_name text not null,
  ack_at timestamp with time zone default now(),
  ip_addr text,
  user_agent text
);

create or replace function report_acknowledgements(p_memo_id uuid)
returns table (
  memo_id uuid,
  title text,
  version text,
  due date,
  user_email text,
  user_name text,
  role text,
  depot text,
  status text,
  acknowledged_at timestamp with time zone
) language sql stable as $$
  select m.id as memo_id, m.title, m.version, m.due,
         u.email as user_email, u.name as user_name, u.role, u.depot,
         at.status,
         a.ack_at as acknowledged_at
  from assignment_targets at
  join memos m on m.id = at.memo_id
  join users_ml u on u.id = at.user_id
  left join acknowledgements a on a.assignment_target_id = at.id
  where at.memo_id = p_memo_id
  order by u.depot, u.role, u.name;
$$;

alter table users_ml enable row level security;
alter table memos enable row level security;
alter table assignment_targets enable row level security;
alter table assignment_links enable row level security;
alter table acknowledgements enable row level security;

create policy "service can do anything" on users_ml
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service can do anything" on memos
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service can do anything" on assignment_targets
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service can do anything" on assignment_links
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service can do anything" on acknowledgements
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
