-- Tabelas extras que faltavam

create table if not exists budgets (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references couples(id) on delete cascade,
  name        text not null,
  category    text default 'Casamento',
  planned     numeric default 0,
  actual      numeric default 0,
  status      text default 'Não iniciado',
  responsible text default 'Ambos',
  notes       text default '',
  created_at  timestamptz default now()
);

create table if not exists vendors (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name      text not null,
  category  text default 'Outros',
  status    text default 'Pesquisando',
  price     numeric default 0,
  contact   text default '',
  website   text default '',
  notes     text default '',
  created_at timestamptz default now()
);

create table if not exists guests (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references couples(id) on delete cascade,
  name         text not null,
  "group"      text default '',
  guests_count int default 1,
  status       text default 'Aguardando',
  created_at   timestamptz default now()
);

create table if not exists trips (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references couples(id) on delete cascade,
  destination  text not null,
  start_date   text default '',
  end_date     text default '',
  budget       numeric default 0,
  status       text default 'Planejando',
  notes        text default '',
  created_at   timestamptz default now()
);

create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references couples(id) on delete cascade,
  title       text not null,
  subtitle    text default '',
  streak      int default 0,
  responsible text default 'Ambos',
  created_at  timestamptz default now()
);

create table if not exists checkins (
  id        uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  week      date not null,
  answers   jsonb default '{}',
  created_at timestamptz default now()
);

-- Desabilitar RLS em todas as novas
alter table budgets  disable row level security;
alter table vendors  disable row level security;
alter table guests   disable row level security;
alter table trips    disable row level security;
alter table habits   disable row level security;
alter table checkins disable row level security;

-- Replica identity para realtime
alter table budgets  replica identity full;
alter table vendors  replica identity full;
alter table guests   replica identity full;
alter table trips    replica identity full;
alter table habits   replica identity full;
alter table checkins replica identity full;

-- Realtime
alter publication supabase_realtime add table budgets;
alter publication supabase_realtime add table vendors;
alter publication supabase_realtime add table guests;
alter publication supabase_realtime add table trips;
alter publication supabase_realtime add table habits;
alter publication supabase_realtime add table checkins;
