/**
 * Category.js
 * 
 * Category domain entity.
 */
class Category {
  constructor({ id, name, type, is_active = true, created_by_user = null }) {
    this.id = id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name ? name.trim() : '';
    this.type = type; // 'income' | 'expense'
    this.is_active = is_active !== false;
    this.created_by_user = created_by_user || null;
  }

  validate() {
    if (!this.name) {
      throw new Error('O nome da categoria é obrigatório.');
    }
    if (this.type !== 'income' && this.type !== 'expense') {
      throw new Error('O tipo da categoria deve ser "income" (receita) ou "expense" (despesa).');
    }
    return true;
  }
}
