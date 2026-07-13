class LumenApp {
  /**
   * @param {Storage} storage Storage manager instance
   */
  constructor(storage) {
    this.storage = storage;
    
    // In-memory data states
    this.accounts = [];
    this.categories = [];
    this.transactions = [];
    this.batches = [];
    this.settings = { couple_names: 'Paula & Alcides' };
  }

  /**
   * Initializes the application state by loading data from storage.
   */
  async init() {
    await this.storage.init();
    const data = await this.storage.loadData();
    
    // Instantiate entities
    this.accounts = data.accounts.map(a => new Account(a));
    this.categories = data.categories.map(c => new Category(c));
    this.transactions = data.transactions.map(t => new Transaction(t));
    this.batches = data.batches || [];
    this.settings = data.settings || { couple_names: 'Paula & Alcides' };
  }

  /**
   * Saves the current memory state back to persistent storage.
   */
  async save() {
    await this.storage.saveData({
      accounts: this.accounts,
      categories: this.categories,
      transactions: this.transactions,
      batches: this.batches,
      settings: this.settings
    });
  }

  /**
   * Updates the couple names in settings
   */
  async updateCoupleNames(names) {
    this.settings.couple_names = names ? names.trim() : "Paula & Alcides";
    await this.save();
  }

  // --- Account Management ---

  addAccount({ name, initial_balance }) {
    const existing = this.accounts.find(a => a.name.toLowerCase() === name.toLowerCase() && a.is_active);
    if (existing) {
      throw new Error(`Uma conta ativa com o nome "${name}" já existe.`);
    }

    const account = new Account({ name, initial_balance });
    account.validate();
    this.accounts.push(account);
    return account;
  }

  deleteAccount(id) {
    const account = this.accounts.find(a => a.id === id);
    if (!account) throw new Error("Conta não encontrada.");
    
    // Check if there are active transactions associated
    const activeTxs = this.getActiveTransactions().filter(t => t.account_id === id);
    if (activeTxs.length > 0) {
      throw new Error("Não é possível excluir uma conta que possui transações ativas associadas.");
    }

    account.is_active = false;
    account.updated_at = new Date().toISOString();
  }

  // --- Category Management ---

  addCategory({ name, type }) {
    const existing = this.categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.is_active);
    if (existing) {
      throw new Error(`Uma categoria ativa com o nome "${name}" já existe.`);
    }

    const category = new Category({ name, type });
    category.validate();
    this.categories.push(category);
    return category;
  }

  deleteCategory(id) {
    const category = this.categories.find(c => c.id === id);
    if (!category) throw new Error("Categoria não encontrada.");

    // Check if there are active transactions associated
    const activeTxs = this.getActiveTransactions().filter(t => t.category_id === id);
    if (activeTxs.length > 0) {
      throw new Error("Não é possível excluir uma categoria que possui transações ativas associadas.");
    }

    category.is_active = false;
  }

  // --- Transaction Operations (Versioned) ---

  /**
   * Adds a new transaction (Version 1).
   */
  addTransaction({ account_id, category_id, description, amount, date, status }) {
    // Validate that account and category exist and are active
    const acc = this.accounts.find(a => a.id === account_id && a.is_active);
    if (!acc) throw new Error("A conta selecionada é inválida ou inativa.");

    const cat = this.categories.find(c => c.id === category_id && c.is_active);
    if (!cat) throw new Error("A categoria selecionada é inválida ou inativa.");

    const tx = new Transaction({
      account_id,
      category_id,
      description,
      amount,
      date,
      status,
      version: 1,
      is_active: true
    });

    tx.validate();
    this.transactions.push(tx);
    return tx;
  }

  /**
   * Updates an existing transaction by creating a new version.
   */
  updateTransaction(id, updatedFields) {
    const activeTx = this.getActiveTransaction(id);
    if (!activeTx) {
      throw new Error("Transação ativa não encontrada para edição.");
    }

    // Validate foreign keys if they are changing
    if (updatedFields.account_id !== undefined) {
      const acc = this.accounts.find(a => a.id === updatedFields.account_id && a.is_active);
      if (!acc) throw new Error("A nova conta selecionada é inválida.");
    }
    if (updatedFields.category_id !== undefined) {
      const cat = this.categories.find(c => c.id === updatedFields.category_id && c.is_active);
      if (!cat) throw new Error("A nova categoria selecionada é inválida.");
    }

    // Create a new version
    const newVersionTx = activeTx.createNewVersion(updatedFields);
    newVersionTx.validate();

    // Inactivate the old version and link it
    activeTx.is_active = false;
    activeTx.replaced_by_version = newVersionTx.version;
    activeTx.updated_at = new Date().toISOString();

    this.transactions.push(newVersionTx);
    return newVersionTx;
  }

  /**
   * Soft-deletes a transaction, creating a deleted version while deactivating the old one.
   */
  deleteTransaction(id) {
    const activeTx = this.getActiveTransaction(id);
    if (!activeTx) {
      throw new Error("Transação ativa não encontrada para exclusão.");
    }

    // Inactivate old version
    activeTx.is_active = false;
    activeTx.replaced_by_version = activeTx.version + 1;
    activeTx.updated_at = new Date().toISOString();

    // Create deleted version (inactive by default, is_deleted = true)
    const deletedTx = activeTx.createNewVersion({ is_deleted: true });
    deletedTx.is_active = false; // Ensure it doesn't calculate towards balances
    
    this.transactions.push(deletedTx);
  }

  /**
   * Gets all current active (non-deleted, latest version) transactions.
   */
  getActiveTransactions() {
    return this.transactions.filter(t => t.is_active && !t.is_deleted);
  }

  /**
   * Gets the active version of a specific logical transaction.
   */
  getActiveTransaction(id) {
    return this.transactions.find(t => t.id === id && t.is_active);
  }

  /**
   * Gets the full history tree of a specific transaction ID.
   */
  getTransactionHistory(id) {
    return this.transactions
      .filter(t => t.id === id)
      .sort((a, b) => a.version - b.version);
  }

  // --- CSV Batch Import and Rollback ---

  /**
   * Imports a CSV batch, automatically mapping and creating accounts/categories.
   */
  async importTransactions(csvText, filename, todayStr) {
    const parsed = CsvParser.parse(csvText);
    if (parsed.errors.length > 0) {
      return { success: false, errors: parsed.errors };
    }

    const importedTxs = parsed.transactions;
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const txIdsInBatch = [];

    // Helper to find or create Account on the fly
    const getOrCreateAccount = (name) => {
      let acc = this.accounts.find(a => a.name.toLowerCase() === name.toLowerCase() && a.is_active);
      if (!acc) {
        acc = this.addAccount({ name, initial_balance: 0 });
      }
      return acc.id;
    };

    // Helper to find or create Category on the fly
    const getOrCreateCategory = (name, amount) => {
      let cat = this.categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.is_active);
      if (!cat) {
        const type = amount > 0 ? 'income' : 'expense';
        cat = this.addCategory({ name, type });
      }
      return cat.id;
    };

    // Add each imported transaction
    importedTxs.forEach(row => {
      const account_id = getOrCreateAccount(row.accountName);
      const category_id = getOrCreateCategory(row.categoryName, row.amount);
      
      // Auto-status: confirmed if in the past or today, planned if future
      const status = row.date <= todayStr ? 'confirmed' : 'planned';

      const tx = new Transaction({
        account_id,
        category_id,
        description: row.description,
        amount: row.amount,
        date: row.date,
        status,
        version: 1,
        is_active: true,
        import_batch_id: batchId,
        member: row.member || 'Casal'
      });

      tx.validate();
      this.transactions.push(tx);
      txIdsInBatch.push(tx.id);
    });

    // Create the batch record
    const batch = {
      id: batchId,
      filename,
      imported_at: new Date().toISOString(),
      status: 'active',
      transaction_ids: txIdsInBatch
    };

    this.batches.push(batch);
    await this.save();

    return {
      success: true,
      batchId,
      count: importedTxs.length
    };
  }

  /**
   * Rolls back a CSV batch import, soft-deleting all imported transactions.
   */
  async rollbackImportBatch(batchId) {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) throw new Error("Lote de importação não encontrado.");
    if (batch.status === 'rolled_back') throw new Error("Este lote de importação já foi revertido.");

    // Soft-delete each transaction in the batch
    batch.transaction_ids.forEach(txId => {
      const activeTx = this.getActiveTransaction(txId);
      if (activeTx) {
        // Deactivate active transaction
        activeTx.is_active = false;
        activeTx.replaced_by_version = activeTx.version + 1;
        activeTx.updated_at = new Date().toISOString();

        // Create rollback version
        const rollbackTx = activeTx.createNewVersion({ is_deleted: true });
        rollbackTx.is_active = false; // Inactive
        this.transactions.push(rollbackTx);
      }
    });

    batch.status = 'rolled_back';
    await this.save();
  }
}
