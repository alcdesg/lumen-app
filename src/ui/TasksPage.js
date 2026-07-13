class TasksPage {
  static render(app, state) {
    const today = "2026-07-13"; // App baseline date
    const pendingTxs = app.getPendingPlannedTransactions(today);

    // Sort chronologically (oldest first, as it's a list of pending tasks to resolve)
    pendingTxs.sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));

    let tableRows = '';
    if (pendingTxs.length === 0) {
      tableRows = `
        <tr>
          <td colspan="7" class="empty-state" style="padding: 40px 20px;">
            <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: var(--color-income); margin-bottom: 12px;">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <h4>Tudo em dia!</h4>
            <p>Nenhuma transação planejada vencida ou pendente de confirmação.</p>
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
        
        // Date formatting
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
            <td style="font-weight: 500; color: var(--color-warning);">${formattedDate}</td>
            <td style="font-weight: 600;">${t.description}</td>
            <td><span class="account-tag" style="background-color:var(--bg-base); border: 1px solid var(--border-color);">${cat.name}</span></td>
            <td>${acc.name}</td>
            <td>${memberBadge}</td>
            <td class="${amountClass}" style="font-weight: 700; font-family: 'Inter', sans-serif;">
              ${sign}${formattedAmount}
            </td>
            <td class="row-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-primary resolve-confirm-btn" style="padding: 4px 8px; font-size: 11px;" title="Confirmar realização do valor">
                Confirmar
              </button>
              <button class="btn btn-secondary resolve-postpone-btn" style="padding: 4px 8px; font-size: 11px;" title="Adiar vencimento em 7 dias">
                Adiar 7d
              </button>
              <button class="btn btn-danger resolve-delete-btn" style="padding: 4px 8px; font-size: 11px; background-color: transparent; border-color: transparent; color: var(--color-expense);" title="Descartar este lançamento">
                Excluir
              </button>
            </td>
          </tr>
        `;
      });
    }

    return `
      <div class="tasks-container animate-fade-in">
        
        <div class="section-card" style="margin-bottom: 24px;">
          <h3>Tarefas e Conciliação Financeira</h3>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
            Abaixo estão listados todos os lançamentos previstos/planejados que venceram (ou vencem hoje) e precisam ser concluídos. 
            Confirmar um lançamento atualiza o saldo real da conta correspondente.
          </p>
        </div>

        <!-- Pending Table Card -->
        <div class="table-card">
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
                ${tableRows}
              </tbody>
            </table>
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
    `;
  }

  static initEvents(app, state, appInstance) {
    const today = "2026-07-13"; // Baseline

    // 1. Reconcile Modal Elements
    const reconcileModal = document.getElementById("reconcile-tx-modal");
    const closeReconcileBtn = document.getElementById("close-reconcile-modal-btn");
    const cancelReconcileBtn = document.getElementById("cancel-reconcile-modal-btn");
    const reconcileForm = document.getElementById("reconcile-tx-form");

    // Close modal handle
    const closeModal = () => {
      if (reconcileModal) reconcileModal.classList.remove("active");
    };
    if (closeReconcileBtn) {
      closeReconcileBtn.addEventListener("click", closeModal);
      cancelReconcileBtn.addEventListener("click", closeModal);
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
          
          // Set date to today or transaction date (whichever is closer, default to today)
          document.getElementById("reconcile-tx-date").value = today;

          reconcileModal.classList.add("active");
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

        // Keep sign (negative for expenses, positive for income)
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
          
          // Update sidebar badges and refresh page
          if (typeof appInstance.updateTasksBadge === 'function') {
            appInstance.updateTasksBadge();
          }
          appInstance.renderActivePage();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // 4. Click on "Adiar 7d" (postpone by 7 days)
    const postponeBtns = document.querySelectorAll(".resolve-postpone-btn");
    postponeBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const txId = row.getAttribute("data-tx-id");
        const tx = app.getActiveTransaction(txId);

        if (tx) {
          // Calculate date + 7 days
          const nextDate = FinancialEngine.addDays(tx.date, 7);
          if (confirm(`Deseja adiar o vencimento de "${tx.description}" para ${nextDate.split('-').reverse().join('/')}?`)) {
            try {
              // Creating a new version with the postponed date
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

    // 5. Click on "Excluir" (soft-delete)
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
  }
}
