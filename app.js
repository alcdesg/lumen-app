// Application Controller - initialized globally via index.html scripts

class ApplicationController {
  constructor() {
    this.storage = new Storage();
    this.app = new LumenApp(this.storage);
    
    // Shared state between views
    this.state = {
      currentTab: 'panel',
      calendarState: {
        year: 2026,
        month: 6 // July (0-indexed)
      },
      txFilters: {
        search: '',
        type: 'all',
        account: 'all',
        status: 'all'
      },
      importState: {
        status: 'idle',
        filename: '',
        fileText: '',
        errors: [],
        transactions: []
      }
    };
  }

  async start() {
    // 1. Initialize DB / local files
    await this.app.init();

    // 2. Setup setup overlay logic
    await this.initSetupScreen();

    // 3. Update dynamic welcome text
    this.updateWelcomeText();

    // 4. Setup global DOM event listeners
    this.setupGlobalEvents();

    // 5. Update OneDrive UI pill indicator
    this.updateOneDriveUI();

    // 5.5 Update Tasks Badge counter
    this.updateTasksBadge();

    // 6. Initial Routing
    this.router();
    window.addEventListener('hashchange', () => this.router());
  }

  async initSetupScreen() {
    const setupScreen = document.getElementById('setup-screen');
    const warningBar = document.getElementById('demo-warning-bar');
    if (!setupScreen) return;

    const hasSaved = await this.storage.hasSavedFolder();
    const activeUser = localStorage.getItem("lumen_active_user");

    if (activeUser) {
      this.selectUserInSetup(activeUser);
    }

    if (this.storage.isOneDriveConnected()) {
      setupScreen.classList.remove('active');
      if (warningBar) warningBar.style.display = 'none';
    } else {
      setupScreen.classList.add('active');
      if (hasSaved) {
        const connectBtn = document.getElementById('setup-connect-btn');
        if (connectBtn) {
          connectBtn.textContent = "Re-autorizar Pasta OneDrive";
          document.getElementById('setup-status-msg').innerHTML = "Pasta anterior detectada. Clique acima para re-autorizar o acesso em um clique.";
          if (activeUser) {
            connectBtn.removeAttribute('disabled');
          }
        }
      }
    }
  }

  selectUserInSetup(username) {
    localStorage.setItem("lumen_active_user", username);
    
    const btnPaula = document.getElementById('btn-user-paula');
    const btnAlcides = document.getElementById('btn-user-alcides');
    const connectBtn = document.getElementById('setup-connect-btn');
    
    if (btnPaula && btnAlcides) {
      if (username === 'Paula') {
        btnPaula.classList.add('selected');
        btnAlcides.classList.remove('selected');
      } else {
        btnPaula.classList.remove('selected');
        btnAlcides.classList.add('selected');
      }
    }
    
    if (connectBtn) {
      connectBtn.removeAttribute('disabled');
      const statusMsg = document.getElementById('setup-status-msg');
      if (statusMsg && !statusMsg.innerHTML.includes("Pasta anterior")) {
        statusMsg.innerHTML = `Pronto! Clique acima para conectar seu OneDrive como <strong>${username}</strong>.`;
      }
    }
  }

  updateWelcomeText() {
    const welcomeEl = document.getElementById('header-user-welcome');
    if (welcomeEl) {
      const activeUser = localStorage.getItem("lumen_active_user");
      if (activeUser) {
        welcomeEl.textContent = `Olá, ${activeUser}!`;
      } else {
        welcomeEl.textContent = this.app.settings ? this.app.settings.couple_names : "Paula & Alcides";
      }
    }
  }

  /**
   * Router to match hash paths to UI pages.
   */
  router() {
    const hash = window.location.hash || '#panel';
    const tabName = hash.substring(1);
    this.state.currentTab = tabName;

    // Highlight active sidebar item
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const activeMenu = document.getElementById(`nav-${tabName}`);
    if (activeMenu) {
      activeMenu.classList.add('active');
    }

    this.renderActivePage();
  }

  /**
   * Renders the page matching the current route hash and binds its specific event handlers.
   */
  renderActivePage() {
    const contentView = document.getElementById('content-view');
    if (!contentView) return;

    let html = '';
    let pageClass = null;

    switch (this.state.currentTab) {
      case 'panel':
        html = PanelPage.render(this.app, this.state);
        pageClass = PanelPage;
        break;
      case 'tasks':
        html = TasksPage.render(this.app, this.state);
        pageClass = TasksPage;
        break;
      case 'calendar':
        html = CalendarPage.render(this.app, this.state);
        pageClass = CalendarPage;
        break;
      case 'transactions':
        html = TransactionsPage.render(this.app, this.state);
        pageClass = TransactionsPage;
        break;
      case 'accounts':
        html = AccountsPage.render(this.app, this.state);
        pageClass = AccountsPage;
        break;
      case 'import':
        html = ImportPage.render(this.app, this.state);
        pageClass = ImportPage;
        break;
      case 'history':
        html = HistoryPage.render(this.app, this.state);
        pageClass = HistoryPage;
        break;
      case 'help':
        html = HelpPage.render(this.app, this.state);
        pageClass = HelpPage;
        break;
      default:
        html = `<div class="empty-state">Página não encontrada.</div>`;
    }

    contentView.innerHTML = html;
    
    // Bind specific events for the active page
    if (pageClass && typeof pageClass.initEvents === 'function') {
      pageClass.initEvents(this.app, this.state, this);
    }
  }

  /**
   * Updates the OneDrive synchronization pill in the sidebar.
   */
  updateOneDriveUI() {
    const pill = document.getElementById('onedrive-sync-pill');
    const connectBtn = document.getElementById('connect-onedrive-btn');
    const statusText = pill.querySelector('.pill-text');

    if (this.storage.isOneDriveConnected()) {
      pill.classList.remove('disconnected');
      pill.classList.add('connected');
      statusText.textContent = 'OneDrive Ativo';
      connectBtn.textContent = 'Desconectar';
      connectBtn.title = 'Desconectar da pasta do OneDrive';
    } else {
      pill.classList.remove('connected');
      pill.classList.add('disconnected');
      statusText.textContent = 'Local (Offline)';
      connectBtn.textContent = 'Conectar';
      connectBtn.title = 'Conectar pasta do OneDrive para backup';
    }
  }

  /**
   * Binds global application shell buttons and modal hooks.
   */
  setupGlobalEvents() {
    // 0. Setup screen user select & connect triggers
    const btnPaula = document.getElementById('btn-user-paula');
    const btnAlcides = document.getElementById('btn-user-alcides');
    const setupConnectBtn = document.getElementById('setup-connect-btn');
    const setupSkipBtn = document.getElementById('setup-skip-btn');

    if (btnPaula) {
      btnPaula.addEventListener('click', () => this.selectUserInSetup('Paula'));
    }
    if (btnAlcides) {
      btnAlcides.addEventListener('click', () => this.selectUserInSetup('Alcides'));
    }
    if (setupConnectBtn) {
      setupConnectBtn.addEventListener('click', async () => {
        try {
          const connected = await this.storage.connectOneDriveFolder();
          if (connected) {
            await this.app.init();
            this.updateWelcomeText();
            this.updateOneDriveUI();
            const setupScreen = document.getElementById('setup-screen');
            if (setupScreen) setupScreen.classList.remove('active');
            const warningBar = document.getElementById('demo-warning-bar');
            if (warningBar) warningBar.style.display = 'none';
            this.renderActivePage();
          }
        } catch (e) {
          alert('Não foi possível conectar a pasta: ' + e.message);
        }
      });
    }
    if (setupSkipBtn) {
      setupSkipBtn.addEventListener('click', () => {
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) setupScreen.classList.remove('active');
        const warningBar = document.getElementById('demo-warning-bar');
        if (warningBar) warningBar.style.display = 'block';
        this.updateWelcomeText();
        this.renderActivePage();
      });
    }

    // 1. OneDrive Connection Button
    const connectBtn = document.getElementById('connect-onedrive-btn');
    connectBtn.addEventListener('click', async () => {
      if (this.storage.isOneDriveConnected()) {
        if (confirm('Deseja desconectar a pasta do OneDrive? O aplicativo voltará a salvar os dados no navegador.')) {
          await this.storage.disconnectOneDriveFolder();
          await this.app.init(); // Reload from localStorage
          this.updateOneDriveUI();
          const warningBar = document.getElementById('demo-warning-bar');
          if (warningBar) warningBar.style.display = 'block';
          this.renderActivePage();
        }
      } else {
        try {
          alert('Selecione a pasta do OneDrive configurada em seu computador.');
          const connected = await this.storage.connectOneDriveFolder();
          if (connected) {
            await this.app.init(); // Reload from files
            this.updateOneDriveUI();
            const warningBar = document.getElementById('demo-warning-bar');
            if (warningBar) warningBar.style.display = 'none';
            this.renderActivePage();
          }
        } catch (e) {
          alert('Não foi possível conectar a pasta: ' + e.message);
        }
      }
    });

    // 2. Quick Add Modal triggers
    const quickAddModal = document.getElementById('quick-add-modal');
    const openQuickAddBtn = document.getElementById('global-add-tx-btn');
    const closeQuickAddBtn = document.getElementById('close-quick-add-btn');
    const cancelQuickAddBtn = document.getElementById('cancel-quick-add-btn');
    const quickAddForm = document.getElementById('quick-add-form');

    openQuickAddBtn.addEventListener('click', () => this.openQuickAddModal());
    closeQuickAddBtn.addEventListener('click', () => quickAddModal.classList.remove('active'));
    cancelQuickAddBtn.addEventListener('click', () => quickAddModal.classList.remove('active'));

    // Form validation submit
    quickAddForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const amountInput = Number(document.getElementById('tx-amount').value);
      const description = document.getElementById('tx-description').value;
      const date = document.getElementById('tx-date').value;
      const status = document.getElementById('tx-status').value;
      const account_id = document.getElementById('tx-account').value;
      const category_id = document.getElementById('tx-category').value;
      const member = document.getElementById('tx-member').value;

      // Positive amount for income, negative for expense
      const amount = this.currentQuickAddType === 'income' ? amountInput : -amountInput;

      try {
        this.app.addTransaction({
          account_id,
          category_id,
          description,
          amount,
          date,
          status,
          member
        });
        
        await this.app.save();
        quickAddModal.classList.remove('active');
        this.renderActivePage(); // Reload current page
      } catch (err) {
        alert(err.message);
      }
    });

    // Toggle income/expense inside modal
    const toggleExpense = document.getElementById('toggle-expense');
    const toggleIncome = document.getElementById('toggle-income');
    
    this.currentQuickAddType = 'expense';

    const setQuickAddType = (type) => {
      this.currentQuickAddType = type;
      if (type === 'expense') {
        toggleExpense.classList.add('active-expense');
        toggleIncome.classList.remove('active-income');
      } else {
        toggleExpense.classList.remove('active-expense');
        toggleIncome.classList.add('active-income');
      }
      this.populateQuickAddCategories(type);
    };

    toggleExpense.addEventListener('click', () => setQuickAddType('expense'));
    toggleIncome.addEventListener('click', () => setQuickAddType('income'));
  }

  /**
   * Opens the Quick Add Modal pre-populating fields.
   * 
   * @param {string} dateStr Optional date format YYYY-MM-DD
   */
  openQuickAddModal(dateStr = '') {
    const quickAddModal = document.getElementById('quick-add-modal');
    const quickAddForm = document.getElementById('quick-add-form');
    
    // Clear and reset form fields
    quickAddForm.reset();
    
    // Default values
    const today = "2026-07-13";
    document.getElementById('tx-date').value = dateStr || today;
    document.getElementById('tx-status').value = (dateStr || today) <= today ? 'confirmed' : 'planned';

    // Populate Account select
    const accSelect = document.getElementById('tx-account');
    let accOptions = '';
    this.app.accounts.filter(a => a.is_active).forEach(acc => {
      accOptions += `<option value="${acc.id}">${acc.name}</option>`;
    });
    accSelect.innerHTML = accOptions;

    // Reset toggle to Expense
    const toggleExpense = document.getElementById('toggle-expense');
    const toggleIncome = document.getElementById('toggle-income');
    this.currentQuickAddType = 'expense';
    toggleExpense.classList.add('active-expense');
    toggleIncome.classList.remove('active-income');

    this.populateQuickAddCategories('expense');

    // Open modal
    quickAddModal.classList.add('active');
    
    // Set focus on amount field
    setTimeout(() => {
      document.getElementById('tx-amount').focus();
    }, 150);
  }

  populateQuickAddCategories(type) {
    const catSelect = document.getElementById('tx-category');
    let catOptions = '';
    this.app.categories
      .filter(c => c.is_active && c.type === type)
      .forEach(c => {
        catOptions += `<option value="${c.id}">${c.name}</option>`;
      });
    catSelect.innerHTML = catOptions;
  }

  updateTasksBadge() {
    const today = "2026-07-13"; // Baseline date
    const pendingCount = this.app.getPendingPlannedTransactions(today).length;
    const badgeEl = document.getElementById("tasks-badge");
    if (badgeEl) {
      if (pendingCount > 0) {
        badgeEl.textContent = pendingCount;
        badgeEl.style.display = "inline-block";
      } else {
        badgeEl.style.display = "none";
      }
    }
  }
}

// Start Controller
const controller = new ApplicationController();
controller.start();
