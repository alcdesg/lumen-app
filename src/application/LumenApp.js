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
    this.settings = { couple_names: 'Paula & Alcides', admin_master_password: 'admin123', user_roles: {} };
    
    // User session & RBAC
    this.currentUserEmail = null;
    this.userRole = 'viewer';
  }

  /**
   * Initializes the application state by loading data from storage.
   */
  async init() {
    await this.storage.init();
    const data = await this.storage.loadData();
    
    // Guardamos a base de dados consolidada bruta
    this.allAccounts = data.accounts || [];
    this.allTransactions = data.transactions || [];
    this.categories = (data.categories || []).map(c => new Category(c));
    this.batches = data.batches || [];
    this.settings = data.settings || { couple_names: 'Paula & Alcides', admin_master_password: 'admin123', user_roles: {} };

    // Resolve user session role if logged in
    const email = localStorage.getItem("lumen_supabase_email") || this.storage.currentUserEmail;
    if (email) {
      this.currentUserEmail = email;
      this.userRole = this.getUserRole(email);
    } else {
      this.currentUserEmail = null;
      this.userRole = 'viewer';
    }

    // Filtra visibilidade ativa baseada no perfil logado
    this.filterVisibleData();
  }

  /**
   * Filters in-memory active lists accounts/transactions based on current logged user permissions.
   */
  filterVisibleData() {
    const email = this.currentUserEmail ? this.currentUserEmail.toLowerCase().trim() : '';

    // 1. Filtrar Contas acessíveis
    const visibleAccounts = this.allAccounts.filter(a => {
      if (!a.is_active) return false;
      // Admin master tem acesso irrestrito
      if (this.isAdmin()) return true;
      // Contas sem allowed_emails são conjuntas
      if (!a.allowed_emails || a.allowed_emails.length === 0) return true;
      
      const normalizedAllowed = a.allowed_emails.map(e => e.toLowerCase().trim());
      // 1. Match exato de e-mail
      if (normalizedAllowed.includes(email)) return true;

      // 2. Fallback: extrair nome amigável do e-mail ativo (ex: paula de paula@lumen.com.br)
      const friendlyName = email.split('@')[0];
      if (normalizedAllowed.includes(friendlyName)) return true;

      return false;
    });

    this.accounts = visibleAccounts.map(a => new Account(a));

    // 2. Filtrar Transações associadas às contas acessíveis
    const visibleAccountIds = new Set(this.accounts.map(a => a.id));
    const visibleTxs = this.allTransactions.filter(t => {
      return visibleAccountIds.has(t.account_id);
    });

    this.transactions = visibleTxs.map(t => new Transaction(t));
  }

  /**
   * Determines user role based on email and settings mapping.
   */
  getUserRole(email) {
    if (!email) return 'viewer';
    const emailLower = email.toLowerCase().trim();
    
    // 1. Master admin check
    const masterAdmins = ['neto_gurgel@hotmail.com', 'alcides@lumen.com.br'];
    if (masterAdmins.includes(emailLower)) {
      return 'admin';
    }

    // 2. Settings mapping check
    const rolesMap = this.settings.user_roles || {};
    if (rolesMap[emailLower]) {
      return rolesMap[emailLower];
    }

    // 3. Defaults check (Paula is Editor by default)
    if (emailLower.includes('paula') || emailLower === 'paula@example.com') {
      return 'editor';
    }

    // 4. Default fallback
    return 'viewer';
  }

  /**
   * Checks if user has write permissions
   */
  canEdit() {
    return this.userRole === 'admin' || this.userRole === 'editor';
  }

  /**
   * Checks if user has admin privileges
   */
  isAdmin() {
    return this.userRole === 'admin';
  }

  /**
   * Intercepts critical actions with a UAC password prompt if not admin.
   */
  requestAdminAuthorization(actionName, onSuccess) {
    // 1. Check if the active user is an admin profile
    if (!this.isAdmin()) {
      alert(`Acesso negado: A ação "${actionName}" requer permissões de Administrador.`);
      return;
    }

    // 2. Administrators must still elevate by entering the admin master password (UAC)
    const uacModal = document.getElementById("uac-modal");
    const uacActionName = document.getElementById("uac-action-name");
    const uacForm = document.getElementById("uac-form");
    const uacPasswordInput = document.getElementById("uac-password");
    const uacCancelBtn = document.getElementById("uac-cancel-btn");

    if (!uacModal) {
      // Fallback popup if DOM elements aren't present
      const pass = prompt(`Confirmação de segurança UAC: Digite a senha mestra de administração para autorizar a ação "${actionName}":`);
      const expected = this.settings.admin_master_password || "admin123";
      if (pass === expected) {
        onSuccess();
      } else if (pass !== null) {
        alert("Acesso negado: Senha mestra incorreta.");
      }
      return;
    }

    uacActionName.textContent = actionName;
    uacPasswordInput.value = "";
    uacModal.classList.add("active");
    uacPasswordInput.focus();

    const cleanup = () => {
      uacModal.classList.remove("active");
      uacForm.onsubmit = null;
      uacCancelBtn.onclick = null;
    };

    uacForm.onsubmit = (e) => {
      e.preventDefault();
      const typedPassword = uacPasswordInput.value;
      const expected = this.settings.admin_master_password || "admin123";

      if (typedPassword === expected) {
        cleanup();
        onSuccess();
      } else {
        alert("Senha incorreta. Acesso negado pelo UAC.");
        uacPasswordInput.value = "";
        uacPasswordInput.focus();
      }
    };

    uacCancelBtn.onclick = () => {
      cleanup();
    };
  }

  /**
   * Saves the current memory state back to persistent storage, safely merging with unviewed private data.
   */
  async save() {
    // 1. Mesclar alterações das contas ativas de volta na base consolidada bruta (allAccounts)
    const activeAccMap = new Map(this.accounts.map(a => [a.id, a]));
    const mergedAccounts = this.allAccounts.map(rawA => {
      if (activeAccMap.has(rawA.id)) {
        const accObj = activeAccMap.get(rawA.id);
        return {
          ...rawA,
          name: accObj.name,
          initial_balance: accObj.initial_balance,
          is_active: accObj.is_active,
          allowed_emails: accObj.allowed_emails,
          updated_at: new Date().toISOString()
        };
      }
      return rawA;
    });

    const existingRawAccIds = new Set(this.allAccounts.map(a => a.id));
    this.accounts.forEach(acc => {
      if (!existingRawAccIds.has(acc.id)) {
        mergedAccounts.push({
          id: acc.id,
          name: acc.name,
          initial_balance: acc.initial_balance,
          is_active: acc.is_active,
          allowed_emails: acc.allowed_emails,
          created_at: acc.created_at,
          updated_at: acc.updated_at,
          created_by_user: acc.created_by_user
        });
      }
    });

    // 2. Mesclar alterações das transações ativas de volta na base consolidada bruta (allTransactions)
    const activeTxMap = new Map(this.transactions.map(t => [`${t.id}-${t.version}`, t]));
    const mergedTransactions = this.allTransactions.map(rawT => {
      const key = `${rawT.id}-${rawT.version}`;
      if (activeTxMap.has(key)) {
        const txObj = activeTxMap.get(key);
        return {
          ...rawT,
          account_id: txObj.account_id,
          category_id: txObj.category_id,
          description: txObj.description,
          amount: txObj.amount,
          date: txObj.date,
          status: txObj.status,
          is_active: txObj.is_active,
          is_deleted: txObj.is_deleted,
          parent_id: txObj.parent_id,
          import_batch_id: txObj.import_batch_id,
          replaced_by_version: txObj.replaced_by_version,
          member: txObj.member,
          updated_at: new Date().toISOString()
        };
      }
      return rawT;
    });

    const existingRawTxKeys = new Set(this.allTransactions.map(t => `${t.id}-${t.version}`));
    this.transactions.forEach(t => {
      const key = `${t.id}-${t.version}`;
      if (!existingRawTxKeys.has(key)) {
        mergedTransactions.push({
          id: t.id,
          version: t.version,
          account_id: t.account_id,
          category_id: t.category_id,
          description: t.description,
          amount: t.amount,
          date: t.date,
          status: t.status,
          is_active: t.is_active,
          is_deleted: t.is_deleted,
          parent_id: t.parent_id,
          import_batch_id: t.import_batch_id,
          replaced_by_version: t.replaced_by_version,
          member: t.member,
          created_at: t.created_at,
          updated_at: t.updated_at,
          created_by_user: t.created_by_user
        });
      }
    });

    this.allAccounts = mergedAccounts;
    this.allTransactions = mergedTransactions;

    // Gravar base consolidada no Supabase/OneDrive/LocalStorage
    await this.storage.saveData({
      accounts: this.allAccounts,
      categories: this.categories,
      transactions: this.allTransactions,
      batches: this.batches,
      settings: this.settings
    });

    // Re-filtrar views locais
    this.filterVisibleData();
  }

  /**
   * Updates the couple names in settings
   */
  async updateCoupleNames(names) {
    this.settings.couple_names = names ? names.trim() : "Paula & Alcides";
    await this.save();
  }

  // --- Account Management ---

  addAccount({ name, initial_balance, allowed_emails = [] }) {
    const existing = this.accounts.find(a => a.name.toLowerCase() === name.toLowerCase() && a.is_active);
    if (existing) {
      throw new Error(`Uma conta ativa com o nome "${name}" já existe.`);
    }

    const account = new Account({ name, initial_balance, created_by_user: this.currentUserEmail, allowed_emails });
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

    const category = new Category({ name, type, created_by_user: this.currentUserEmail });
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
  addTransaction({ account_id, category_id, description, amount, date, status, member }) {
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
      is_active: true,
      member: member || 'Casal',
      created_by_user: this.currentUserEmail
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
    const newVersionTx = activeTx.createNewVersion({ ...updatedFields, created_by_user: this.currentUserEmail });
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
    const deletedTx = activeTx.createNewVersion({ is_deleted: true, created_by_user: this.currentUserEmail });
    deletedTx.is_active = false; // Ensure it doesn't calculate towards balances
    
    this.transactions.push(deletedTx);
  }

  /**
   * Restores a soft-deleted transaction from the trash bin.
   */
  restoreTransaction(id) {
    const deletedTx = this.transactions.find(t => t.id === id && t.is_deleted);
    if (!deletedTx) {
      throw new Error(`Transação ${id} não encontrada na lixeira.`);
    }

    // Set replacement on deleted version
    deletedTx.replaced_by_version = deletedTx.version + 1;
    deletedTx.updated_at = new Date().toISOString();

    // Create restored version (active, is_deleted = false)
    const restoredTx = deletedTx.createNewVersion({ is_deleted: false, created_by_user: this.currentUserEmail });
    restoredTx.is_active = true;
    restoredTx.updated_at = new Date().toISOString();

    this.transactions.push(restoredTx);
    return restoredTx;
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

  /**
   * Gets all planned transactions that are overdue (date <= today).
   */
  getPendingPlannedTransactions(today) {
    return this.getActiveTransactions().filter(t => t.status === 'planned' && t.date <= today);
  }

  /**
   * Finds a likely matching planned transaction for a given CSV row.
   * Matching criteria: same account, same category, date within +/- 5 days, amount within 20% tolerance, same status 'planned'.
   */
  findMatchingPlannedTransaction(row, alreadyMatchedPlannedIds = []) {
    const acc = this.allAccounts.find(a => a.name.toLowerCase() === row.accountName.toLowerCase() && a.is_active);
    if (!acc) return null;

    const cat = this.categories.find(c => c.name.toLowerCase() === row.categoryName.toLowerCase() && c.is_active);
    if (!cat) return null;

    const rowAmount = Number(row.amount);
    const rowDateStr = row.date;
    const rowMonth = rowDateStr.substring(0, 7); // 'YYYY-MM'
    const rowDate = new Date(rowDateStr + 'T00:00:00');

    return this.getActiveTransactions().find(t => {
      if (t.status !== 'planned') return false;
      if (t.account_id !== acc.id) return false;
      if (t.category_id !== cat.id) return false;

      // Guardrail 2: Batch deduplication - do not match already matched plans
      if (alreadyMatchedPlannedIds.includes(t.id)) return false;

      // Guardrail 1: Strict month/year matching (same calendar month)
      const tMonth = t.date.substring(0, 7);
      if (rowMonth !== tMonth) return false;

      // Check date tolerance: +/- 5 days
      const tDate = new Date(t.date + 'T00:00:00');
      const diffTime = Math.abs(rowDate - tDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 5) return false;

      // Check amount: same sign
      const tAmount = Number(t.amount || 0);
      if (Math.sign(tAmount) !== Math.sign(rowAmount)) return false;

      // Check amount tolerance: 20%
      const tolerance = Math.abs(rowAmount) * 0.20;
      const isWithinTolerance = Math.abs(tAmount - rowAmount) <= tolerance;
      if (isWithinTolerance) return true;

      // Guardrail 3: Description similarity (Fuzzy match) if amount tolerance exceeded
      const cleanWords = (str) => {
        return (str || "")
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(/\s+/)
          .filter(word => word.length > 3);
      };
      
      const rowWords = cleanWords(row.description);
      const tWords = cleanWords(t.description);
      const sharesSignificantWord = rowWords.some(w => tWords.includes(w));

      return sharesSignificantWord;
    });
  }

  findMatchingDuplicateTransaction(row, todayStr, alreadyMatchedDuplicateIds = []) {
    const acc = this.allAccounts.find(a => a.name.toLowerCase() === row.accountName.toLowerCase() && a.is_active);
    if (!acc) return null;

    const cat = this.categories.find(c => c.name.toLowerCase() === row.categoryName.toLowerCase() && c.is_active);
    if (!cat) return null;

    const rowAmount = Number(row.amount);
    const rowDateStr = row.date;
    const rowMonth = rowDateStr.substring(0, 7);
    const rowDate = new Date(rowDateStr + 'T00:00:00');
    const rowStatus = row.date <= todayStr ? 'confirmed' : 'planned';

    return this.getActiveTransactions().find(t => {
      if (t.status !== rowStatus) return false;
      if (t.account_id !== acc.id) return false;
      if (t.category_id !== cat.id) return false;
      if (alreadyMatchedDuplicateIds.includes(t.id)) return false;

      // Strict month/year matching
      const tMonth = t.date.substring(0, 7);
      if (rowMonth !== tMonth) return false;

      // Check date tolerance: +/- 3 days
      const tDate = new Date(t.date + 'T00:00:00');
      const diffTime = Math.abs(rowDate - tDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 3) return false;

      // Check amount: same exact value (sign included)
      const tAmount = Number(t.amount || 0);
      if (tAmount !== rowAmount) return false;

      // Check description similarity (exact match or one contains the other)
      const cleanDesc = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, " ");
      const rowDesc = cleanDesc(row.description);
      const tDesc = cleanDesc(t.description);
      
      if (rowDesc === tDesc || rowDesc.includes(tDesc) || tDesc.includes(rowDesc)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Reconciles a planned transaction by updating it to confirmed and setting final values.
   */
  reconcileTransaction(id, { amount, date, description, status, import_batch_id }) {
    const activeTx = this.getActiveTransaction(id);
    if (!activeTx) {
      throw new Error("Transação planejada ativa não encontrada para conciliação.");
    }
    if (activeTx.status !== 'planned') {
      throw new Error("Apenas transações com status 'Planejado' podem ser reconciliadas.");
    }

    const updatedFields = {
      status: status || 'confirmed',
      amount: amount !== undefined ? amount : activeTx.amount,
      date: date !== undefined ? date : activeTx.date,
      description: description !== undefined ? description : activeTx.description,
      import_batch_id: import_batch_id !== undefined ? import_batch_id : activeTx.import_batch_id,
      created_by_user: this.currentUserEmail
    };

    // Create a new version
    const newVersionTx = activeTx.createNewVersion(updatedFields);
    newVersionTx.validate();

    // Inactivate old version
    activeTx.is_active = false;
    activeTx.replaced_by_version = newVersionTx.version;
    activeTx.updated_at = new Date().toISOString();
    activeTx.created_by_user = this.currentUserEmail;

    this.transactions.push(newVersionTx);
    return newVersionTx;
  }

  // --- CSV Batch Import and Rollback ---

  /**
   * Imports a CSV batch, automatically mapping, reconciling, and creating accounts/categories.
   */
  async importTransactions(csvText, filename, todayStr, reconciliations = {}, ignoredRowNums = []) {
    const parsed = CsvParser.parse(csvText);
    if (parsed.errors.length > 0) {
      return { success: false, errors: parsed.errors };
    }

    // Guardrail: Evitar importação duplicada do mesmo arquivo ativo
    const duplicateBatch = this.batches.find(b => b.filename.toLowerCase() === filename.toLowerCase() && b.status === 'active');
    if (duplicateBatch) {
      return { success: false, errors: [`O arquivo "${filename}" já foi importado anteriormente e está ativo. Para importá-lo novamente, reverta o lote anterior na aba de auditoria.`] };
    }

    const importedTxs = parsed.transactions;
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const txIdsInBatch = [];

    // Helper to find or create Account on the fly
    const getOrCreateAccount = (name) => {
      let acc = this.allAccounts.find(a => a.name.toLowerCase() === name.toLowerCase() && a.is_active);
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
      // Skip if explicitly ignored by user (e.g. duplicate check failed and user chose to skip)
      if (ignoredRowNums.includes(row.row)) {
        return;
      }

      const status = row.date <= todayStr ? 'confirmed' : 'planned';
      const reconciledTxId = reconciliations[row.row];

      if (reconciledTxId) {
        // Reconcile pre-existing planned transaction instead of duplicating
        const reconciled = this.reconcileTransaction(reconciledTxId, {
          amount: row.amount,
          date: row.date,
          description: row.description,
          status,
          import_batch_id: batchId
        });
        txIdsInBatch.push(reconciled.id);
      } else {
        // Create new transaction
        const account_id = getOrCreateAccount(row.accountName);
        const category_id = getOrCreateCategory(row.categoryName, row.amount);

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
          member: row.member || 'Casal',
          created_by_user: this.currentUserEmail
        });

        tx.validate();
        this.transactions.push(tx);
        txIdsInBatch.push(tx.id);
      }
    });

    // Create the batch record
    const batch = {
      id: batchId,
      filename,
      imported_at: new Date().toISOString(),
      status: 'active',
      transaction_ids: txIdsInBatch,
      created_by_user: this.currentUserEmail
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
   * Rolls back a CSV batch import, soft-deleting new transactions and restoring reconciled ones.
   */
  async rollbackImportBatch(batchId) {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) throw new Error("Lote de importação não encontrado.");
    if (batch.status === 'rolled_back') throw new Error("Este lote de importação já foi revertido.");

    // 1. Se estiver usando o Supabase Cloud, processa a reversão atômica via RPC no banco
    if (this.storage.isUsingSupabase && this.storage.supabase) {
      await this.storage.rollbackImportBatch(batchId, this.currentUserEmail);
      // O Realtime atualizará o estado local automaticamente após a execução da RPC.
      return;
    }

    // 2. Fallback local para modo offline (OneDrive / LocalStorage)
    batch.transaction_ids.forEach(txId => {
      // Obtém a versão ativa na base consolidada bruta (allTransactions)
      const activeTx = this.allTransactions.find(t => t.id === txId && t.is_active);
      if (activeTx) {
        const prevVersion = this.allTransactions.find(t => t.id === txId && t.version === activeTx.version - 1);
        
        if (prevVersion && prevVersion.import_batch_id !== batchId) {
          // Reativa a versão planejada anterior
          activeTx.is_active = false;
          activeTx.replaced_by_version = null;
          activeTx.updated_at = new Date().toISOString();
          activeTx.created_by_user = this.currentUserEmail;

          prevVersion.is_active = true;
          prevVersion.replaced_by_version = null;
          prevVersion.updated_at = new Date().toISOString();
          prevVersion.created_by_user = this.currentUserEmail;
        } else {
          // Soft-delete criando uma nova versão com is_deleted = true
          activeTx.is_active = false;
          activeTx.replaced_by_version = activeTx.version + 1;
          activeTx.updated_at = new Date().toISOString();
          activeTx.created_by_user = this.currentUserEmail;

          // Cria a versão deletada
          const activeTxObj = new Transaction(activeTx);
          const rollbackTx = activeTxObj.createNewVersion({ is_deleted: true, created_by_user: this.currentUserEmail });
          rollbackTx.is_active = false; // Inativa
          
          this.allTransactions.push({
            id: rollbackTx.id,
            version: rollbackTx.version,
            account_id: rollbackTx.account_id,
            category_id: rollbackTx.category_id,
            description: rollbackTx.description,
            amount: rollbackTx.amount,
            date: rollbackTx.date,
            status: rollbackTx.status,
            is_active: rollbackTx.is_active,
            is_deleted: rollbackTx.is_deleted,
            parent_id: rollbackTx.parent_id,
            import_batch_id: rollbackTx.import_batch_id,
            replaced_by_version: rollbackTx.replaced_by_version,
            member: rollbackTx.member,
            created_at: rollbackTx.created_at,
            updated_at: rollbackTx.updated_at,
            created_by_user: rollbackTx.created_by_user
          });
        }
      }
    });

    batch.status = 'rolled_back';
    batch.created_by_user = this.currentUserEmail;
    await this.save();
  }
}
