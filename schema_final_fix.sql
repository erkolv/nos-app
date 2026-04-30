-- Todas as tabelas que podem estar faltando
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  text text not null,
  from_name text default '',
  to_name text default '',
  created_at timestamptz default now()
);
create table if not exists fixed_bills (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name text not null, amount numeric default 0,
  due_day int default 1, paid boolean default false,
  category text default 'Casa', created_at timestamptz default now()
);
create table if not exists utility_readings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  type text not null, value numeric default 0,
  amount numeric default 0, month text default '',
  created_at timestamptz default now()
);
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name text not null, category text default 'Casamento',
  planned numeric default 0, actual numeric default 0,
  status text default 'Não iniciado', responsible text default 'Ambos',
  notes text default '', created_at timestamptz default now()
);
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name text not null, category text default 'Outros',
  status text default 'Pesquisando', price numeric default 0,
  contact text default '', website text default '',
  notes text default '', created_at timestamptz default now()
);
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name text not null, "group" text default '',
  guests_count int default 1, status text default 'Aguardando',
  created_at timestamptz default now()
);
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  destination text not null, start_date text default '',
  end_date text default '', budget numeric default 0,
  status text default 'Planejando', notes text default '',
  created_at timestamptz default now()
);
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  title text not null, subtitle text default '',
  streak int default 0, responsible text default 'Ambos',
  created_at timestamptz default now()
);
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  week date not null, answers jsonb default '{}',
  created_at timestamptz default now()
);
create table if not exists pet_expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  description text not null, amount numeric default 0,
  pet_id uuid, created_at timestamptz default now()
);
create table if not exists rac_data (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  brand text default '', opened_at date,
  days_estimate int default 25, pet_id uuid,
  created_at timestamptz default now()
);

-- Colunas extras
alter table profiles add column if not exists avatar_url text default '';
alter table pets add column if not exists photo_url text default '';

-- Desabilitar RLS em tudo
alter table messages disable row level security;
alter table fixed_bills disable row level security;
alter table utility_readings disable row level security;
alter table budgets disable row level security;
alter table vendors disable row level security;
alter table guests disable row level security;
alter table trips disable row level security;
alter table habits disable row level security;
alter table checkins disable row level security;
alter table pet_expenses disable row level security;
alter table rac_data disable row level security;

-- Replica identity
alter table messages replica identity full;
alter table fixed_bills replica identity full;
alter table utility_readings replica identity full;
alter table budgets replica identity full;
alter table vendors replica identity full;
alter table guests replica identity full;
alter table trips replica identity full;
alter table habits replica identity full;
alter table checkins replica identity full;
alter table pet_expenses replica identity full;
alter table rac_data replica identity full;

-- Realtime (ignora erro se já adicionado)
do $$ begin
  alter publication supabase_realtime add table messages;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table fixed_bills;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table utility_readings;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table budgets;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table vendors;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table guests;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table trips;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table habits;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table checkins;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table pet_expenses;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table rac_data;
exception when others then null; end $$;
