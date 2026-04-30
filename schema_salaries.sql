-- Salários do casal (uma linha por pessoa, upsert pelo couple_id + person_name)
create table if not exists salaries (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  name       text not null,
  amount     numeric default 0,
  updated_at timestamptz default now()
);
alter table salaries disable row level security;
alter table salaries replica identity full;
do $$ begin
  alter publication supabase_realtime add table salaries;
exception when others then null; end $$;
