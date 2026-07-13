class PanelPage {
  static render(app) {
    const today = "2026-07-13"; // App baseline date
    const activeTxs = app.getActiveTransactions();
    
    // 1. Calculate daily balances for 30-day projection
    const endDate = FinancialEngine.addDays(today, 30);
    const dailyBalances = FinancialEngine.calculateDailyBalances(app.accounts, activeTxs, today, endDate);
    
    // 2. Compute KPIs
    const kpis = FinancialEngine.calculateKPIs(dailyBalances, activeTxs, today);
    
    const formattedMargin = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(kpis.decisionMargin));
    const formattedToday = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.cashToday);
    const formattedFuture = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.cashFuture);
    const formattedLowest = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(kpis.lowestBalance));
    
    // 3. Render Decision Banner
    let decisionHtml = '';
    if (kpis.decisionMargin > 0) {
      decisionHtml = `
        <div class="decision-statement">
          <h3>Margem de Decisão</h3>
          <h2 class="margin-positive">Sim, vocês podem gastar!</h2>
          <p>Vocês podem gastar até <strong>${formattedMargin}</strong> hoje sem que o saldo consolidado fique negativo nos próximos 30 dias.</p>
        </div>
        <div class="decision-margin-bubble">
          <div class="decision-margin-title">Disponível Hoje</div>
          <div class="decision-margin-value margin-positive">${formattedMargin}</div>
        </div>
      `;
    } else if (kpis.decisionMargin === 0) {
      decisionHtml = `
        <div class="decision-statement">
          <h3>Margem de Decisão</h3>
          <h2 style="color: var(--color-warning);">Caixa no limite!</h2>
          <p>Vocês não possuem margem de gastos hoje. Qualquer compra adicional pode comprometer os pagamentos futuros.</p>
        </div>
        <div class="decision-margin-bubble">
          <div class="decision-margin-title">Disponível Hoje</div>
          <div class="decision-margin-value" style="color: var(--color-warning);">R$ 0,00</div>
        </div>
      `;
    } else {
      decisionHtml = `
        <div class="decision-statement">
          <h3>Margem de Decisão</h3>
          <h2 class="margin-negative">Atenção! Caixa negativo projetado</h2>
          <p>Evitem gastos não essenciais. O saldo do casal ficará negativo em <strong>${formattedMargin}</strong> no dia ${kpis.lowestBalanceDate.split('-').reverse().join('/')}.</p>
        </div>
        <div class="decision-margin-bubble">
          <div class="decision-margin-title">Ajuste Necessário</div>
          <div class="decision-margin-value margin-negative">-${formattedMargin}</div>
        </div>
      `;
    }

    // 4. Render Recent Transactions List
    const sortedTxs = [...activeTxs]
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
      .slice(0, 5);

    let txsHtml = '';
    if (sortedTxs.length === 0) {
      txsHtml = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/></svg>
          <h4>Nenhuma transação registrada</h4>
          <p>Clique em "Nova Movimentação" para começar.</p>
        </div>
      `;
    } else {
      txsHtml = `<div class="tx-list">`;
      sortedTxs.forEach(t => {
        const cat = app.categories.find(c => c.id === t.category_id) || { name: 'Sem Categoria' };
        const acc = app.accounts.find(a => a.id === t.account_id) || { name: 'Sem Conta' };
        const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount));
        const amountClass = t.amount > 0 ? 'amount-in' : 'amount-out';
        const sign = t.amount > 0 ? '+' : '-';
        const formattedDate = t.date.split('-').reverse().slice(0, 2).join('/'); // dd/mm
        
        txsHtml += `
          <div class="tx-row-item">
            <div class="tx-item-info">
              <div class="tx-item-desc">${t.description}</div>
              <div class="tx-item-meta">
                <span>${formattedDate}</span>
                <span class="account-tag">${acc.name}</span>
                <span>•</span>
                <span>${cat.name}</span>
                <span class="badge badge-${t.status}">${t.status === 'confirmed' ? 'Realizado' : 'Previsto'}</span>
              </div>
            </div>
            <div class="tx-item-amount ${amountClass}">
              ${sign}${formattedAmount}
            </div>
          </div>
        `;
      });
      txsHtml += `</div>`;
    }

    // 5. Render Accounts Summary
    let accountsHtml = `<div class="acc-list">`;
    app.accounts.filter(a => a.is_active).forEach(acc => {
      // Calculate current balance of this account up to today
      const accTxs = activeTxs.filter(t => t.account_id === acc.id && t.date <= today);
      const accChange = accTxs.reduce((sum, t) => sum + t.amount, 0);
      const accBalance = acc.initial_balance + accChange;
      const formattedAccBal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(accBalance);
      
      accountsHtml += `
        <div class="acc-row-item">
          <span class="acc-name">${acc.name}</span>
          <span class="acc-val ${accBalance >= 0 ? '' : 'amount-out'}">${formattedAccBal}</span>
        </div>
      `;
    });
    accountsHtml += `</div>`;

    // 6. Calculate future flows (date > today and <= endDate) per member
    const futureTxs = activeTxs.filter(t => t.date > today && t.date <= endDate);
    
    let paulaIncome = 0, paulaExpense = 0;
    let alcidesIncome = 0, alcidesExpense = 0;
    let casalIncome = 0, casalExpense = 0;

    futureTxs.forEach(t => {
      const val = t.amount;
      const mem = t.member || 'Casal';
      if (val > 0) {
        if (mem === 'Paula') paulaIncome += val;
        else if (mem === 'Alcides') alcidesIncome += val;
        else casalIncome += val;
      } else {
        if (mem === 'Paula') paulaExpense += Math.abs(val);
        else if (mem === 'Alcides') alcidesExpense += Math.abs(val);
        else casalExpense += Math.abs(val);
      }
    });

    const fmtPaulaInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paulaIncome);
    const fmtPaulaExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paulaExpense);
    const fmtAlcSInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alcidesIncome);
    const fmtAlcSExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alcidesExpense);
    const fmtCasalInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(casalIncome);
    const fmtCasalExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(casalExpense);

    // 7. Return Page HTML
    return `
      <div class="panel-grid animate-fade-in">
        
        <!-- Decision Banner -->
        <div class="decision-card">
          ${decisionHtml}
        </div>

        <!-- KPIs row -->
        <div class="kpis-row">
          <div class="kpi-card">
            <div class="kpi-label">Caixa Hoje</div>
            <div class="kpi-value ${kpis.cashToday >= 0 ? '' : 'amount-out'}">${formattedToday}</div>
            <div class="kpi-subtext">Saldo consolidado atual</div>
          </div>
          
          <div class="kpi-card">
            <div class="kpi-label">Caixa Futuro</div>
            <div class="kpi-value ${kpis.cashFuture >= 0 ? '' : 'amount-out'}">${formattedFuture}</div>
            <div class="kpi-subtext">Saldo projetado em 30 dias</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Menor Saldo Projetado</div>
            <div class="kpi-value ${kpis.lowestBalance >= 0 ? '' : 'amount-out'}">${formattedLowest}</div>
            <div class="kpi-subtext">No dia ${kpis.lowestBalanceDate.split('-').reverse().join('/')}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Próxima Receita</div>
            <div class="kpi-value" style="color: var(--accent-secondary);">
              ${kpis.daysToNextIncome === null ? 'Nenhuma' : kpis.daysToNextIncome === 0 ? 'Hoje' : `${kpis.daysToNextIncome} dias`}
            </div>
            <div class="kpi-subtext">Tempo até a próxima entrada</div>
          </div>
        </div>

        <!-- Split Screen: Recent Activities, Accounts & Flow by Member -->
        <div class="recent-split" style="display: grid; grid-template-columns: 1.2fr 0.9fr 1fr; gap: 20px;">
          <div class="section-card">
            <h3>Movimentações Recentes</h3>
            ${txsHtml}
          </div>
          
          <div class="section-card">
            <h3>Saldos de Caixa</h3>
            ${accountsHtml}
          </div>

          <div class="section-card">
            <h3>Fluxo Futuro por Membro (30d)</h3>
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 12px;">
              
              <!-- Paula -->
              <div style="border-left: 3px solid hsl(320, 80%, 60%); padding-left: 10px;">
                <div style="font-weight: 600; font-size: 13px; color: var(--text-main); margin-bottom: 4px;">Paula</div>
                <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--text-secondary);">
                  <span>Receitas: <strong style="color: var(--color-income);">${fmtPaulaInc}</strong></span>
                  <span>Despesas: <strong style="color: var(--color-expense);">${fmtPaulaExp}</strong></span>
                </div>
              </div>

              <!-- Alcides -->
              <div style="border-left: 3px solid hsl(200, 85%, 55%); padding-left: 10px;">
                <div style="font-weight: 600; font-size: 13px; color: var(--text-main); margin-bottom: 4px;">Alcides</div>
                <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--text-secondary);">
                  <span>Receitas: <strong style="color: var(--color-income);">${fmtAlcSInc}</strong></span>
                  <span>Despesas: <strong style="color: var(--color-expense);">${fmtAlcSExp}</strong></span>
                </div>
              </div>

              <!-- Casal -->
              <div style="border-left: 3px solid var(--text-muted); padding-left: 10px;">
                <div style="font-weight: 600; font-size: 13px; color: var(--text-main); margin-bottom: 4px;">Casal (Compartilhado)</div>
                <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--text-secondary);">
                  <span>Receitas: <strong style="color: var(--color-income);">${fmtCasalInc}</strong></span>
                  <span>Despesas: <strong style="color: var(--color-expense);">${fmtCasalExp}</strong></span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    `;
  }

  static initEvents(app, appInstance) {
    // Panel page has no specific interactive elements other than quick actions, which are global
  }
}
