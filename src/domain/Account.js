/**
 * Account.js
 * 
 * Account domain entity.
 */
class Account {
  constructor({ id, name, initial_balance = 0, is_active = true, created_at, updated_at, created_by_user = null, allowed_emails = [] }) {
    this.id = id || `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name ? name.trim() : '';
    this.initial_balance = Number(initial_balance) || 0;
    this.is_active = is_active !== false;
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
    this.created_by_user = created_by_user || null;
    this.allowed_emails = allowed_emails || [];
  }

  validate() {
    if (!this.name) {
      throw new Error('O nome da conta é obrigatório.');
    }
    if (isNaN(this.initial_balance)) {
      throw new Error('O saldo inicial deve ser um valor numérico válido.');
    }
    return true;
  }
}
