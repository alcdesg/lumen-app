/**
 * Transaction.js
 * 
 * Versioned transaction domain entity.
 */
class Transaction {
  constructor({
    id,
    version = 1,
    account_id,
    category_id,
    description,
    amount,
    date,
    status = 'planned', // 'planned' | 'confirmed'
    is_active = true,
    created_at,
    updated_at,
    replaced_by_version = null,
    import_batch_id = null,
    is_deleted = false,
    member = 'Casal'
  }) {
    this.id = id || `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.version = Number(version) || 1;
    this.account_id = account_id;
    this.category_id = category_id;
    this.description = description ? description.trim() : '';
    this.amount = Number(amount);
    this.date = date; // 'YYYY-MM-DD'
    this.status = status; // 'planned' | 'confirmed'
    this.is_active = is_active !== false;
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
    this.replaced_by_version = replaced_by_version;
    this.import_batch_id = import_batch_id;
    this.is_deleted = is_deleted === true;
    this.member = member || 'Casal';
  }

  validate() {
    if (!this.account_id) {
      throw new Error('A conta é obrigatória.');
    }
    if (!this.category_id) {
      throw new Error('A categoria é obrigatória.');
    }
    if (!this.description) {
      throw new Error('A descrição é obrigatória.');
    }
    if (isNaN(this.amount) || this.amount === 0) {
      throw new Error('O valor deve ser um número válido e diferente de zero.');
    }
    if (!this.date || !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
      throw new Error('A data deve estar no formato AAAA-MM-DD.');
    }
    if (this.status !== 'planned' && this.status !== 'confirmed') {
      throw new Error('O status deve ser "planned" (planejado) ou "confirmed" (confirmado).');
    }
    if (this.member !== 'Paula' && this.member !== 'Alcides' && this.member !== 'Casal') {
      throw new Error('O responsável deve ser "Paula", "Alcides" ou "Casal".');
    }
    return true;
  }

  /**
   * Creates a new version instance of this transaction with updated fields.
   */
  createNewVersion(updatedFields) {
    return new Transaction({
      id: this.id,
      version: this.version + 1,
      account_id: updatedFields.account_id !== undefined ? updatedFields.account_id : this.account_id,
      category_id: updatedFields.category_id !== undefined ? updatedFields.category_id : this.category_id,
      description: updatedFields.description !== undefined ? updatedFields.description : this.description,
      amount: updatedFields.amount !== undefined ? Number(updatedFields.amount) : this.amount,
      date: updatedFields.date !== undefined ? updatedFields.date : this.date,
      status: updatedFields.status !== undefined ? updatedFields.status : this.status,
      is_active: true,
      created_at: this.created_at, // Preserve original creation timestamp
      updated_at: new Date().toISOString(),
      replaced_by_version: null,
      import_batch_id: this.import_batch_id,
      is_deleted: updatedFields.is_deleted !== undefined ? updatedFields.is_deleted : false,
      member: updatedFields.member !== undefined ? updatedFields.member : this.member
    });
  }
}
