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
        <div class="day-popover">
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

  // Visualização de Meses (Visão Anual com resumos)
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
      const fmtInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(income);
      const fmtExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(expense);
      const fmtNet = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.abs(net));
      
      const netClass = net >= 0 ? 'margin-positive' : 'margin-negative';
      const netSign = net >= 0 ? '+' : '-';
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
          <div class="kpi-subtext" style="text-align:right;">Selecione um mês para ver os detalhes diários.</div>
        </div>

        <div class="calendar-months-grid">
          ${gridHtml}
        </div>
      </div>
    `;
  }

  // Visualização de Anos (Visão Década com resumos)
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

    for (let y = startYear; y <= endYear; y++) {
      const { income, expense } = yearData[y];
      const net = income - expense;
      
      const fmtInc = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(income);
      const fmtExp = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(expense);
      const fmtNet = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.abs(net));
      
      const netClass = net >= 0 ? 'margin-positive' : 'margin-negative';
      const netSign = net >= 0 ? '+' : '-';
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
          <div class="kpi-subtext" style="text-align:right;">Selecione um ano para abrir os meses correspondentes.</div>
        </div>

        <div class="calendar-years-grid">
          ${gridHtml}
        </div>
      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    const prevBtn = document.getElementById("cal-prev-btn");
    const nextBtn = document.getElementById("cal-next-btn");
    const headerTitle = document.getElementById("cal-header-title");

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

    // Set view specific click triggers
    const { viewMode } = state.calendarState;
    if (viewMode === 'years') {
      const cards = document.querySelectorAll(".calendar-year-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const y = parseInt(card.getAttribute("data-year"));
          state.calendarState.year = y;
          state.calendarState.viewMode = 'months';
          appInstance.renderActivePage();
        });
      });
    } else if (viewMode === 'months') {
      const cards = document.querySelectorAll(".calendar-month-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const m = parseInt(card.getAttribute("data-month"));
          state.calendarState.month = m;
          state.calendarState.viewMode = 'days';
          appInstance.renderActivePage();
        });
      });
    } else {
      // Click event to register new transaction on day box
      const days = document.querySelectorAll(".calendar-day[data-date]");
      days.forEach(dayCell => {
        dayCell.addEventListener("click", (e) => {
          if (e.target.closest(".day-popover")) return;
          const dateStr = dayCell.getAttribute("data-date");
          appInstance.openQuickAddModal(dateStr);
        });
      });
    }
  }
}
