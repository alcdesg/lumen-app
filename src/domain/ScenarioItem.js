/**
 * ScenarioItem.js
 * 
 * Domain entity representing an isolated item inside a simulation Scenario.
 */
class ScenarioItem {
  constructor({
    id,
    scenario_id,
    type = 'expense', // 'expense' | 'income'
    amount,
    description,
    date, // 'YYYY-MM-DD' - MANDATORY
    category_id = null,
    account_id = null,
    member = 'Casal',
    status = 'draft', // 'draft' | 'materialized'
    materialized_transaction_id = null,
    valor_orcado = null,
    data_orcada = null,
    created_at,
    updated_at,
    created_by_user = null,
    user_id = null
  }) {
    this.id = id || `scen-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.scenario_id = scenario_id;
    this.type = type === 'income' ? 'income' : 'expense';
    this.amount = Math.abs(Number(amount) || 0);
    this.description = description ? description.trim() : '';
    this.date = date || '';
    this.category_id = category_id || null;
    this.account_id = account_id || null;
    this.member = member || 'Casal';
    this.status = status === 'materialized' ? 'materialized' : 'draft';
    this.materialized_transaction_id = materialized_transaction_id || null;
    this.valor_orcado = valor_orcado !== null && valor_orcado !== undefined ? Number(valor_orcado) : null;
    this.data_orcada = data_orcada || null;
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
    this.created_by_user = created_by_user || null;
    this.user_id = user_id || null;
  }

  validate() {
    if (!this.scenario_id) {
      throw new Error('O item precisa estar associado a um cenário.');
    }
    if (!this.description) {
      throw new Error('A descrição do item é obrigatória.');
    }
    if (isNaN(this.amount) || this.amount <= 0) {
      throw new Error('O valor do item deve ser maior que zero.');
    }
    if (!this.date || !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
      throw new Error('A data do item é obrigatória e deve estar no formato AAAA-MM-DD.');
    }
    if (this.type !== 'expense' && this.type !== 'income') {
      throw new Error('O tipo deve ser "expense" (despesa) ou "income" (receita).');
    }
    return true;
  }

  isMaterialized() {
    return this.status === 'materialized';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioItem;
}
