-- ============================================================
-- NÓS APP — Supabase Schema completo
-- Cole no SQL Editor e clique em Run
-- ============================================================

-- COUPLES
create table if not exists couples (
  id           uuid primary key default gen_random_uuid(),
  invite_code  text unique not null,
  wedding_date date,
  created_at   timestamptz default now()
);

-- PROFILES
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null,
  couple_id  uuid references couples(id),
  created_at timestamptz default now()
);

-- APPOINTMENTS (compromissos)
create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references couples(id) on delete cascade,
  title        text not null,
  scheduled_at date,
  time         text,
  who          text default 'Ambos',
  category     text default 'Outros',
  notes        text default '',
  created_at   timestamptz default now()
);

-- TASKS (tarefas)
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references couples(id) on delete cascade,
  title       text not null,
  responsible text default 'Ambos',
  recurrent   boolean default false,
  done        boolean default false,
  created_at  timestamptz default now()
);

-- CHECKLIST_ITEMS (casamento)
create table if not exists checklist_items (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  title     text not null,
  "group"   text default '3 meses antes',
  done      boolean default false,
  created_at timestamptz default now()
);

-- MARKET_ITEMS
create table if not exists market_items (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  title     text not null,
  category  text default 'Outros',
  done      boolean default false,
  created_at timestamptz default now()
);

-- EXPENSES (gastos)
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references couples(id) on delete cascade,
  description text not null,
  amount      numeric not null default 0,
  who         text default 'Erick',
  category    text default 'Outros',
  date        date default current_date,
  created_at  timestamptz default now()
);

-- DREAMS (objetivos grandes)
create table if not exists dreams (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples(id) on delete cascade,
  title           text not null,
  type            text default 'Meta',
  term            text default 'Médio',
  priority        text default 'Média',
  description     text default '',
  why             text default '',
  estimated_value numeric default 0,
  progress        int default 0,
  target_date     date,
  created_at      timestamptz default now()
);

-- MEMORIES
create table if not exists memories (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  title     text not null,
  date      date,
  text      text default '',
  emoji     text default '💍',
  created_at timestamptz default now()
);

-- CAMERAS
create table if not exists cameras (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  name       text not null,
  location   text default '',
  stream_url text default '',
  status     text default 'Online',
  notes      text default '',
  created_at timestamptz default now()
);

-- PETS
create table if not exists pets (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  name       text not null,
  species    text default 'Cachorro',
  breed      text default '',
  birthdate  date,
  created_at timestamptz default now()
);

-- PET_VACCINES
create table if not exists pet_vaccines (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  pet_id     uuid references pets(id) on delete cascade,
  name       text not null,
  applied_at date,
  next_at    date,
  vet        text default '',
  cost       numeric default 0,
  created_at timestamptz default now()
);

-- DOCUMENTS
create table if not exists documents (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name      text not null,
  category  text default 'Pessoal',
  url       text default '',
  notes     text default '',
  created_at timestamptz default now()
);

-- NOTES
create table if not exists notes (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  title     text not null,
  content   text default '',
  pinned    boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles        enable row level security;
alter table couples         enable row level security;
alter table appointments    enable row level security;
alter table tasks           enable row level security;
alter table checklist_items enable row level security;
alter table market_items    enable row level security;
alter table expenses        enable row level security;
alter table dreams          enable row level security;
alter table memories        enable row level security;
alter table cameras         enable row level security;
alter table pets            enable row level security;
alter table pet_vaccines    enable row level security;
alter table documents       enable row level security;
alter table notes           enable row level security;

-- Helper: retorna couple_id do usuário logado
create or replace function my_couple_id()
returns uuid language sql stable as $$
  select couple_id from profiles where id = auth.uid()
$$;

-- Couples policies
create policy "couples_select" on couples for select using (id = my_couple_id());
create policy "couples_insert" on couples for insert with check (true);
create policy "couples_update" on couples for update using (id = my_couple_id());

-- Profiles policies
create policy "profiles_select" on profiles for select using (couple_id = my_couple_id() or id = auth.uid());
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- Todas as outras tabelas: acesso total ao próprio casal
do $$ declare t text; begin
  foreach t in array array[
    'appointments','tasks','checklist_items','market_items',
    'expenses','dreams','memories','cameras','pets',
    'pet_vaccines','documents','notes'
  ] loop
    execute format(
      'create policy "%s_couple" on %s for all using (couple_id = my_couple_id()) with check (couple_id = my_couple_id())',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table market_items;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table dreams;
alter publication supabase_realtime add table memories;
alter publication supabase_realtime add table cameras;
alter publication supabase_realtime add table pets;
alter publication supabase_realtime add table pet_vaccines;
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table profiles;
