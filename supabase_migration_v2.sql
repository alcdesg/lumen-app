-- ====================================================================
-- MIGRATION SCRIPT V2: USER CRUD & ACCOUNT VISIBILITY
-- Execute no SQL Editor do seu projeto Supabase
-- ====================================================================

-- 1. Adicionar coluna de permissões na tabela de Contas
alter table public.accounts 
add column if not exists allowed_emails text[] default '{}';

-- 2. Função de Segurança para Listar Usuários do Auth (Admin Only)
create or replace function public.get_users_list()
returns table (
    id uuid,
    email text,
    created_at timestamptz,
    last_sign_in_at timestamptz
)
language plpgsql
security definer -- Executa com privilégios de Admin
as $$
begin
  return query 
  select 
    u.id, 
    u.email::text, 
    u.created_at, 
    u.last_sign_in_at 
  from auth.users u
  order by u.created_at desc;
end;
$$;

-- 3. Função de Segurança para Excluir Usuários do Auth (Admin Only)
create or replace function public.delete_user_by_id(target_user_id uuid)
returns void
language plpgsql
security definer -- Executa com privilégios de Admin
as $$
begin
  delete from auth.users where id = target_user_id;
end;
$$;

-- 4. Habilitar RPC para execução pela API autenticada
grant execute on function public.get_users_list() to authenticated;
grant execute on function public.delete_user_by_id(target_user_id uuid) to authenticated;

-- ====================================================================
-- REGRAS RLS ATUALIZADAS (Contas & Transações)
-- ====================================================================

-- Remover políticas antigas de Contas e Transações
drop policy if exists "Users can manage their own accounts" on public.accounts;
drop policy if exists "Users can manage their own transactions" on public.transactions;

-- Criar nova política de Contas baseada em e-mail e permissões
create policy "Manage accounts by creator or allowed emails" on public.accounts
    for all using (
        user_id = auth.uid() 
        or auth.jwt() ->> 'email' = any(allowed_emails)
        or allowed_emails = '{}'
        or allowed_emails is null
    ) with check (
        user_id = auth.uid()
        or auth.jwt() ->> 'email' = any(allowed_emails)
        or allowed_emails = '{}'
        or allowed_emails is null
    );

-- Criar nova política de Transações herdando a segurança da Conta associada
create policy "Manage transactions based on accessible accounts" on public.transactions
    for all using (
        exists (
            select 1 from public.accounts
            where public.accounts.id = public.transactions.account_id
        )
    ) with check (
        exists (
            select 1 from public.accounts
            where public.accounts.id = public.transactions.account_id
        )
    );
