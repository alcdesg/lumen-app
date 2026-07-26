class TransactionsPage {
  static render(app, state) {
    // 1. Initialize filters and sorting in state if missing
    if (!state.txFilters) {
      state.txFilters = {
        search: '',
        type: 'all',
        account: 'all',
        status: 'all',
        member: 'all',
        showTrash: false,
        startDate: '',
        endDate: ''
      };
    }
    if (!state.txSort) {
      state.txSort = {
        column: 'date',
        direction: 'desc'
      };
    }
    
    const filters = state.txFilters;
    const sort = state.txSort;

    // 2. Fetch and apply filters to active or deleted transactions list
    const baseTxs = filters.showTrash
      ? app.transactions.filter(t => t.is_deleted && !t.replaced_by_version)
      : app.getActiveTransactions();

    const filteredTxs = baseTxs.filter(t => {
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

      // Date range match
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;

      return true;
    });

    // 3. Apply sorting logic
    filteredTxs.sort((a, b) => {
      let fieldA, fieldB;
      
      switch (sort.column) {
        case 'date':
          fieldA = a.date || '';
          fieldB = b.date || '';
          break;
        case 'description':
          fieldA = (a.description || '').toLowerCase();
          fieldB = (b.description || '').toLowerCase();
          break;
        case 'category':
          const catA = app.categories.find(c => c.id === a.category_id) || { name: '' };
          const catB = app.categories.find(c => c.id === b.category_id) || { name: '' };
          fieldA = catA.name.toLowerCase();
          fieldB = catB.name.toLowerCase();
          break;
        case 'account':
          const accA = app.accounts.find(ac => ac.id === a.account_id) || { name: '' };
          const accB = app.accounts.find(ac => ac.id === b.account_id) || { name: '' };
          fieldA = accA.name.toLowerCase();
          fieldB = accB.name.toLowerCase();
          break;
        case 'member':
          fieldA = (a.member || 'Casal').toLowerCase();
          fieldB = (b.member || 'Casal').toLowerCase();
          break;
        case 'status':
          fieldA = (a.status || '').toLowerCase();
          fieldB = (b.status || '').toLowerCase();
          break;
        case 'amount':
          fieldA = Math.abs(a.amount || 0);
          fieldB = Math.abs(b.amount || 0);
          break;
        default:
          fieldA = a.date || '';
          fieldB = b.date || '';
      }
      
      if (fieldA < fieldB) return sort.direction === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    // Save filtered list to state for the CSV exporter
    state.lastFilteredTxs = filteredTxs;

    // 4. Generate filters HTML options
    let accountOptions = '<option value="all">Todas as Contas</option>';
    app.accounts.filter(a => a.is_active).forEach(acc => {
      accountOptions += `<option value="${acc.id}" ${filters.account === acc.id ? 'selected' : ''}>${acc.name}</option>`;
    });

    // 5. Render Table rows
    let tableRows = '';
    if (filteredTxs.length === 0) {
      tableRows = `
        <tr>
          <td colspan="8" class="empty-state">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <h4>Nenhuma movimentação encontrada</h4>
            <p>${filters.showTrash ? 'A lixeira está vazia.' : 'Tente ajustar os seus filtros de pesquisa.'}</p>
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

        let actionButtons = '';
        if (app.userRole !== 'viewer') {
          if (filters.showTrash) {
            actionButtons = `
              <button class="btn-action-icon restore-tx-btn" title="Restaurar para a lista ativa" style="color: var(--color-income); cursor: pointer;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
              </button>
            `;
          } else {
            actionButtons = `
              <button class="btn-action-icon edit-tx-btn" title="Editar movimentação">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-action-icon btn-delete delete-tx-btn" title="Excluir movimentação">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            `;
          }
        }

        tableRows += `
          <tr data-tx-id="${t.id}" style="${filters.showTrash ? 'opacity: 0.85; background: rgba(var(--color-expense-rgb), 0.02);' : ''}">
            <td style="font-weight: 500;">${formattedDate}</td>
            <td style="font-weight: 600;">${t.description}</td>
            <td><span class="account-tag" style="background-color:var(--bg-base); border: 1px solid var(--border-color);">${cat.name}</span></td>
            <td>${acc.name}</td>
            <td>${memberBadge}</td>
            <td><span class="badge badge-${t.status}">${t.status === 'confirmed' ? 'Realizado' : 'Previsto'}</span></td>
            <td class="${amountClass}" style="font-weight: 700; font-family: 'Inter', sans-serif;">
              ${sign}${formattedAmount}
            </td>
            <td class="row-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
              ${actionButtons}
            </td>
          </tr>
        `;
      });
    }

    // Helper to generate sorted column headers
    const renderHeader = (colKey, label) => {
      const isSorted = sort.column === colKey;
      const arrow = isSorted ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : '';
      const style = `cursor: pointer; user-select: none; transition: color 0.2s;`;
      const activeClass = isSorted ? 'style="color: var(--accent-secondary); font-weight: 700;"' : '';
      return `<th class="sortable-header" data-col="${colKey}" style="${style}" ${activeClass}>${label}${arrow}</th>`;
    };

    return `
      <div class="table-card animate-fade-in" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Top Toolbar with Actions and Filters -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 4px 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-secondary" id="tx-export-csv-btn" style="padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;" title="Exportar tabela atual para planilha (Excel)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>
              Exportar CSV
            </button>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(var(--color-expense-rgb), 0.05); border: 1px dashed var(--border-color); border-radius: 6px;">
              <input type="checkbox" id="tx-toggle-trash" ${filters.showTrash ? 'checked' : ''} style="cursor: pointer; width: 14px; height: 14px; accent-color: var(--color-expense);">
              <label for="tx-toggle-trash" style="font-size: 12px; color: var(--text-secondary); cursor: pointer; font-weight: 600; user-select: none;">Exibir Lixeira</label>
            </div>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="table-header-filters" style="display: flex; flex-direction: column; gap: 12px; align-items: stretch;">
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <div class="search-input-wrapper" style="flex: 1; min-width: 200px;">
              <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input type="text" id="tx-search-input" placeholder="Buscar por descrição..." value="${filters.search}" autocomplete="off">
            </div>
            
            <div class="filters-row" style="flex-wrap: wrap; gap: 8px;">
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
          
          <!-- Date Range Filter Row -->
          <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-start; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>Período de:</span>
              <input type="date" id="tx-filter-start-date" style="padding: 4px 8px; font-family: inherit; font-size: 12px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px;" value="${filters.startDate || ''}">
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>até:</span>
              <input type="date" id="tx-filter-end-date" style="padding: 4px 8px; font-family: inherit; font-size: 12px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px;" value="${filters.endDate || ''}">
            </div>
            <button type="button" id="tx-filter-clear-dates-btn" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px; height: 26px;" title="Limpar período de datas">Limpar Datas</button>
            
            <div style="margin-left: auto; display: flex; align-items: center; gap: 6px;">
              <button type="button" class="btn btn-secondary quick-date-btn" data-range="this-month" style="padding: 4px 8px; font-size: 11px; height: 26px;">Este Mês</button>
              <button type="button" class="btn btn-secondary quick-date-btn" data-range="last-30" style="padding: 4px 8px; font-size: 11px; height: 26px;">Últimos 30 Dias</button>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                ${renderHeader('date', 'Data')}
                ${renderHeader('description', 'Descrição')}
                ${renderHeader('category', 'Categoria')}
                ${renderHeader('account', 'Conta')}
                ${renderHeader('member', 'Responsável')}
                ${renderHeader('status', 'Status')}
                ${renderHeader('amount', 'Valor')}
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
                <div style="display: flex; gap: 8px;">
                  <select id="edit-tx-category" required style="flex: 1;"></select>
                  <button type="button" id="edit-add-new-cat-btn" class="btn btn-secondary" style="padding: 0 10px; font-weight: bold; font-size: 16px; min-width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Criar Nova Categoria na hora">+</button>
                </div>
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
    const toggleTrash = document.getElementById("tx-toggle-trash");
    const startDateInput = document.getElementById("tx-filter-start-date");
    const endDateInput = document.getElementById("tx-filter-end-date");
    const clearDatesBtn = document.getElementById("tx-filter-clear-dates-btn");
    const quickRangeBtns = document.querySelectorAll(".quick-date-btn");

    // Bind filters changes
    const updateFilters = () => {
      const isSearchFocused = document.activeElement && document.activeElement.id === 'tx-search-input';
      const searchSelStart = searchInput ? searchInput.selectionStart : 0;
      const searchSelEnd = searchInput ? searchInput.selectionEnd : 0;

      state.txFilters = {
        search: searchInput ? searchInput.value : '',
        type: filterType ? filterType.value : 'all',
        account: filterAccount ? filterAccount.value : 'all',
        status: filterStatus ? filterStatus.value : 'all',
        member: filterMember ? filterMember.value : 'all',
        showTrash: toggleTrash ? toggleTrash.checked : false,
        startDate: startDateInput ? startDateInput.value : '',
        endDate: endDateInput ? endDateInput.value : ''
      };

      state.txSearchFocus = {
        focused: isSearchFocused,
        start: searchSelStart,
        end: searchSelEnd
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
    if (toggleTrash) {
      toggleTrash.addEventListener("change", updateFilters);
    }
    if (startDateInput) {
      startDateInput.addEventListener("change", updateFilters);
    }
    if (endDateInput) {
      endDateInput.addEventListener("change", updateFilters);
    }
    if (clearDatesBtn) {
      clearDatesBtn.addEventListener("click", () => {
        if (startDateInput) startDateInput.value = "";
        if (endDateInput) endDateInput.value = "";
        updateFilters();
      });
    }
    quickRangeBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const range = e.currentTarget.getAttribute("data-range");
        const today = new Date();
        
        if (range === "this-month") {
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          if (startDateInput) startDateInput.value = firstDay.toLocaleDateString('en-CA');
          if (endDateInput) endDateInput.value = lastDay.toLocaleDateString('en-CA');
        } else if (range === "last-30") {
          const past30 = new Date();
          past30.setDate(today.getDate() - 30);
          
          if (startDateInput) startDateInput.value = past30.toLocaleDateString('en-CA');
          if (endDateInput) endDateInput.value = today.toLocaleDateString('en-CA');
        }
        updateFilters();
      });
    });

    // Restore search input focus and cursor selection if it was active
    if (state.txSearchFocus && state.txSearchFocus.focused && searchInput) {
      searchInput.focus();
      try {
        searchInput.setSelectionRange(state.txSearchFocus.start, state.txSearchFocus.end);
      } catch (e) {}
      state.txSearchFocus = null; // Reset state
    }

    // Interactive Sorting Events
    const headers = document.querySelectorAll(".sortable-header");
    headers.forEach(h => {
      h.addEventListener("click", (e) => {
        const col = e.currentTarget.getAttribute("data-col");
        if (!state.txSort) {
          state.txSort = { column: 'date', direction: 'desc' };
        }
        if (state.txSort.column === col) {
          state.txSort.direction = state.txSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          state.txSort.column = col;
          state.txSort.direction = col === 'amount' || col === 'date' ? 'desc' : 'asc';
        }
        appInstance.renderActivePage();
      });
    });

    // Delete transaction action
    const deleteBtns = document.querySelectorAll(".delete-tx-btn");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);
        
        if (confirm(`Deseja realmente excluir "${tx.description}"? \nIsso moverá a movimentação para a lixeira.`)) {
          try {
            app.deleteTransaction(txId);
            await app.save();
            
            if (typeof appInstance.updateTasksBadge === 'function') {
              appInstance.updateTasksBadge();
            }
            appInstance.renderActivePage();
          } catch (err) {
            alert(err.message);
          }
        }
      });
    });

    // Restore transaction action
    const restoreBtns = document.querySelectorAll(".restore-tx-btn");
    restoreBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        // Look for the deleted version in the full database
        const tx = app.transactions.find(t => t.id === txId && t.is_deleted && !t.replaced_by_version);
        
        if (tx) {
          if (confirm(`Deseja restaurar a movimentação "${tx.description}" de R$ ${Math.abs(tx.amount).toFixed(2)} de volta para a lista ativa?`)) {
            try {
              app.restoreTransaction(txId);
              await app.save();
              
              if (typeof appInstance.updateTasksBadge === 'function') {
                appInstance.updateTasksBadge();
              }
              appInstance.renderActivePage();
            } catch (err) {
              alert(err.message);
            }
          }
        }
      });
    });

    // CSV Exporter logic
    const exportBtn = document.getElementById("tx-export-csv-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const txsToExport = state.lastFilteredTxs || [];
        if (txsToExport.length === 0) {
          alert("Não há dados para exportar com os filtros atuais.");
          return;
        }

        // CSV headers (strictly compatible with CsvParser.js column map)
        const headers = ["Data", "Descrição", "Valor", "Categoria", "Conta", "Responsável", "Status"];
        const rows = txsToExport.map(t => {
          const cat = app.categories.find(c => c.id === t.category_id) || { name: 'Sem Categoria' };
          const acc = app.accounts.find(a => a.id === t.account_id) || { name: 'Sem Conta' };
          return [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.amount,
            `"${cat.name.replace(/"/g, '""')}"`,
            `"${acc.name.replace(/"/g, '""')}"`,
            t.member || 'Casal',
            t.status === 'confirmed' ? 'Realizado' : 'Previsto'
          ];
        });

        // Add Byte Order Mark (BOM) for correct UTF-8 loading in Excel
        const csvContent = "\uFEFF" + [headers.join(",")].concat(rows.map(r => r.join(","))).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `lumen_export_${new Date().toLocaleDateString('en-CA')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

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
      // Reload categories dropdown depending on type (expense / income) - sorted alphabetically
      const catSelect = document.getElementById("edit-tx-category");
      if (!catSelect) return;
      
      let catOptions = '';
      const sortedCats = [...app.categories]
        .filter(c => c.is_active && c.type === type)
        .sort((a, b) => a.name.localeCompare(b.name));

      sortedCats.forEach(c => {
        catOptions += `<option value="${c.id}">${c.name}</option>`;
      });
      catSelect.innerHTML = catOptions;
    };

    if (editToggleExpense && editToggleIncome) {
      editToggleExpense.addEventListener("click", () => setEditType('expense'));
      editToggleIncome.addEventListener("click", () => setEditType('income'));
    }

    // Quick Add Category inside Edit Modal Click Handler
    const editAddNewCatBtn = document.getElementById('edit-add-new-cat-btn');
    if (editAddNewCatBtn) {
      editAddNewCatBtn.addEventListener('click', async () => {
        const type = currentEditType || 'expense';
        const labelType = type === 'income' ? 'Receita' : 'Despesa';
        const name = prompt(`Criar Nova Categoria de ${labelType}:\nDigite o nome da categoria:`);
        if (name && name.trim()) {
          const cleanName = name.trim();
          let cat = app.categories.find(c => c.name.toLowerCase() === cleanName.toLowerCase() && c.type === type);
          if (!cat) {
            try {
              cat = app.addCategory({ name: cleanName, type });
              await app.save();
            } catch (err) {
              alert(err.message);
              return;
            }
          }
          // Reload options and auto-select
          setEditType(type);
          const catSelect = document.getElementById('edit-tx-category');
          if (catSelect) {
            catSelect.value = cat.id;
          }
        }
      });
    }

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
          
          if (typeof appInstance.updateTasksBadge === 'function') {
            appInstance.updateTasksBadge();
          }
          appInstance.renderActivePage(); // Reload table
        } catch (err) {
          alert(err.message);
        }
      });
    }
  }
}
