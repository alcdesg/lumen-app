class CalendarPage {
  static render(app, state) {
    // 1. Get viewed year and month from state
    if (!state.calendarState) {
      const now = new Date();
      state.calendarState = {
        year: now.getFullYear(),
        month: now.getMonth()
      };
    }
    const { year, month } = state.calendarState;
    const todayStr = new Date().toLocaleDateString('en-CA'); // Dynamic local date

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // 2. Calculate dates for cash flow calculations
    // To ensure the running balance is 100% correct, we calculate from the beginning of time (or 2026-01-01)
    // up to the last day of the viewed month.
    const startCalcDate = "2026-01-01";
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const endCalcDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    
    const activeTxs = app.getActiveTransactions();
    const dailyBalances = FinancialEngine.calculateDailyBalances(app.accounts, activeTxs, startCalcDate, endCalcDate);

    // 3. Prepare calendar grid details
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

      // Currency formatting helpers
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
            <span class="calendar-month-title">${monthNames[month]} de ${year}</span>
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

  static initEvents(app, state, appInstance) {
    const prevBtn = document.getElementById("cal-prev-btn");
    const nextBtn = document.getElementById("cal-next-btn");

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        let { month, year } = state.calendarState;
        if (month === 0) {
          month = 11;
          year -= 1;
        } else {
          month -= 1;
        }
        state.calendarState = { month, year };
        appInstance.renderActivePage(); // Force page refresh
      });

      nextBtn.addEventListener("click", () => {
        let { month, year } = state.calendarState;
        if (month === 11) {
          month = 0;
          year += 1;
        } else {
          month += 1;
        }
        state.calendarState = { month, year };
        appInstance.renderActivePage(); // Force page refresh
      });
    }

    // Add click events to calendar day cells for quick insertion
    const days = document.querySelectorAll(".calendar-day[data-date]");
    days.forEach(dayCell => {
      dayCell.addEventListener("click", (e) => {
        // Prevent trigger if clicking details popover
        if (e.target.closest(".day-popover")) return;
        
        const dateStr = dayCell.getAttribute("data-date");
        // Open the global quick add modal and fill the date field
        appInstance.openQuickAddModal(dateStr);
      });
    });
  }
}
