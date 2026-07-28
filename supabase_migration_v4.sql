-- ====================================================================
-- MIGRATION SCRIPT V4: ATOMIC IMPORT ROLLBACK FUNCTION (RPC)
-- Execute no SQL Editor do seu projeto Supabase
-- ====================================================================

-- Função RPC para Reverter um Lote de Importação de forma Atômica e Consistente
create or replace function public.rollback_import_batch(target_batch_id text, active_user_email text)
returns void
language plpgsql
security definer -- Executa com privilégios de Admin para ignorar restrições RLS e garantir consistência do lote
as $$
declare
  tx_record record;
  active_tx_id text;
  active_version int;
  prev_version int;
begin
  -- 1. Marcar o lote como revertido na tabela batches
  update public.batches
  set status = 'rolled_back',
      created_by_user = active_user_email
  where id = target_batch_id;

  -- 2. Loop sobre as transações pertencentes a este lote
  for tx_record in 
    select distinct id from public.transactions 
    where import_batch_id = target_batch_id
  loop
    active_tx_id := tx_record.id;
    
    -- Obter a versão ativa (máxima) dessa transação
    select max(version) into active_version 
    from public.transactions 
    where id = active_tx_id;
    
    -- Verificar se existe uma versão anterior que não pertença a este lote
    select version into prev_version
    from public.transactions
    where id = active_tx_id 
      and version = active_version - 1
      and (import_batch_id is null or import_batch_id <> target_batch_id)
    limit 1;
    
    if prev_version is not null then
      -- Caso a transação tenha sido apenas Reconciliada (tinha versão anterior planejada):
      -- Desativamos a versão atual e reativamos a versão planejada anterior
      update public.transactions
      set is_active = false,
          replaced_by_version = null,
          updated_at = now(),
          created_by_user = active_user_email
      where id = active_tx_id and version = active_version;
      
      update public.transactions
      set is_active = true,
          replaced_by_version = null,
          updated_at = now(),
          created_by_user = active_user_email
      where id = active_tx_id and version = prev_version;
    else
      -- Caso a transação tenha sido Criada Nova na importação:
      -- Desativamos a versão atual e criamos uma nova versão como excluída (soft-delete)
      update public.transactions
      set is_active = false,
          replaced_by_version = active_version + 1,
          updated_at = now(),
          created_by_user = active_user_email
      where id = active_tx_id and version = active_version;
      
      insert into public.transactions (
        id, version, account_id, category_id, description, amount, date, status,
        is_active, is_deleted, parent_id, import_batch_id, replaced_by_version, member, created_by_user, updated_at
      )
      select 
        id, version + 1, account_id, category_id, description, amount, date, status,
        false, true, parent_id, import_batch_id, null, member, active_user_email, now()
      from public.transactions
      where id = active_tx_id and version = active_version;
    end if;
  end loop;
end;
$$;

-- Permitir execução da função por qualquer usuário logado/autenticado
grant execute on function public.rollback_import_batch(text, text) to authenticated;
