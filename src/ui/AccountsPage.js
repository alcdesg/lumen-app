class AccountsPage {
  static render(app, state) {
    // 1. Render Accounts List
    let accountsRowsHtml = '';
    const activeAccounts = app.accounts.filter(a => a.is_active);

    if (activeAccounts.length === 0) {
      accountsRowsHtml = `<div class="empty-state">Nenhuma conta cadastrada.</div>`;
    } else {
      activeAccounts.forEach(acc => {
        const formattedInitial = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.initial_balance);
        accountsRowsHtml += `
          <div class="acc-row-item" style="border-bottom: 1px solid var(--border-color); padding: 12px 0;">
            <div>
              <div style="font-weight: 600; font-size:14px;">${acc.name}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top:2px;">Saldo Inicial: ${formattedInitial}</div>
            </div>
            <button class="btn-action-icon btn-delete delete-acc-btn" data-acc-id="${acc.id}" title="Excluir conta">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        `;
      });
    }

    // 2. Render Categories Lists (Grouped by type)
    const activeCategories = app.categories.filter(c => c.is_active);
    const incomes = activeCategories.filter(c => c.type === 'income');
    const expenses = activeCategories.filter(c => c.type === 'expense');

    let incomesHtml = '';
    if (incomes.length === 0) {
      incomesHtml = `<div style="font-size: 12px; color: var(--text-muted); padding: 6px 0;">Nenhuma categoria de receita.</div>`;
    } else {
      incomes.forEach(c => {
        incomesHtml += `
          <div class="acc-row-item" style="border-bottom: 1px dashed var(--border-color); padding: 8px 0;">
            <span style="font-weight: 500; font-size: 13px;">${c.name}</span>
            <button class="btn-action-icon btn-delete delete-cat-btn" data-cat-id="${c.id}" title="Excluir categoria">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        `;
      });
    }

    let expensesHtml = '';
    if (expenses.length === 0) {
      expensesHtml = `<div style="font-size: 12px; color: var(--text-muted); padding: 6px 0;">Nenhuma categoria de despesa.</div>`;
    } else {
      expenses.forEach(c => {
        expensesHtml += `
          <div class="acc-row-item" style="border-bottom: 1px dashed var(--border-color); padding: 8px 0;">
            <span style="font-weight: 500; font-size: 13px;">${c.name}</span>
            <button class="btn-action-icon btn-delete delete-cat-btn" data-cat-id="${c.id}" title="Excluir categoria">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        `;
      });
    }

    // 3. Return Combined View HTML
    return `
      <div class="double-split animate-fade-in">
        
        <!-- Left Column: Accounts -->
        <div class="section-card">
          <h3 class="card-title-btn">
            Contas de Origem
            <span class="badge badge-confirmed">${activeAccounts.length} Contas</span>
          </h3>
          <div class="acc-list" style="margin-bottom: 24px;">
            ${accountsRowsHtml}
          </div>
          
          <h4 style="font-size:13px; margin-bottom:12px; text-transform:uppercase; color:var(--text-secondary);">Cadastrar Nova Conta</h4>
          <form id="add-account-form" class="modal-form">
            <div class="form-row">
              <label for="acc-new-name">Nome da Conta*</label>
              <input type="text" id="acc-new-name" placeholder="Ex: Carteira Dinheiro, Conta Caixa..." required autocomplete="off">
            </div>
            <div class="form-row">
              <label for="acc-new-balance">Saldo Inicial (R$)*</label>
              <input type="number" id="acc-new-balance" placeholder="0,00" step="0.01" required autocomplete="off">
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Adicionar Conta</button>
          </form>
        </div>

        <!-- Right Column: Categories -->
        <div class="section-card">
          <h3 class="card-title-btn">
            Categorias Financeiras
            <span class="badge badge-planned">${activeCategories.length} Categorias</span>
          </h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
              <h4 style="font-size:11px; text-transform:uppercase; color:var(--color-income); margin-bottom: 8px;">Receitas (Entradas)</h4>
              <div class="acc-list">
                ${incomesHtml}
              </div>
            </div>
            <div>
              <h4 style="font-size:11px; text-transform:uppercase; color:var(--color-expense); margin-bottom: 8px;">Despesas (Saídas)</h4>
              <div class="acc-list">
                ${expensesHtml}
              </div>
            </div>
          </div>

          <h4 style="font-size:13px; margin-bottom:12px; text-transform:uppercase; color:var(--text-secondary);">Cadastrar Nova Categoria</h4>
          <form id="add-category-form" class="modal-form">
            <div class="form-row">
              <label for="cat-new-name">Nome da Categoria*</label>
              <input type="text" id="cat-new-name" placeholder="Ex: Combustível, Salão de Beleza..." required autocomplete="off">
            </div>
            <div class="form-row">
              <label for="cat-new-type">Tipo de Categoria*</label>
              <select id="cat-new-type">
                <option value="expense">Despesa (Saída)</option>
                <option value="income">Receita (Entrada)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Adicionar Categoria</button>
          </form>
        </div>

      </div>

      <!-- Settings Card -->
      <div class="section-card animate-fade-in" style="margin-top: 24px;">
        <h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
          ⚙️ Personalização do Lumen
        </h3>
        <div style="max-width: 450px;">
          
          <!-- Rename Couple -->
          <div>
            <h4 style="font-size:13px; margin-bottom:12px; text-transform:uppercase; color:var(--text-secondary);">Renomear Casal</h4>
            <form id="settings-couple-form" class="modal-form">
              <div class="form-row">
                <label for="settings-couple-names">Nomes do Casal*</label>
                <input type="text" id="settings-couple-names" value="${app.settings.couple_names || 'Paula & Alcides'}" required autocomplete="off">
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Salvar Alterações</button>
            </form>
          </div>

        </div>
      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    const accForm = document.getElementById("add-account-form");
    const catForm = document.getElementById("add-category-form");
    const coupleForm = document.getElementById("settings-couple-form");

    // Add Account handler
    if (accForm) {
      accForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("acc-new-name").value;
        const initial_balance = Number(document.getElementById("acc-new-balance").value);

        try {
          app.addAccount({ name, initial_balance });
          await app.save();
          appInstance.renderActivePage(); // Reload UI
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Add Category handler
    if (catForm) {
      catForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("cat-new-name").value;
        const type = document.getElementById("cat-new-type").value;

        try {
          app.addCategory({ name, type });
          await app.save();
          appInstance.renderActivePage(); // Reload UI
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Delete Account handler
    const deleteAccBtns = document.querySelectorAll(".delete-acc-btn");
    deleteAccBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-acc-id");
        const acc = app.accounts.find(a => a.id === id);
        
        app.requestAdminAuthorization("Excluir Conta Bancária", async () => {
          if (confirm(`Deseja mesmo excluir a conta "${acc.name}"?`)) {
            try {
              app.deleteAccount(id);
              await app.save();
              appInstance.renderActivePage();
            } catch (err) {
              alert(err.message); // Will fire if account has active transactions
            }
          }
        });
      });
    });

    // Delete Category handler
    const deleteCatBtns = document.querySelectorAll(".delete-cat-btn");
    deleteCatBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-cat-id");
        const cat = app.categories.find(c => c.id === id);
        
        app.requestAdminAuthorization("Excluir Categoria Financeira", async () => {
          if (confirm(`Deseja mesmo excluir a categoria "${cat.name}"?`)) {
            try {
              app.deleteCategory(id);
              await app.save();
              appInstance.renderActivePage();
            } catch (err) {
              alert(err.message); // Will fire if category has active transactions
            }
          }
        });
      });
    });

    // Rename Couple handler
    if (coupleForm) {
      coupleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const names = document.getElementById("settings-couple-names").value;
        app.requestAdminAuthorization("Renomear Casal", async () => {
          try {
            await app.updateCoupleNames(names);
            appInstance.updateWelcomeText();
            alert("Nome do casal atualizado com sucesso!");
            appInstance.renderActivePage();
          } catch (err) {
            alert(err.message);
          }
        });
      });
    }
  }
}
