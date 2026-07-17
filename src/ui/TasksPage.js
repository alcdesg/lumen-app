class TasksPage {
  static render(app, state) {
    const today = new Date().toLocaleDateString('en-CA'); // Dynamic local date
    const pendingTxs = app.getPendingPlannedTransactions(today);

    // Sort pending chronologically (oldest first)
    pendingTxs.sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));

    // Render pending table rows
    let pendingRows = '';
    if (pendingTxs.length === 0) {
      pendingRows = `
        <tr>
          <td colspan="7" class="empty-state" style="padding: 30px 20px; text-align: center;">
            <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: var(--color-income); margin-bottom: 8px; display: inline-block;">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <h4 style="margin: 0 0 4px 0; font-size: 14px;">Tudo em dia!</h4>
            <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Nenhuma transação planejada vencida pendente.</p>
          </td>
        </tr>
      `;
    } else {
      pendingTxs.forEach(t => {
        const cat = app.categories.find(c => c.id === t.category_id) || { name: 'Sem Categoria' };
        const acc = app.accounts.find(a => a.id === t.account_id) || { name: 'Sem Conta' };
        const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount));
        const amountClass = t.amount > 0 ? 'amount-in' : 'amount-out';
        const sign = t.amount > 0 ? '+' : '-';
        const formattedDate = t.date.split('-').reverse().join('/');

        let memberBadge = '';
        if (t.member === 'Paula') {
          memberBadge = `<span class="badge" style="background-color:hsla(320, 80%, 60%, 0.15); color:hsl(320, 80%, 75%); border:1px solid hsla(320, 80%, 60%, 0.25);">Paula</span>`;
        } else if (t.member === 'Alcides') {
          memberBadge = `<span class="badge" style="background-color:hsla(200, 85%, 55%, 0.15); color:hsl(200, 85%, 70%); border:1px solid hsla(200, 85%, 55%, 0.25);">Alcides</span>`;
        } else {
          memberBadge = `<span class="badge" style="background-color:var(--bg-base); color:var(--text-secondary); border:1px solid var(--border-color);">Casal</span>`;
        }

        pendingRows += `
          <tr data-tx-id="${t.id}">
            <td style="font-weight: 500; color: var(--color-warning);">${formattedDate}</td>
            <td style="font-weight: 600;">${t.description}</td>
            <td><span class="account-tag" style="background-color:var(--bg-base); border: 1px solid var(--border-color);">${cat.name}</span></td>
            <td>${acc.name}</td>
            <td>${memberBadge}</td>
            <td class="${amountClass}" style="font-weight: 700; font-family: 'Inter', sans-serif;">
              ${sign}${formattedAmount}
            </td>
            <td class="row-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-primary resolve-confirm-btn" style="padding: 4px 8px; font-size: 11px;" title="Confirmar realização">
                Confirmar
              </button>
              <button class="btn btn-secondary resolve-postpone-btn" style="padding: 4px 8px; font-size: 11px;" title="Adiar vencimento em 7 dias">
                Adiar 7d
              </button>
              <button class="btn btn-danger resolve-delete-btn" style="padding: 4px 8px; font-size: 11px; background-color: transparent; border-color: transparent; color: var(--color-expense);" title="Descartar previsão">
                Excluir
              </button>
            </td>
          </tr>
        `;
      });
    }

    // --- FUTURE PLAN CONTEXT ---
    // Fetch all active planned transactions that reside in the future
    const futureTxs = app.getActiveTransactions().filter(t => t.status === 'planned' && t.date > today);

    // Extract unique months for select drop-down
    const uniqueMonths = [...new Set(futureTxs.map(t => t.date.substring(0, 7)))].sort();
    
    const monthNames = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };
    function formatMonthKey(key) {
      const [year, month] = key.split('-');
      return `${monthNames[month]}/${year.substring(2)}`;
    }

    // Default month filter initialization if not exists
    if (state.selectedFutureMonthFilter === undefined) {
      state.selectedFutureMonthFilter = "";
    }

    // Filter future list
    const filteredFutureTxs = state.selectedFutureMonthFilter
      ? futureTxs.filter(t => t.date.startsWith(state.selectedFutureMonthFilter))
      : futureTxs;

    // Sort future chronologically (oldest first)
    filteredFutureTxs.sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));

    let futureRows = '';
    if (filteredFutureTxs.length === 0) {
      futureRows = `
        <tr>
          <td colspan="7" class="empty-state" style="padding: 30px 20px; text-align: center;">
            <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: var(--text-muted); margin-bottom: 8px; display: inline-block;">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; color: var(--text-muted);">Nenhuma previsão</h4>
            <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Nenhum lançamento futuro previsto nesta competência.</p>
          </td>
        </tr>
      `;
    } else {
      filteredFutureTxs.forEach(t => {
        const cat = app.categories.find(c => c.id === t.category_id) || { name: 'Sem Categoria' };
        const acc = app.accounts.find(a => a.id === t.account_id) || { name: 'Sem Conta' };
        const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount));
        const amountClass = t.amount > 0 ? 'amount-in' : 'amount-out';
        const sign = t.amount > 0 ? '+' : '-';
        const formattedDate = t.date.split('-').reverse().join('/');

        let memberBadge = '';
        if (t.member === 'Paula') {
          memberBadge = `<span class="badge" style="background-color:hsla(320, 80%, 60%, 0.15); color:hsl(320, 80%, 75%); border:1px solid hsla(320, 80%, 60%, 0.25);">Paula</span>`;
        } else if (t.member === 'Alcides') {
          memberBadge = `<span class="badge" style="background-color:hsla(200, 85%, 55%, 0.15); color:hsl(200, 85%, 70%); border:1px solid hsla(200, 85%, 55%, 0.25);">Alcides</span>`;
        } else {
          memberBadge = `<span class="badge" style="background-color:var(--bg-base); color:var(--text-secondary); border:1px solid var(--border-color);">Casal</span>`;
        }

        futureRows += `
          <tr data-tx-id="${t.id}">
            <td style="font-weight: 500; color: var(--color-income);">${formattedDate}</td>
            <td style="font-weight: 600;">${t.description}</td>
            <td><span class="account-tag" style="background-color:var(--bg-base); border: 1px solid var(--border-color);">${cat.name}</span></td>
            <td>${acc.name}</td>
            <td>${memberBadge}</td>
            <td class="${amountClass}" style="font-weight: 700; font-family: 'Inter', sans-serif;">
              ${sign}${formattedAmount}
            </td>
            <td class="row-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-primary resolve-confirm-btn" style="padding: 4px 8px; font-size: 11px;" title="Confirmar realização antecipada">
                Confirmar
              </button>
              <button class="btn btn-secondary future-edit-btn" style="padding: 4px 8px; font-size: 11px;" title="Editar esta previsão">
                Editar
              </button>
              <button class="btn btn-danger resolve-delete-btn" style="padding: 4px 8px; font-size: 11px; background-color: transparent; border-color: transparent; color: var(--color-expense);" title="Descartar previsão">
                Excluir
              </button>
            </td>
          </tr>
        `;
      });
    }

    return `
      <div class="tasks-container animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <div class="section-card">
          <h3>Gestão de Tarefas & Previsões</h3>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
            Monitore suas despesas e receitas recorrentes. Confirme os vencidos para atualizar seu caixa real ou navegue nas competências futuras para ajustar valores de planejamento.
          </p>
        </div>

        <!-- Section 1: Ações Pendentes (Vencidas) -->
        <div class="section-card" style="padding: 20px 24px;">
          <h4 style="font-size: 14px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; font-weight: 700; display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:var(--color-expense);"></span>
            Pendências Requerendo Ação
          </h4>
          <div class="table-card" style="border: none; background: transparent; padding: 0; box-shadow: none;">
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 110px;">Vencimento</th>
                    <th>Descrição</th>
                    <th style="width: 130px;">Categoria</th>
                    <th style="width: 130px;">Conta</th>
                    <th style="width: 110px;">Responsável</th>
                    <th style="width: 120px;">Valor Planejado</th>
                    <th style="width: 220px; text-align: right;">Ações</th>
                  </tr>
                </thead>
                <tbody id="tasks-table-body">
                  ${pendingRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Section 2: Planejamento Futuro (Consultas & Edições) -->
        <div class="section-card" style="padding: 20px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <h4 style="font-size: 14px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; display:flex; align-items:center; gap:8px; margin: 0;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:var(--color-income);"></span>
              Previsões de Fluxo Futuro (YTG)
            </h4>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="future-month-filter" style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Filtrar Mês:</label>
              <select id="future-month-filter" style="padding: 6px 12px; font-size: 12px; border: 1px solid var(--border-color); background-color: var(--bg-sidebar); color: var(--text-main); border-radius: 6px; cursor: pointer; min-width: 140px;">
                <option value="">Todas Previsões</option>
                ${uniqueMonths.map(m => `<option value="${m}" ${state.selectedFutureMonthFilter === m ? 'selected' : ''}>${formatMonthKey(m)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="table-card" style="border: none; background: transparent; padding: 0; box-shadow: none;">
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 110px;">Vencimento</th>
                    <th>Descrição</th>
                    <th style="width: 130px;">Categoria</th>
                    <th style="width: 130px;">Conta</th>
                    <th style="width: 110px;">Responsável</th>
                    <th style="width: 120px;">Valor Previsto</th>
                    <th style="width: 220px; text-align: right;">Ações</th>
                  </tr>
                </thead>
                <tbody id="future-tasks-table-body">
                  ${futureRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- Reconcile Modal Overlay -->
      <div class="modal-overlay" id="reconcile-tx-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Confirmar Realização</h3>
            <button class="close-modal-btn" id="close-reconcile-modal-btn">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/></svg>
            </button>
          </div>
          <form id="reconcile-tx-form" class="modal-form">
            <input type="hidden" id="reconcile-tx-id">
            
            <div class="form-row">
              <label for="reconcile-tx-description">Descrição*</label>
              <input type="text" id="reconcile-tx-description" required autocomplete="off">
            </div>

            <div class="form-grid">
              <div class="form-row">
                <label for="reconcile-tx-date">Data da Realização*</label>
                <input type="date" id="reconcile-tx-date" required>
              </div>
              <div class="form-row">
                <label for="reconcile-tx-amount">Valor Realizado (R$)*</label>
                <input type="number" id="reconcile-tx-amount" step="0.01" required autocomplete="off">
              </div>
            </div>

            <div class="form-actions">
              <span class="shortcut-tip">O lançamento passará a constar como Realizado.</span>
              <button type="button" class="btn btn-secondary" id="cancel-reconcile-modal-btn">Cancelar</button>
              <button type="submit" class="btn btn-primary">Confirmar Realização</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Planned Modal Overlay -->
      <div class="modal-overlay" id="edit-planned-tx-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Editar Previsão Futura</h3>
            <button class="close-modal-btn" id="close-edit-planned-btn">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/></svg>
            </button>
          </div>
          <form id="edit-planned-tx-form" class="modal-form">
            <input type="hidden" id="edit-planned-tx-id">
            
            <div class="form-row">
              <label for="edit-planned-tx-description">Descrição*</label>
              <input type="text" id="edit-planned-tx-description" required autocomplete="off">
            </div>

            <div class="form-grid">
              <div class="form-row">
                <label for="edit-planned-tx-date">Data do Vencimento*</label>
                <input type="date" id="edit-planned-tx-date" required>
              </div>
              <div class="form-row">
                <label for="edit-planned-tx-amount">Valor Planejado (R$)*</label>
                <input type="number" id="edit-planned-tx-amount" step="0.01" required autocomplete="off">
              </div>
            </div>

            <div class="form-actions">
              <span class="shortcut-tip">O lançamento continuará como Planejado com os novos valores.</span>
              <button type="button" class="btn btn-secondary" id="cancel-edit-planned-btn">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    const today = new Date().toLocaleDateString('en-CA'); // Baseline date

    // 1. Reconcile Modal Elements
    const reconcileModal = document.getElementById("reconcile-tx-modal");
    const closeReconcileBtn = document.getElementById("close-reconcile-modal-btn");
    const cancelReconcileBtn = document.getElementById("cancel-reconcile-modal-btn");
    const reconcileForm = document.getElementById("reconcile-tx-form");

    // Edit Modal Elements
    const editModal = document.getElementById("edit-planned-tx-modal");
    const closeEditBtn = document.getElementById("close-edit-planned-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-planned-btn");
    const editForm = document.getElementById("edit-planned-tx-form");

    // Close modals handle
    const closeModal = () => {
      if (reconcileModal) reconcileModal.classList.remove("active");
    };
    const closeEditModal = () => {
      if (editModal) editModal.classList.remove("active");
    };

    if (closeReconcileBtn) {
      closeReconcileBtn.addEventListener("click", closeModal);
      cancelReconcileBtn.addEventListener("click", closeModal);
    }
    if (closeEditBtn) {
      closeEditBtn.addEventListener("click", closeEditModal);
      cancelEditBtn.addEventListener("click", closeEditModal);
    }

    // 2. Click on "Confirmar" (open modal populated)
    const confirmBtns = document.querySelectorAll(".resolve-confirm-btn");
    confirmBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);

        if (tx) {
          document.getElementById("reconcile-tx-id").value = tx.id;
          document.getElementById("reconcile-tx-description").value = tx.description;
          document.getElementById("reconcile-tx-amount").value = Math.abs(tx.amount);
          document.getElementById("reconcile-tx-date").value = today;
          reconcileModal.classList.add("active");
        }
      });
    });

    // 2.5 Click on "Editar" Previsão Futura
    const editBtns = document.querySelectorAll(".future-edit-btn");
    editBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);

        if (tx) {
          document.getElementById("edit-planned-tx-id").value = tx.id;
          document.getElementById("edit-planned-tx-description").value = tx.description;
          document.getElementById("edit-planned-tx-amount").value = Math.abs(tx.amount);
          document.getElementById("edit-planned-tx-date").value = tx.date;
          editModal.classList.add("active");
        }
      });
    });

    // 3. Submit Reconcile Form
    if (reconcileForm) {
      reconcileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const txId = document.getElementById("reconcile-tx-id").value;
        const actualAmountVal = Number(document.getElementById("reconcile-tx-amount").value);
        const actualDate = document.getElementById("reconcile-tx-date").value;
        const description = document.getElementById("reconcile-tx-description").value;

        const tx = app.getActiveTransaction(txId);
        if (!tx) return;

        const sign = tx.amount > 0 ? 1 : -1;
        const amount = actualAmountVal * sign;

        try {
          app.reconcileTransaction(txId, {
            amount,
            date: actualDate,
            description,
            status: 'confirmed'
          });
          await app.save();
          closeModal();
          
          if (typeof appInstance.updateTasksBadge === 'function') {
            appInstance.updateTasksBadge();
          }
          appInstance.renderActivePage();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // 3.5 Submit Edit Planned Form
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const txId = document.getElementById("edit-planned-tx-id").value;
        const amountVal = Number(document.getElementById("edit-planned-tx-amount").value);
        const date = document.getElementById("edit-planned-tx-date").value;
        const description = document.getElementById("edit-planned-tx-description").value;

        const tx = app.getActiveTransaction(txId);
        if (!tx) return;

        const sign = tx.amount > 0 ? 1 : -1;
        const amount = amountVal * sign;

        try {
          app.updateTransaction(txId, {
            amount,
            date,
            description
          });
          await app.save();
          closeEditModal();
          
          if (typeof appInstance.updateTasksBadge === 'function') {
            appInstance.updateTasksBadge();
          }
          appInstance.renderActivePage();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // 4. Click on "Adiar 7d"
    const postponeBtns = document.querySelectorAll(".resolve-postpone-btn");
    postponeBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);

        if (tx) {
          const nextDate = FinancialEngine.addDays(tx.date, 7);
          if (confirm(`Deseja adiar o vencimento de "${tx.description}" para ${nextDate.split('-').reverse().join('/')}?`)) {
            try {
              app.updateTransaction(txId, { date: nextDate });
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

    // 5. Click on "Excluir"
    const deleteBtns = document.querySelectorAll(".resolve-delete-btn");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);

        if (tx) {
          if (confirm(`Deseja realmente descartar a previsão "${tx.description}" de R$ ${Math.abs(tx.amount).toFixed(2)}?\nEsta previsão não constará no histórico de caixa atual.`)) {
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
        }
      });
    });

    // 6. Handle future month filter change
    const futureMonthFilter = document.getElementById("future-month-filter");
    if (futureMonthFilter) {
      futureMonthFilter.addEventListener("change", (e) => {
        state.selectedFutureMonthFilter = e.target.value;
        appInstance.renderActivePage();
      });
    }
  }
}
