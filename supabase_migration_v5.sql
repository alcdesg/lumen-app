-- ====================================================================
-- LUMEN - FEATURE CENÁRIOS (MIGRATION SCRIPT V5)
-- Execute no SQL Editor do seu projeto Supabase
-- ====================================================================

-- 1. Tabelas de Cenários (Projetos Hipotéticos)
create table if not exists public.scenarios (
    id text primary key,
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    archived_at timestamptz,
    created_by_user text,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- 2. Itens do Cenário
create table if not exists public.scenario_items (
    id text primary key,
    scenario_id text not null references public.scenarios(id) on delete cascade,
    type text not null check (type in ('expense', 'income')),
    amount numeric not null check (amount > 0),
    description text not null,
    date text not null, -- Formato YYYY-MM-DD (obrigatória)
    category_id text,
    account_id text,
    member text,
    status text not null default 'draft' check (status in ('draft', 'materialized')),
    materialized_transaction_id text,
    valor_orcado numeric,
    data_orcada text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by_user text,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- Índices de performance
create index if not exists idx_scenario_items_scenario_id on public.scenario_items(scenario_id);
create index if not exists idx_scenario_items_status on public.scenario_items(status);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.scenarios enable row level security;
alter table public.scenario_items enable row level security;

create policy "Users can manage their own scenarios" on public.scenarios
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage their own scenario_items" on public.scenario_items
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
