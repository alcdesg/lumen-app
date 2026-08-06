class CalendarPage {
  static render(app, state) {
    if (!state.calendarState) {
      const now = new Date();
      state.calendarState = {
        year: now.getFullYear(),
        month: now.getMonth(),
        viewMode: 'days' // 'days' | 'months' | 'years'
      };
    }
    if (!state.calendarState.viewMode) {
      state.calendarState.viewMode = 'days';
    }

    const { viewMode } = state.calendarState;

    if (viewMode === 'years') {
      return this.renderYearsView(app, state);
    } else if (viewMode === 'months') {
      return this.renderMonthsView(app, state);
    } else {
      return this.renderDaysView(app, state);
    }
  }

  // Visualização de Dias (Visão Mensal Clássica)
  static renderDaysView(app, state) {
    const { year, month } = state.calendarState;
    const todayStr = new Date().toLocaleDateString('en-CA');

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // To ensure the running balance is 100% correct, we calculate from the beginning of time (or 2026-01-01)
    // up to the last day of the viewed month.
    const startCalcDate = "2026-01-01";
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const endCalcDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    
    const activeTxs = app.getActiveTransactions();
    const dailyBalances = FinancialEngine.calculateDailyBalances(app.accounts, activeTxs, startCalcDate, endCalcDate);

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
    const totalDays = new Date(year, month + 1, 0).getDate();

    let gridHtml = '';
    
    // Weekday headers
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    weekdays.forEach(w => {
      gridHtml += `<div class="weekday-header">${w}</div>`;
    });

    // Padding cells before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      gridHtml += `<div class="calendar-day empty-day"></div>`;
    }

    // Render each day box
    for (let day = 1; day <= totalDays; day++) {
      const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dailyBalances[dayDateStr] || { income: 0, expense: 0, balance: 0, transactions: [] };
      
      const intensityClass = FinancialEngine.getIntensity(dayData.balance);
      const isToday = dayDateStr === todayStr;

      // Adaptable popover positioning classes based on cell coordinates
      const cellIndex = firstDayIndex + day - 1;
      const isTopRow = Math.floor(cellIndex / 7) < 2; // Rows 0 and 1 position downwards
      const isSunday = cellIndex % 7 === 0;         // Sunday aligns left
      const isSaturday = cellIndex % 7 === 6;       // Saturday aligns right

      let popoverClasses = ['day-popover'];
      if (isTopRow) popoverClasses.push('popover-bottom');
      if (isSunday) popoverClasses.push('popover-left-align');
      if (isSaturday) popoverClasses.push('popover-right-align');
      const popoverClassStr = popoverClasses.join(' ');

      const fmtBalance = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(dayData.balance);
      const fmtIncome = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(dayData.income);
      const fmtExpense = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(dayData.expense);

      // Popover details list
      let popoverItemsHtml = '';
      if (dayData.transactions.length > 0) {
        dayData.transactions.forEach(t => {
          const amt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount));
          const typeSign = t.amount > 0 ? '+' : '-';
          const typeClass = t.amount > 0 ? 'flow-in' : 'flow-out';
          popoverItemsHtml += `
            <div class="popover-item">
               <span class="popover-item-desc">${t.description}</span>
               <span class="popover-item-val ${typeClass}">${typeSign}${amt}</span>
            </div>
          `;
        });
      } else {
        popoverItemsHtml = `<div style="text-align:center;font-size:11px;color:var(--text-muted);">Nenhuma movimentação</div>`;
      }

      const popoverHtml = `
        <div class="${popoverClassStr}">
          <div class="popover-header">${day} de ${monthNames[month]}</div>
          ${popoverItemsHtml}
          <div class="popover-divider"></div>
          <div class="popover-item">
            <span style="font-weight:700;">Saldo Final</span>
            <span class="popover-item-val" style="color:var(--text-main);">${fmtBalance}</span>
          </div>
        </div>
      `;

      gridHtml += `
        <div class="calendar-day intensity-${intensityClass} ${isToday ? 'today-day' : ''}" data-date="${dayDateStr}">
          <div class="day-number">${day}</div>
          
          <div class="day-flows">
            ${dayData.income > 0 ? `<div class="flow-indicator flow-in">+${fmtIncome}</div>` : ''}
            ${dayData.expense > 0 ? `<div class="flow-indicator flow-out">-${fmtExpense}</div>` : ''}
          </div>

          <div class="day-balance">${fmtBalance}</div>
          ${popoverHtml}
        </div>
      `;
    }

    return `
      <div class="calendar-view-card animate-fade-in">
        <div class="calendar-header">
          <h2>Calendário Financeiro</h2>
          <div class="calendar-nav">
            <button class="btn btn-secondary" id="cal-prev-btn" style="padding: 6px 12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <span class="calendar-month-title" id="cal-header-title" style="cursor: pointer; user-select: none;" title="Subir para visualização de meses">${monthNames[month]} de ${year}</span>
            <button class="btn btn-secondary" id="cal-next-btn" style="padding: 6px 12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
          <div class="kpi-subtext" style="text-align:right;">Passe o mouse para ver detalhes. Clique para registrar.</div>
        </div>

        <div class="calendar-grid">
          ${gridHtml}
        </div>
      </div>
    `;
  }

  // Visualização de Meses (Visão Anual com resumos e saldos de fechamento de caixa)
  static renderMonthsView(app, state) {
    const { year } = state.calendarState;
    const activeTxs = app.getActiveTransactions();
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let gridHtml = '';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate daily balances for the entire year to get the ending balance of each month
    const endCalcDate = `${year}-12-31`;
    const dailyBalances = FinancialEngine.calculateDailyBalances(app.accounts, activeTxs, "2026-01-01", endCalcDate);

    for (let m = 0; m < 12; m++) {
      const monthKey = `${year}-${String(m + 1).padStart(2, '0')}`;
      let income = 0;
      let expense = 0;
      activeTxs.forEach(t => {
        if (t.date.startsWith(monthKey)) {
          if (t.amount > 0) income += t.amount;
          else expense += Math.abs(t.amount);
        }
      });
      const net = income - expense;

      // Running balance at the end of this month
      const lastDay = new Date(year, m + 1, 0).getDate();
      const monthEndKey = `${year}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const endBalance = dailyBalances[monthEndKey]?.balance || 0;

      const fmtInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(income);
      const fmtExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(expense);
      const fmtNet = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.abs(net));
      const fmtEndBalance = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(endBalance);
      
      const netClass = net >= 0 ? 'margin-positive' : 'margin-negative';
      const netSign = net >= 0 ? '+' : '-';
      const endBalanceClass = endBalance >= 0 ? 'margin-positive' : 'margin-negative';
      const isCurrentMonth = year === currentYear && m === currentMonth;

      gridHtml += `
        <div class="calendar-month-card ${isCurrentMonth ? 'active-month' : ''}" data-month="${m}">
          <div class="calendar-card-title">${monthNames[m]}</div>
          <div class="calendar-card-summary">
            <div class="calendar-summary-row">
              <span>Receitas:</span>
              <span class="margin-positive" style="font-weight: 500;">+${fmtInc}</span>
            </div>
            <div class="calendar-summary-row">
              <span>Despesas:</span>
              <span class="margin-negative" style="font-weight: 500;">-${fmtExp}</span>
            </div>
            <div class="calendar-summary-row calendar-summary-net">
              <span>Balanço:</span>
              <span class="${netClass}">${netSign}${fmtNet}</span>
            </div>
            <div class="calendar-summary-row" style="margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 4px;">
              <span>Caixa Final:</span>
              <span class="${endBalanceClass}" style="font-weight: 700;">${fmtEndBalance}</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="calendar-view-card animate-fade-in">
        <div class="calendar-header">
          <h2>Calendário: Meses de ${year}</h2>
          <div class="calendar-nav">
            <button class="btn btn-secondary" id="cal-prev-btn" style="padding: 6px 12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <span class="calendar-month-title" id="cal-header-title" style="cursor: pointer; user-select: none;" title="Subir para visualização de anos">${year}</span>
            <button class="btn btn-secondary" id="cal-next-btn" style="padding: 6px 12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
          <div class="kpi-subtext" style="text-align:right;">Selecione um mês para ver opções e detalhes.</div>
        </div>

        <div class="calendar-months-grid">
          ${gridHtml}
        </div>
      </div>
    `;
  }

  // Visualização de Anos (Visão Década com resumos e saldos de fechamento de caixa)
  static renderYearsView(app, state) {
    const { year } = state.calendarState;
    const activeTxs = app.getActiveTransactions();
    
    // Decade calculations (range of 12 years e.g., 2020 to 2031)
    const startYear = Math.floor(year / 10) * 10 - 1;
    const endYear = startYear + 11;

    let gridHtml = '';
    const now = new Date();
    const currentYear = now.getFullYear();

    const yearData = {};
    for (let y = startYear; y <= endYear; y++) {
      yearData[y] = { income: 0, expense: 0 };
    }

    activeTxs.forEach(t => {
      const y = parseInt(t.date.substring(0, 4));
      if (y >= startYear && y <= endYear) {
        if (t.amount > 0) yearData[y].income += t.amount;
        else yearData[y].expense += Math.abs(t.amount);
      }
    });

    // Calculate daily balances up to the end of the decade range to extract ending balances of each year
    const endDecadeDate = `${endYear}-12-31`;
    const dailyBalances = FinancialEngine.calculateDailyBalances(app.accounts, activeTxs, "2026-01-01", endDecadeDate);

    for (let y = startYear; y <= endYear; y++) {
      const { income, expense } = yearData[y];
      const net = income - expense;
      
      // Running balance at the end of December 31st of this year
      const yearEndKey = `${y}-12-31`;
      const endBalance = dailyBalances[yearEndKey]?.balance || 0;

      const fmtInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(income);
      const fmtExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(expense);
      const fmtNet = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.abs(net));
      const fmtEndBalance = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(endBalance);
      
      const netClass = net >= 0 ? 'margin-positive' : 'margin-negative';
      const netSign = net >= 0 ? '+' : '-';
      const endBalanceClass = endBalance >= 0 ? 'margin-positive' : 'margin-negative';
      const isCurrentYear = y === currentYear;

      gridHtml += `
        <div class="calendar-year-card ${isCurrentYear ? 'active-year' : ''}" data-year="${y}">
          <div class="calendar-card-title">${y}</div>
          <div class="calendar-card-summary">
            <div class="calendar-summary-row">
              <span>Receitas:</span>
              <span class="margin-positive" style="font-weight: 500;">+${fmtInc}</span>
            </div>
            <div class="calendar-summary-row">
              <span>Despesas:</span>
              <span class="margin-negative" style="font-weight: 500;">-${fmtExp}</span>
            </div>
            <div class="calendar-summary-row calendar-summary-net">
              <span>Balanço:</span>
              <span class="${netClass}">${netSign}${fmtNet}</span>
            </div>
            <div class="calendar-summary-row" style="margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 4px;">
              <span>Caixa Final:</span>
              <span class="${endBalanceClass}" style="font-weight: 700;">${fmtEndBalance}</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="calendar-view-card animate-fade-in">
        <div class="calendar-header">
          <h2>Calendário: Anos (${startYear} - ${endYear})</h2>
          <div class="calendar-nav">
            <button class="btn btn-secondary" id="cal-prev-btn" style="padding: 6px 12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <span class="calendar-month-title" id="cal-header-title" style="user-select: none;">${startYear} - ${endYear}</span>
            <button class="btn btn-secondary" id="cal-next-btn" style="padding: 6px 12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
          <div class="kpi-subtext" style="text-align:right;">Selecione um ano para ver opções e detalhes.</div>
        </div>

        <div class="calendar-years-grid">
          ${gridHtml}
        </div>
      </div>
    `;
  }

  // Floating Context Menu Modal for calendar element interactions
  static showChoiceModal(titleText, appInstance, dateStr, onFilter, onDrillDown = null, drillLabel = "", summaryData = null) {
    const existing = document.getElementById('calendar-choice-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'calendar-choice-modal';
    modal.className = 'modal-overlay active';
    
    let drillBtnHtml = '';
    if (onDrillDown && drillLabel) {
      drillBtnHtml = `
        <button class="btn btn-primary" id="btn-choice-drill" style="width:100%; justify-content:center; background-color: var(--accent-primary);">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${drillLabel}
        </button>
      `;
    }

    // Generate daily summary HTML for context visibility (especially on mobile devices where hover is disabled)
    let summaryHtml = '';
    if (summaryData) {
      const { income, expense, balance, transactions } = summaryData;
      const fmtBalance = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(balance);
      const fmtIncome = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(income);
      const fmtExpense = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(expense);
      const balanceClass = balance >= 0 ? 'margin-positive' : 'margin-negative';

      let txListHtml = '';
      if (transactions && transactions.length > 0) {
        txListHtml = `
          <div style="max-height: 110px; overflow-y: auto; margin-top: 10px; padding: 8px; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: var(--bg-sidebar); text-align: left;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Movimentações do Dia</div>
        `;
        transactions.forEach(t => {
          const amt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount));
          const typeClass = t.amount > 0 ? 'flow-in' : 'flow-out';
          const typeSign = t.amount > 0 ? '+' : '-';
          txListHtml += `
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px; color: var(--text-main);">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="${t.description}">${t.description}</span>
              <span class="${typeClass}" style="font-weight:600;">${typeSign}${amt}</span>
            </div>
          `;
        });
        txListHtml += `</div>`;
      } else {
        txListHtml = `
          <div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 8px; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: var(--bg-sidebar); margin-top: 10px;">
            Nenhum lançamento registrado neste dia
          </div>
        `;
      }

      summaryHtml = `
        <div style="margin: 4px 0 10px 0; padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; gap: 4px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color: var(--text-secondary);">
            <span>Receitas:</span>
            <span class="margin-positive" style="font-weight:600;">+${fmtIncome}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color: var(--text-secondary);">
            <span>Despesas:</span>
            <span class="margin-negative" style="font-weight:600;">-${fmtExpense}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color: var(--text-main); font-weight: 700; margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 4px;">
            <span>Caixa Projetado:</span>
            <span class="${balanceClass}">${fmtBalance}</span>
          </div>
          ${txListHtml}
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 320px; padding: 22px; text-align: center; display: flex; flex-direction: column; gap: 14px; border-radius: var(--border-radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 1px solid var(--border-color); background: var(--bg-card);">
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-main);">${titleText}</h3>
        
        ${summaryHtml}

        <p style="font-size: 11px; color: var(--text-secondary); margin: 0 0 2px 0;">O que você deseja fazer neste período?</p>
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
          ${drillBtnHtml}
          <button class="btn btn-secondary" id="btn-choice-add" style="width:100%; justify-content:center; border: 1px solid var(--border-color); background: var(--bg-sidebar); color: var(--text-main); font-weight: 600;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><path d="M12 5v14M5 12h14"/></svg>
            Registrar Lançamento
          </button>
          <button class="btn btn-secondary" id="btn-choice-view" style="width:100%; justify-content:center; border: 1px solid var(--border-color); background: var(--bg-sidebar); color: var(--text-main); font-weight: 600;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Ver Transações
          </button>
          <button class="btn btn-secondary" id="btn-choice-cancel" style="width:100%; justify-content:center; border:none; background:transparent; color:var(--text-muted); cursor:pointer; font-size:12px; margin-top: 4px;">
            Cancelar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 200);
    };

    if (onDrillDown) {
      modal.querySelector('#btn-choice-drill').onclick = () => {
        close();
        onDrillDown();
      };
    }

    modal.querySelector('#btn-choice-add').onclick = () => {
      close();
      appInstance.openQuickAddModal(dateStr);
    };

    modal.querySelector('#btn-choice-view').onclick = () => {
      close();
      onFilter();
    };

    modal.querySelector('#btn-choice-cancel').onclick = close;
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };
  }

  static initEvents(app, state, appInstance) {
    const prevBtn = document.getElementById("cal-prev-btn");
    const nextBtn = document.getElementById("cal-next-btn");
    const headerTitle = document.getElementById("cal-header-title");

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        const { viewMode } = state.calendarState;
        if (viewMode === 'years') {
          state.calendarState.year -= 12;
        } else if (viewMode === 'months') {
          state.calendarState.year -= 1;
        } else {
          let { month, year } = state.calendarState;
          if (month === 0) {
            month = 11;
            year -= 1;
          } else {
            month -= 1;
          }
          state.calendarState.month = month;
          state.calendarState.year = year;
        }
        appInstance.renderActivePage();
      });

      nextBtn.addEventListener("click", () => {
        const { viewMode } = state.calendarState;
        if (viewMode === 'years') {
          state.calendarState.year += 12;
        } else if (viewMode === 'months') {
          state.calendarState.year += 1;
        } else {
          let { month, year } = state.calendarState;
          if (month === 11) {
            month = 0;
            year += 1;
          } else {
            month += 1;
          }
          state.calendarState.month = month;
          state.calendarState.year = year;
        }
        appInstance.renderActivePage();
      });
    }

    if (headerTitle) {
      headerTitle.addEventListener("click", () => {
        const { viewMode } = state.calendarState;
        if (viewMode === 'days') {
          state.calendarState.viewMode = 'months';
        } else if (viewMode === 'months') {
          state.calendarState.viewMode = 'years';
        }
        appInstance.renderActivePage();
      });
    }

    // Set view specific click triggers and modal actions
    const { viewMode } = state.calendarState;
    if (viewMode === 'years') {
      const cards = document.querySelectorAll(".calendar-year-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const y = parseInt(card.getAttribute("data-year"));
          const firstDayStr = `${y}-01-01`;
          const lastDayStr = `${y}-12-31`;
          
          CalendarPage.showChoiceModal(
            `Ano ${y}`,
            appInstance,
            firstDayStr,
            () => {
              // Filtrar transações por ano
              state.txFilters = {
                search: '',
                type: 'all',
                account: 'all',
                status: 'all',
                member: 'all',
                showTrash: false,
                startDate: firstDayStr,
                endDate: lastDayStr
              };
              window.location.hash = '#transactions';
            },
            () => {
              // Drill Down para visão de meses
              state.calendarState.year = y;
              state.calendarState.viewMode = 'months';
              appInstance.renderActivePage();
            },
            "Ver Meses do Ano"
          );
        });
      });
    } else if (viewMode === 'months') {
      const cards = document.querySelectorAll(".calendar-month-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const m = parseInt(card.getAttribute("data-month"));
          const year = state.calendarState.year;
          const firstDayStr = `${year}-${String(m + 1).padStart(2, '0')}-01`;
          const lastDay = new Date(year, m + 1, 0).getDate();
          const lastDayStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
          
          CalendarPage.showChoiceModal(
            `${monthNames[m]} de ${year}`,
            appInstance,
            firstDayStr,
            () => {
              // Filtrar transações por mês
              state.txFilters = {
                search: '',
                type: 'all',
                account: 'all',
                status: 'all',
                member: 'all',
                showTrash: false,
                startDate: firstDayStr,
                endDate: lastDayStr
              };
              window.location.hash = '#transactions';
            },
            () => {
              // Drill Down para visão de dias
              state.calendarState.month = m;
              state.calendarState.viewMode = 'days';
              appInstance.renderActivePage();
            },
            "Ver Dias do Mês"
          );
        });
      });
    } else {
      // Click event to show choice popup on day box
      const days = document.querySelectorAll(".calendar-day[data-date]");
      days.forEach(dayCell => {
        dayCell.addEventListener("click", (e) => {
          if (e.target.closest(".day-popover")) return;
          const dateStr = dayCell.getAttribute("data-date");
          const parts = dateStr.split('-');
          const formattedTitle = `${parts[2]}/${parts[1]}/${parts[0]}`;
          
          // Re-calculate the day's financial summary dynamically for the Choice Modal
          const activeTxs = app.getActiveTransactions();
          const dayTxs = activeTxs.filter(t => t.date === dateStr);
          let income = 0;
          let expense = 0;
          dayTxs.forEach(t => {
            if (t.amount > 0) income += t.amount;
            else expense += Math.abs(t.amount);
          });
          
          // Calculate daily balance of the specific date
          const dailyBalances = FinancialEngine.calculateDailyBalances(app.accounts, activeTxs, "2026-01-01", dateStr);
          const balance = dailyBalances[dateStr]?.balance || 0;

          const dayDataSummary = {
            income,
            expense,
            balance,
            transactions: dayTxs
          };

          CalendarPage.showChoiceModal(
            formattedTitle,
            appInstance,
            dateStr,
            () => {
              // Filtrar transações por dia
              state.txFilters = {
                search: '',
                type: 'all',
                account: 'all',
                status: 'all',
                member: 'all',
                showTrash: false,
                startDate: dateStr,
                endDate: dateStr
              };
              window.location.hash = '#transactions';
            },
            null,
            "",
            dayDataSummary
          );
        });
      });
    }
  }
}
