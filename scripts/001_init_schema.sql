-- Synapse — Initial schema.
-- Run this on Supabase AFTER connecting the integration.
-- Every table is locked down with RLS so rows are only visible to their owner.

-- ---------------------------------------------------------------------------
-- Users / profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  locale     text not null default 'es' check (locale in ('en','es','pt')),
  plan       text not null default 'free' check (plan in ('free','pro')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Decks
-- ---------------------------------------------------------------------------
create table if not exists public.decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  emoji       text default '📚',
  accent      text not null default 'indigo'
              check (accent in ('indigo','emerald','amber','rose','sky')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_decks_user on public.decks(user_id);

-- ---------------------------------------------------------------------------
-- Cards  (SM-2 fields live on the card itself)
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id          uuid primary key default gen_random_uuid(),
  deck_id     uuid not null references public.decks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  question    text not null,
  answer      text not null,
  ease_factor numeric not null default 2.5,
  interval    integer not null default 1,
  repetitions integer not null default 0,
  due_at      timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists idx_cards_deck on public.cards(deck_id);
create index if not exists idx_cards_due  on public.cards(user_id, due_at);

-- ---------------------------------------------------------------------------
-- Review events (append-only — powers the heatmap + retention analytics)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id         bigserial primary key,
  card_id    uuid not null references public.cards(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  quality    integer not null check (quality between 0 and 5), -- 0=Again..5=Easy
  reviewed_at timestamptz not null default now()
);

create index if not exists idx_reviews_user_day
  on public.reviews(user_id, (reviewed_at::date));

-- ---------------------------------------------------------------------------
-- AI generations (drives the token-budget UI)
-- ---------------------------------------------------------------------------
create table if not exists public.generations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  deck_id       uuid references public.decks(id) on delete set null,
  model         text not null,
  source_type   text not null check (source_type in ('text','url','pdf')),
  source_ref    text,            -- URL / file path / text hash
  cards_count   integer not null,
  tokens_input  integer not null,
  tokens_output integer not null,
  tokens_total  integer generated always as (tokens_input + tokens_output) stored,
  cost_usd      numeric(10,6) not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_generations_user_month
  on public.generations(user_id, date_trunc('month', created_at));

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.decks       enable row level security;
alter table public.cards       enable row level security;
alter table public.reviews     enable row level security;
alter table public.generations enable row level security;

-- Profiles: user can see/update their own row
drop policy if exists "profiles self read"  on public.profiles;
drop policy if exists "profiles self write" on public.profiles;
create policy "profiles self read"  on public.profiles for select using (auth.uid() = id);
create policy "profiles self write" on public.profiles for update using (auth.uid() = id);

-- Decks / cards / reviews / generations: strict owner-only access
do $$ declare t text;
begin
  foreach t in array array['decks','cards','reviews','generations'] loop
    execute format('drop policy if exists "%1$s owner select" on public.%1$s', t);
    execute format('drop policy if exists "%1$s owner insert" on public.%1$s', t);
    execute format('drop policy if exists "%1$s owner update" on public.%1$s', t);
    execute format('drop policy if exists "%1$s owner delete" on public.%1$s', t);
    execute format('create policy "%1$s owner select" on public.%1$s for select using (auth.uid() = user_id)', t);
    execute format('create policy "%1$s owner insert" on public.%1$s for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s owner update" on public.%1$s for update using (auth.uid() = user_id)', t);
    execute format('create policy "%1$s owner delete" on public.%1$s for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Helper view: monthly AI usage aggregate (used by the token-budget UI)
-- ---------------------------------------------------------------------------
create or replace view public.v_monthly_usage as
select
  user_id,
  date_trunc('month', created_at)::date as month,
  coalesce(sum(tokens_total), 0)::int   as tokens_total,
  coalesce(sum(cards_count),  0)::int   as cards_total,
  coalesce(sum(cost_usd),     0)        as cost_usd_total
from public.generations
group by user_id, date_trunc('month', created_at);

-- Create profile row automatically when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
