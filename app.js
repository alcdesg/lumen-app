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

    // Initialize Theme preference based on the active user settings
    const activeUser = localStorage.getItem("lumen_active_user") || "Casal";
    const savedTheme = localStorage.getItem(`lumen_theme_${activeUser}`) || localStorage.getItem("lumen_theme") || "dark";
    localStorage.setItem("lumen_theme", savedTheme);
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
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

    // 5.8 Update Theme Toggle UI
    this.updateThemeUI();

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
      case 'ai':
        html = AiPage.render(this.app, this.state);
        pageClass = AiPage;
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
      case 'settings':
        html = SettingsPage.render(this.app, this.state);
        pageClass = SettingsPage;
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

    // Theme Toggle Click Handler
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        const theme = isLight ? 'light' : 'dark';
        const activeUser = localStorage.getItem("lumen_active_user") || "Casal";
        localStorage.setItem('lumen_theme', theme);
        localStorage.setItem(`lumen_theme_${activeUser}`, theme);
        this.updateThemeUI();
      });
    }

    // Quick Add Category Click Handler
    const quickAddNewCatBtn = document.getElementById('quick-add-new-cat-btn');
    if (quickAddNewCatBtn) {
      quickAddNewCatBtn.addEventListener('click', async () => {
        const type = this.currentQuickAddType || 'expense';
        const labelType = type === 'income' ? 'Receita' : 'Despesa';
        const name = prompt(`Criar Nova Categoria de ${labelType}:\nDigite o nome da categoria:`);
        if (name && name.trim()) {
          const cleanName = name.trim();
          let cat = this.app.categories.find(c => c.name.toLowerCase() === cleanName.toLowerCase() && c.type === type);
          if (!cat) {
            try {
              cat = this.app.addCategory({ name: cleanName, type });
              await this.app.save();
            } catch (err) {
              alert(err.message);
              return;
            }
          }
          // Reload options and auto-select new category
          this.populateQuickAddCategories(type);
          const catSelect = document.getElementById('tx-category');
          if (catSelect) {
            catSelect.value = cat.id;
          }
        }
      });
    }
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
    const today = new Date().toLocaleDateString('en-CA');
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
    if (!catSelect) return;
    
    let catOptions = '';
    const sortedCats = [...this.app.categories]
      .filter(c => c.is_active && c.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));

    sortedCats.forEach(c => {
      catOptions += `<option value="${c.id}">${c.name}</option>`;
    });
    catSelect.innerHTML = catOptions;
  }

  updateTasksBadge() {
    const today = new Date().toLocaleDateString('en-CA');
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

  updateThemeUI() {
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    if (!themeIcon || !themeText) return;

    const isLight = document.body.classList.contains("light-theme");
    
    if (isLight) {
      themeText.textContent = "Modo Escuro";
      // Moon Icon path
      themeIcon.innerHTML = `<path d="M12.3 22h-.1c-5.4 0-10-4.6-10-10 0-4.3 2.9-8.1 7.1-9.2.6-.2 1.3.3 1.2 1-.2 1.4.1 2.9.8 4.1 1.2 2.2 3.4 3.7 5.9 3.9.7.1 1.1.8.8 1.4-1.2 3.8-4.9 6.8-8.8 6.8z" fill="currentColor"/>`;
    } else {
      themeText.textContent = "Modo Claro";
      // Sun Icon path
      themeIcon.innerHTML = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zm-12.37 12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41z" fill="currentColor"/>`;
    }
  }
}

// Start Controller
const controller = new ApplicationController();
controller.start();
