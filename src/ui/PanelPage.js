class PanelPage {
  static render(app) {
    const today = new Date().toLocaleDateString('en-CA'); // Dynamic local date
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

    // Calculate overdue tasks to show disclaimer
    const pendingTxsCount = app.getPendingPlannedTransactions(today).length;
    let pendingAlertHtml = '';
    if (pendingTxsCount > 0) {
      pendingAlertHtml = `
        <div class="pending-tasks-alert animate-fade-in" style="background-color: hsla(38, 100%, 50%, 0.08); border: 1px solid hsla(38, 100%, 50%, 0.2); border-radius: var(--border-radius-md); padding: 12px 16px; color: #f59e0b; font-size: 13px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; grid-column: 1 / -1; margin-bottom: 8px;">
          <span>⚠️ Existem <strong>${pendingTxsCount}</strong> lançamentos previstos vencidos que podem comprometer a precisão da sua projeção de caixa.</span>
          <a href="#tasks" style="color: var(--accent-secondary); font-weight: 600; text-decoration: none; border-bottom: 1px dashed var(--accent-secondary); margin-left: 12px; font-size: 12px;">Visualizar Pendências</a>
        </div>
      `;
    }

    // Calculate Monthly Closing Chart (May to September 2026)
    const chartMonths = [
      { key: '2026-05', label: 'Mai/26' },
      { key: '2026-06', label: 'Jun/26' },
      { key: '2026-07', label: 'Jul/26' },
      { key: '2026-08', label: 'Ago/26' },
      { key: '2026-09', label: 'Set/26' }
    ];

    const monthlyData = chartMonths.map(m => {
      let income = 0;
      let expense = 0;
      activeTxs.forEach(t => {
        if (t.date.startsWith(m.key)) {
          if (t.amount > 0) {
            income += t.amount;
          } else {
            expense += Math.abs(t.amount);
          }
        }
      });
      return {
        ...m,
        income,
        expense
      };
    });

    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1000);

    let chartHtml = `
      <div class="section-card" style="grid-column: 1 / -1; margin-bottom: 8px;">
        <h3>Fechamento Mensal (Entradas vs Saídas)</h3>
        <div class="chart-container" style="display: flex; justify-content: space-around; align-items: flex-end; height: 180px; padding: 20px 10px 10px 10px; border-bottom: 1px solid var(--border-color); margin-top: 16px; position: relative;">
    `;

    monthlyData.forEach(d => {
      const incHeight = Math.max(3, Math.round((d.income / maxVal) * 100));
      const expHeight = Math.max(3, Math.round((d.expense / maxVal) * 100));

      const fmtInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(d.income);
      const fmtExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(d.expense);

      const netVal = d.income - d.expense;
      const fmtNet = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(netVal);
      const netClass = netVal >= 0 ? 'margin-positive' : 'margin-negative';
      const netSign = netVal > 0 ? '+' : '';

      chartHtml += `
        <div class="chart-month-group" style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1;">
          <!-- Saldo Mensal Líquido -->
          <div class="${netClass}" style="font-size: 11px; font-weight: 700; text-align: center; height: 16px; min-width: 60px; font-family: 'Inter', sans-serif;">
            ${netSign}${fmtNet}
          </div>

          <div style="display: flex; gap: 12px; align-items: flex-end; height: 115px; width: 100%; justify-content: center; position: relative;">
            
            <!-- Income bar -->
            <div class="chart-bar income-bar" style="height: ${incHeight}%; width: 24px; background: linear-gradient(180deg, var(--color-income) 0%, hsla(142, 69%, 58%, 0.3) 100%); border-radius: 4px 4px 0 0; position: relative; transition: var(--transition-smooth); cursor: pointer;" title="Entradas: ${fmtInc}">
            </div>
            
            <!-- Expense bar -->
            <div class="chart-bar expense-bar" style="height: ${expHeight}%; width: 24px; background: linear-gradient(180deg, var(--color-expense) 0%, hsla(350, 89%, 60%, 0.3) 100%); border-radius: 4px 4px 0 0; position: relative; transition: var(--transition-smooth); cursor: pointer;" title="Saídas: ${fmtExp}">
            </div>
            
          </div>
          <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">${d.label}</span>
        </div>
      `;
    });

    chartHtml += `
        </div>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 12px; font-size: 11px; font-weight: 600;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; background-color: var(--color-income); border-radius: 2px;"></div>
            <span style="color: var(--text-secondary);">Entradas (Receitas)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; background-color: var(--color-expense); border-radius: 2px;"></div>
            <span style="color: var(--text-secondary);">Saídas (Despesas)</span>
          </div>
        </div>
      </div>
    `;

    // 5.9 Calculate Category Distribution (Current Month: 2026-07)
    const currentMonthKey = '2026-07';
    const categorySums = {};
    let totalMonthExpense = 0;

    activeTxs.forEach(t => {
      if (t.date.startsWith(currentMonthKey) && t.amount < 0) {
        const catId = t.category_id;
        const cat = app.categories.find(c => c.id === catId);
        const catName = cat ? cat.name : 'Sem Categoria';
        categorySums[catName] = (categorySums[catName] || 0) + Math.abs(t.amount);
        totalMonthExpense += Math.abs(t.amount);
      }
    });

    // Sort categories descending
    const sortedCategories = Object.entries(categorySums)
      .map(([name, val]) => ({ name, val }))
      .sort((a, b) => b.val - a.val);

    let categoryBreakdownHtml = '<div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">';
    if (sortedCategories.length === 0) {
      categoryBreakdownHtml += `
        <div style="font-size:12px; color:var(--text-muted); text-align:center; padding: 20px;">
          Nenhuma despesa registrada neste mês.
        </div>
      `;
    } else {
      sortedCategories.forEach(c => {
        const percent = totalMonthExpense > 0 ? Math.round((c.val / totalMonthExpense) * 100) : 0;
        const fmtVal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.val);
        categoryBreakdownHtml += `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:500;">
              <span style="color:var(--text-main); font-weight:600;">${c.name}</span>
              <span style="color:var(--text-secondary);">${fmtVal} <span style="color:var(--text-muted); font-size:10px;">(${percent}%)</span></span>
            </div>
            <div style="width:100%; height:6px; background-color:var(--border-color); border-radius:3px; overflow:hidden;">
              <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%); border-radius:3px;"></div>
            </div>
          </div>
        `;
      });
    }
    categoryBreakdownHtml += '</div>';

    // 7. Return Page HTML
    return `
      <div class="panel-grid animate-fade-in">
        
        <!-- Pending Tasks Alert -->
        ${pendingAlertHtml}

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

        <!-- Monthly Closing Chart -->
        ${chartHtml}

        <!-- Row 1: Recent Activities & Accounts Balances -->
        <div class="recent-split" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px; margin-bottom: 8px;">
          <div class="section-card">
            <h3>Movimentações Recentes</h3>
            ${txsHtml}
          </div>
          
          <div class="section-card">
            <h3>Saldos de Caixa</h3>
            ${accountsHtml}
          </div>
        </div>

        <!-- Row 2: Category Breakdown & Flow by Member -->
        <div class="analysis-split" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="section-card">
            <h3>Distribuição de Despesas (Mês Atual)</h3>
            ${categoryBreakdownHtml}
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
