-- ====================================================================
-- MIGRATION SCRIPT V3: REALTIME REPLICATION & UNIFIED POLICIES
-- Execute no SQL Editor do seu projeto Supabase
-- ====================================================================

-- 1. Unificar RLS de Categorias (Couple Shared)
drop policy if exists "Users can manage their own categories" on public.categories;
drop policy if exists "Manage categories by authenticated users" on public.categories;
create policy "Manage categories by authenticated users" on public.categories
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 2. Unificar RLS de Batches/Importações (Couple Shared)
drop policy if exists "Users can manage their own batches" on public.batches;
drop policy if exists "Manage batches by authenticated users" on public.batches;
create policy "Manage batches by authenticated users" on public.batches
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 3. Unificar RLS de Settings/Configurações (Couple Shared)
drop policy if exists "Users can manage their own settings" on public.settings;
drop policy if exists "Manage settings by authenticated users" on public.settings;
create policy "Manage settings by authenticated users" on public.settings
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 4. Habilitar Replicação Real-Time para as 5 tabelas do Lumen
-- Recriamos a publicação padrão para habilitar o Realtime sem gerar erros de tabelas duplicadas ou inexistentes
drop publication if exists supabase_realtime;
create publication supabase_realtime for table 
    public.accounts, 
    public.transactions, 
    public.categories, 
    public.batches, 
    public.settings;
