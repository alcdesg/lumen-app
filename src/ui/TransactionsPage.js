class TransactionsPage {
  static render(app, state) {
    // 1. Initialize filters in state if missing
    if (!state.txFilters) {
      state.txFilters = {
        search: '',
        type: 'all',
        account: 'all',
        status: 'all',
        member: 'all'
      };
    }
    const filters = state.txFilters;

    // 2. Fetch and apply filters to active transactions list
    const activeTxs = app.getActiveTransactions();
    const filteredTxs = activeTxs.filter(t => {
      // Search term match
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Type match (positive for income, negative for expense)
      if (filters.type === 'income' && t.amount <= 0) return false;
      if (filters.type === 'expense' && t.amount >= 0) return false;
      
      // Account match
      if (filters.account !== 'all' && t.account_id !== filters.account) return false;
      
      // Status match
      if (filters.status !== 'all' && t.status !== filters.status) return false;

      // Member match
      if (filters.member !== 'all' && t.member !== filters.member) return false;

      return true;
    });

    // Sort chronologically descending (newest first)
    filteredTxs.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));

    // 3. Generate filters HTML options
    let accountOptions = '<option value="all">Todas as Contas</option>';
    app.accounts.filter(a => a.is_active).forEach(acc => {
      accountOptions += `<option value="${acc.id}" ${filters.account === acc.id ? 'selected' : ''}>${acc.name}</option>`;
    });

    // 4. Render Table rows
    let tableRows = '';
    if (filteredTxs.length === 0) {
      tableRows = `
        <tr>
          <td colspan="8" class="empty-state">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <h4>Nenhuma movimentação encontrada</h4>
            <p>Tente ajustar os seus filtros de pesquisa.</p>
          </td>
        </tr>
      `;
    } else {
      filteredTxs.forEach(t => {
        const cat = app.categories.find(c => c.id === t.category_id) || { name: 'Sem Categoria' };
        const acc = app.accounts.find(a => a.id === t.account_id) || { name: 'Sem Conta' };
        const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount));
        const amountClass = t.amount > 0 ? 'amount-in' : 'amount-out';
        const sign = t.amount > 0 ? '+' : '-';
        const formattedDate = t.date.split('-').reverse().join('/');

        // Member styling badge
        let memberBadge = '';
        if (t.member === 'Paula') {
          memberBadge = `<span class="badge" style="background-color:hsla(320, 80%, 60%, 0.15); color:hsl(320, 80%, 75%); border:1px solid hsla(320, 80%, 60%, 0.25);">Paula</span>`;
        } else if (t.member === 'Alcides') {
          memberBadge = `<span class="badge" style="background-color:hsla(200, 85%, 55%, 0.15); color:hsl(200, 85%, 70%); border:1px solid hsla(200, 85%, 55%, 0.25);">Alcides</span>`;
        } else {
          memberBadge = `<span class="badge" style="background-color:var(--bg-base); color:var(--text-secondary); border:1px solid var(--border-color);">Casal</span>`;
        }

        tableRows += `
          <tr data-tx-id="${t.id}">
            <td style="font-weight: 500;">${formattedDate}</td>
            <td style="font-weight: 600;">${t.description}</td>
            <td><span class="account-tag" style="background-color:var(--bg-base); border: 1px solid var(--border-color);">${cat.name}</span></td>
            <td>${acc.name}</td>
            <td>${memberBadge}</td>
            <td><span class="badge badge-${t.status}">${t.status === 'confirmed' ? 'Realizado' : 'Previsto'}</span></td>
            <td class="${amountClass}" style="font-weight: 700; font-family: 'Inter', sans-serif;">
              ${sign}${formattedAmount}
            </td>
            <td class="row-actions">
              <button class="btn-action-icon edit-tx-btn" title="Editar movimentação">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-action-icon btn-delete delete-tx-btn" title="Excluir movimentação">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </td>
          </tr>
        `;
      });
    }

    return `
      <div class="table-card animate-fade-in">
        
        <!-- Filters Row -->
        <div class="table-header-filters">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" id="tx-search-input" placeholder="Buscar por descrição..." value="${filters.search}" autocomplete="off">
          </div>
          
          <div class="filters-row">
            <select id="tx-filter-type" class="filter-select">
              <option value="all" ${filters.type === 'all' ? 'selected' : ''}>Todas Entradas</option>
              <option value="income" ${filters.type === 'income' ? 'selected' : ''}>Receitas</option>
              <option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>Despesas</option>
            </select>
            
            <select id="tx-filter-account" class="filter-select">
              ${accountOptions}
            </select>
            
            <select id="tx-filter-status" class="filter-select">
              <option value="all" ${filters.status === 'all' ? 'selected' : ''}>Todos Status</option>
              <option value="confirmed" ${filters.status === 'confirmed' ? 'selected' : ''}>Realizado</option>
              <option value="planned" ${filters.status === 'planned' ? 'selected' : ''}>Previsto</option>
            </select>

            <select id="tx-filter-member" class="filter-select">
              <option value="all" ${filters.member === 'all' ? 'selected' : ''}>Todos Responsáveis</option>
              <option value="Casal" ${filters.member === 'Casal' ? 'selected' : ''}>Casal (Compartilhado)</option>
              <option value="Paula" ${filters.member === 'Paula' ? 'selected' : ''}>Paula</option>
              <option value="Alcides" ${filters.member === 'Alcides' ? 'selected' : ''}>Alcides</option>
            </select>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 110px;">Data</th>
                <th>Descrição</th>
                <th style="width: 130px;">Categoria</th>
                <th style="width: 130px;">Conta</th>
                <th style="width: 110px;">Responsável</th>
                <th style="width: 100px;">Status</th>
                <th style="width: 120px;">Valor</th>
                <th style="width: 90px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody id="transactions-table-body">
              ${tableRows}
            </tbody>
          </table>
        </div>

      </div>

      <!-- Dedicated Edit Modal Overlay (inside the page context) -->
      <div class="modal-overlay" id="edit-tx-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Editar Movimentação</h3>
            <button class="close-modal-btn" id="close-edit-modal-btn">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/></svg>
            </button>
          </div>
          <form id="edit-tx-form" class="modal-form">
            <input type="hidden" id="edit-tx-id">
            
            <div class="form-row flex-toggle">
              <button type="button" class="toggle-btn" id="edit-toggle-expense" data-type="expense">Despesa</button>
              <button type="button" class="toggle-btn" id="edit-toggle-income" data-type="income">Receita</button>
            </div>
            
            <div class="form-row">
              <label for="edit-tx-amount">Valor (R$)*</label>
              <input type="number" id="edit-tx-amount" step="0.01" required autocomplete="off">
            </div>

            <div class="form-row">
              <label for="edit-tx-description">Descrição*</label>
              <input type="text" id="edit-tx-description" required autocomplete="off">
            </div>

            <div class="form-grid">
              <div class="form-row">
                <label for="edit-tx-date">Data*</label>
                <input type="date" id="edit-tx-date" required>
              </div>
              <div class="form-row">
                <label for="edit-tx-status">Status*</label>
                <select id="edit-tx-status">
                  <option value="confirmed">Confirmado (Realizado)</option>
                  <option value="planned">Planejado (Previsto)</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-row">
                <label for="edit-tx-account">Conta*</label>
                <select id="edit-tx-account" required></select>
              </div>
              <div class="form-row">
                <label for="edit-tx-category">Categoria*</label>
                <select id="edit-tx-category" required></select>
              </div>
            </div>

            <div class="form-row">
              <label for="edit-tx-member">Membro Responsável*</label>
              <select id="edit-tx-member" style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 8px 12px; border-radius: var(--border-radius-md); font-family: inherit; font-size: 13px;">
                <option value="Casal">Casal (Compartilhado)</option>
                <option value="Paula">Paula</option>
                <option value="Alcides">Alcides</option>
              </select>
            </div>

            <div class="form-actions">
              <span class="shortcut-tip">Nota: Cria uma nova versão histórica.</span>
              <button type="button" class="btn btn-secondary" id="cancel-edit-modal-btn">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    const searchInput = document.getElementById("tx-search-input");
    const filterType = document.getElementById("tx-filter-type");
    const filterAccount = document.getElementById("tx-filter-account");
    const filterStatus = document.getElementById("tx-filter-status");
    const filterMember = document.getElementById("tx-filter-member");

    // Bind filters changes
    const updateFilters = () => {
      state.txFilters = {
        search: searchInput.value,
        type: filterType.value,
        account: filterAccount.value,
        status: filterStatus.value,
        member: filterMember.value
      };
      appInstance.renderActivePage(); // Reload table
    };

    if (searchInput) {
      searchInput.addEventListener("input", updateFilters);
      filterType.addEventListener("change", updateFilters);
      filterAccount.addEventListener("change", updateFilters);
      filterStatus.addEventListener("change", updateFilters);
      filterMember.addEventListener("change", updateFilters);
    }

    // Delete transaction action
    const deleteBtns = document.querySelectorAll(".delete-tx-btn");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);
        
        if (confirm(`Deseja realmente excluir "${tx.description}"? \nIsso não apagará o registro físico, apenas criará um histórico de exclusão lógica para auditoria.`)) {
          try {
            app.deleteTransaction(txId);
            await app.save();
            appInstance.renderActivePage(); // Reload view
          } catch (err) {
            alert(err.message);
          }
        }
      });
    });

    // Edit transaction overlay handles
    const editModal = document.getElementById("edit-tx-modal");
    const closeEditBtn = document.getElementById("close-edit-modal-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-modal-btn");
    const editForm = document.getElementById("edit-tx-form");
    
    const editToggleExpense = document.getElementById("edit-toggle-expense");
    const editToggleIncome = document.getElementById("edit-toggle-income");
    
    let currentEditType = 'expense';

    const setEditType = (type) => {
      currentEditType = type;
      if (type === 'expense') {
        editToggleExpense.classList.add("active-expense");
        editToggleIncome.classList.remove("active-income");
      } else {
        editToggleExpense.classList.remove("active-expense");
        editToggleIncome.classList.add("active-income");
      }
      // Reload categories dropdown depending on type (expense / income)
      const catSelect = document.getElementById("edit-tx-category");
      let catOptions = '';
      app.categories
        .filter(c => c.is_active && c.type === type)
        .forEach(c => {
          catOptions += `<option value="${c.id}">${c.name}</option>`;
        });
      catSelect.innerHTML = catOptions;
    };

    editToggleExpense.addEventListener("click", () => setEditType('expense'));
    editToggleIncome.addEventListener("click", () => setEditType('income'));

    const editBtns = document.querySelectorAll(".edit-tx-btn");
    editBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);

        // Populate accounts selector
        const accSelect = document.getElementById("edit-tx-account");
        let accOptions = '';
        app.accounts.filter(a => a.is_active).forEach(a => {
          accOptions += `<option value="${a.id}" ${a.id === tx.account_id ? 'selected' : ''}>${a.name}</option>`;
        });
        accSelect.innerHTML = accOptions;

        // Set type (income or expense) and populate category select
        const isInc = tx.amount > 0;
        setEditType(isInc ? 'income' : 'expense');

        // Set transaction details
        document.getElementById("edit-tx-id").value = tx.id;
        document.getElementById("edit-tx-amount").value = Math.abs(tx.amount);
        document.getElementById("edit-tx-description").value = tx.description;
        document.getElementById("edit-tx-date").value = tx.date;
        document.getElementById("edit-tx-status").value = tx.status;
        
        // Select category
        const catSelect = document.getElementById("edit-tx-category");
        catSelect.value = tx.category_id;

        // Select member
        const memberSelect = document.getElementById("edit-tx-member");
        if (memberSelect) {
          memberSelect.value = tx.member || 'Casal';
        }

        // Open modal
        editModal.classList.add("active");
      });
    });

    const closeEdit = () => editModal.classList.remove("active");
    if (closeEditBtn) {
      closeEditBtn.addEventListener("click", closeEdit);
      cancelEditBtn.addEventListener("click", closeEdit);
    }

    // Submit edit form
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const txId = document.getElementById("edit-tx-id").value;
        const amountInput = Number(document.getElementById("edit-tx-amount").value);
        const description = document.getElementById("edit-tx-description").value;
        const date = document.getElementById("edit-tx-date").value;
        const status = document.getElementById("edit-tx-status").value;
        const account_id = document.getElementById("edit-tx-account").value;
        const category_id = document.getElementById("edit-tx-category").value;
        const member = document.getElementById("edit-tx-member").value;

        // Positive if income, negative if expense
        const amount = currentEditType === 'income' ? amountInput : -amountInput;

        try {
          app.updateTransaction(txId, {
            amount,
            description,
            date,
            status,
            account_id,
            category_id,
            member
          });
          await app.save();
          closeEdit();
          appInstance.renderActivePage(); // Reload table
        } catch (err) {
          alert(err.message);
        }
      });
    }
  }
}
