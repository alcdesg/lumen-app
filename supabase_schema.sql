-- ====================================================================
-- LUMEN - PERSONAL FINANCIAL CONTROLLER
-- DATABASE SCHEMA MIGRATION SCRIPT (POSTGRESQL / SUPABASE)
-- ====================================================================

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. Accounts Table
create table if not exists public.accounts (
    id text primary key,
    name text not null,
    initial_balance numeric not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- 2. Categories Table
create table if not exists public.categories (
    id text primary key,
    name text not null,
    type text not null check (type in ('income', 'expense')),
    is_active boolean not null default true,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- 3. Batches Table
create table if not exists public.batches (
    id text primary key,
    description text,
    created_at timestamptz not null default now(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- 4. Transactions Table
create table if not exists public.transactions (
    id text primary key,
    version integer not null default 1,
    account_id text not null,
    category_id text not null,
    description text not null,
    amount numeric not null,
    date text not null, -- Format YYYY-MM-DD
    status text not null check (status in ('planned', 'confirmed')),
    is_active boolean not null default true,
    is_deleted boolean not null default false,
    parent_id text,
    batch_id text,
    member text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- 5. Settings Table
create table if not exists public.settings (
    key text primary key,
    value jsonb not null,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.batches enable row level security;
alter table public.transactions enable row level security;
alter table public.settings enable row level security;

-- Accounts Policies
create policy "Users can manage their own accounts" on public.accounts
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Categories Policies
create policy "Users can manage their own categories" on public.categories
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Batches Policies
create policy "Users can manage their own batches" on public.batches
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Transactions Policies
create policy "Users can manage their own transactions" on public.transactions
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Settings Policies
create policy "Users can manage their own settings" on public.settings
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
