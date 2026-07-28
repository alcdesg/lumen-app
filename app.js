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

    // 5. Update connection UI indicators
    this.updateSyncUI();

    // 5.5 Update Tasks Badge counter
    this.updateTasksBadge();

    // 5.8 Update Theme Toggle UI
    this.updateThemeUI();

    // 6. Activating Realtime Sync on startup if connected
    this.initializeRealtime();

    // 7. Initial Routing
    await this.router();
    window.addEventListener('hashchange', async () => await this.router());
  }

  async initSetupScreen() {
    const setupScreen = document.getElementById('setup-screen');
    const warningBar = document.getElementById('demo-warning-bar');
    if (!setupScreen) return;

    if (this.storage.isSupabaseConnected()) {
      setupScreen.classList.remove('active');
      if (warningBar) warningBar.style.display = 'none';
      
      // Auto-resolve dynamic user profile name based on email
      const email = localStorage.getItem("lumen_supabase_email") || this.storage.currentUserEmail;
      if (email) {
        let activeUser = "Casal";
        if (email.toLowerCase().trim() === 'neto_gurgel@hotmail.com') activeUser = "Alcides";
        else if (email.toLowerCase().includes('paula')) activeUser = "Paula";
        localStorage.setItem("lumen_active_user", activeUser);
      }
    } else {
      setupScreen.classList.add('active');
      if (warningBar) warningBar.style.display = 'none';

      // Prefill URL and Key inputs if saved or configured via window config
      const savedUrl = (window.LUMEN_CONFIG && window.LUMEN_CONFIG.SUPABASE_URL) || localStorage.getItem("lumen_supabase_url");
      const savedKey = (window.LUMEN_CONFIG && window.LUMEN_CONFIG.SUPABASE_KEY) || localStorage.getItem("lumen_supabase_key");
      const savedEmail = localStorage.getItem("lumen_supabase_email");

      const urlInput = document.getElementById('setup-sb-url');
      const keyInput = document.getElementById('setup-sb-key');
      const emailInput = document.getElementById('setup-sb-email');

      if (urlInput && savedUrl) urlInput.value = savedUrl;
      if (keyInput && savedKey) keyInput.value = savedKey;
      if (emailInput && savedEmail) emailInput.value = savedEmail;
    }
  }

  selectUserInSetup(username) {
    // Stubbed out as user profile is now resolved dynamically via authenticated email
    localStorage.setItem("lumen_active_user", username);
  }

  updateWelcomeText() {
    const welcomeEl = document.getElementById('header-user-welcome');
    if (welcomeEl) {
      const activeUser = localStorage.getItem("lumen_active_user") || "Casal";
      const roleText = this.app.userRole === 'admin' ? 'Administrador' : (this.app.userRole === 'editor' ? 'Editor' : 'Leitor');
      welcomeEl.textContent = `Olá, ${activeUser}! (${roleText})`;
    }
  }

  /**
   * Router to match hash paths to UI pages.
   */
  async router() {
    const hash = window.location.hash || '#panel';
    const tabName = hash.substring(1);
    this.state.currentTab = tabName;

    // Highlight active sidebar item
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const activeMenu = document.getElementById(`nav-${tabName}`);
    if (activeMenu) {
      activeMenu.classList.add('active');
    }

    // "Veracidade imediata dos dados": Busca o estado atualizado do banco em toda navegação de tela
    if (this.storage.isSupabaseConnected()) {
      try {
        await this.app.init();
        this.updateWelcomeText();
      } catch (err) {
        console.warn("Falha ao sincronizar dados na navegação. Usando cache local:", err);
      }
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

    // Toggle global add transaction button visibility based on permissions
    const addBtn = document.getElementById('global-add-tx-btn');
    if (addBtn) {
      if (!this.app.canEdit()) {
        addBtn.style.display = 'none';
      } else {
        addBtn.style.display = 'block';
      }
    }
    
    // Bind specific events for the active page
    if (pageClass && typeof pageClass.initEvents === 'function') {
      pageClass.initEvents(this.app, this.state, this);
    }
  }

  /**
   * Updates the synchronization pills in the sidebar (both OneDrive and Supabase).
   */
  updateSyncUI() {
    const odPill = document.getElementById('onedrive-sync-pill');
    const odConnectBtn = document.getElementById('connect-onedrive-btn');
    const odStatusText = odPill ? odPill.querySelector('.pill-text') : null;

    const sbPill = document.getElementById('supabase-sync-pill');
    const sbConnectBtn = document.getElementById('connect-supabase-sidebar-btn');
    const sbStatusText = sbPill ? sbPill.querySelector('.pill-text') : null;

    const isSbConnected = this.storage.isSupabaseConnected();
    const isOdConnected = this.storage.isOneDriveConnected();

    if (isSbConnected) {
      if (odPill) odPill.style.display = 'none';
      if (sbPill) {
        sbPill.style.display = 'flex';
        sbPill.classList.remove('disconnected');
        sbPill.classList.add('connected');
        if (sbStatusText) sbStatusText.textContent = 'Supabase Ativo';
        if (sbConnectBtn) {
          sbConnectBtn.textContent = 'Desconectar';
          sbConnectBtn.title = 'Desconectar do Supabase Cloud';
        }
      }
    } else {
      if (sbPill) sbPill.style.display = 'none';
      if (odPill) {
        odPill.style.display = 'flex';
        if (isOdConnected) {
          odPill.classList.remove('disconnected');
          odPill.classList.add('connected');
          if (odStatusText) odStatusText.textContent = 'OneDrive Ativo';
          if (odConnectBtn) {
            odConnectBtn.textContent = 'Desconectar';
            odConnectBtn.title = 'Desconectar da pasta do OneDrive';
          }
        } else {
          odPill.classList.remove('connected');
          odPill.classList.add('disconnected');
          if (odStatusText) odStatusText.textContent = 'Local (Offline)';
          if (odConnectBtn) {
            odConnectBtn.textContent = 'Conectar';
            odConnectBtn.title = 'Conectar pasta do OneDrive para backup';
          }
        }
      }
    }

    const logoutBtn = document.getElementById('logout-btn');
    const setupScreen = document.getElementById('setup-screen');
    const isSetupActive = setupScreen && setupScreen.classList.contains('active');
    if (logoutBtn) {
      logoutBtn.style.display = isSetupActive ? 'none' : 'flex';
    }
  }

  /**
   * Binds global application shell buttons and modal hooks.
   */
  setupGlobalEvents() {
    // Mobile Navigation Drawer triggers
    const menuToggleBtn = document.getElementById('mobile-menu-toggle-btn');
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggleBtn && sidebar && overlay) {
      const toggleMenu = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      };

      menuToggleBtn.addEventListener('click', toggleMenu);
      overlay.addEventListener('click', toggleMenu);

      // Auto-close menu drawer when selecting page route links on mobile
      document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
          }
        });
      });
    }

    // 0. Setup screen triggers
    const setupSkipBtn = document.getElementById('setup-skip-btn');
    const apiToggleBtn = document.getElementById('setup-api-toggle-btn');
    const hiddenApiConfig = document.getElementById('saas-hidden-api-config');

    if (apiToggleBtn && hiddenApiConfig) {
      apiToggleBtn.addEventListener('click', () => {
        const isHidden = hiddenApiConfig.style.display === 'none';
        hiddenApiConfig.style.display = isHidden ? 'flex' : 'none';
      });
    }

    if (setupSkipBtn) {
      setupSkipBtn.addEventListener('click', async () => {
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) setupScreen.classList.remove('active');
        const warningBar = document.getElementById('demo-warning-bar');
        if (warningBar) warningBar.style.display = 'block';
        
        // Popula as sementes de teste sob demanda caso o LocalStorage esteja vazio
        const accountsCached = localStorage.getItem("lumen_accounts");
        if (!accountsCached || accountsCached === "[]") {
          this.storage.populateDemoSeedData();
          await this.app.init(); // Recarrega os dados em memória
        }
        
        // Default to Demo mode with guest role
        localStorage.setItem("lumen_active_user", "Casal");
        this.app.userRole = 'viewer';
        
        this.updateWelcomeText();
        this.updateSyncUI();
        this.renderActivePage();
      });
    }

    // 0.5 Supabase setup screen events (Unified Login)
    const setupSbForm = document.getElementById('setup-supabase-form');
    if (setupSbForm) {
      setupSbForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let url = document.getElementById('setup-sb-url').value.trim();
        let key = document.getElementById('setup-sb-key').value.trim();
        const email = document.getElementById('setup-sb-email').value.trim();
        const pass = document.getElementById('setup-sb-pass').value;
        const rememberCheckbox = document.getElementById('setup-sb-remember');
        const remember = rememberCheckbox ? rememberCheckbox.checked : false;

        // Fallback to window config injection, saved parameters or default project keys
        if (!url) url = (window.LUMEN_CONFIG && window.LUMEN_CONFIG.SUPABASE_URL) || localStorage.getItem("lumen_supabase_url") || "https://jmxhhxitjqwjymwwzcvo.supabase.co";
        if (!key) key = (window.LUMEN_CONFIG && window.LUMEN_CONFIG.SUPABASE_KEY) || localStorage.getItem("lumen_supabase_key") || "";

        const submitBtn = setupSbForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Conectando...';
        submitBtn.setAttribute('disabled', 'true');

        try {
          // Connect and authenticate
          await this.storage.loginSupabase(url, key, email, pass, remember);
          localStorage.setItem('lumen_supabase_email', email);

          // Initialize app with Supabase cloud data
          await this.app.init();

          // Ativa escuta em tempo real para o novo usuário
          this.initializeRealtime();

          // Auto-migration check: If Supabase is empty but LocalStorage has data, prompt to migrate
          if (this.app.accounts.length === 0 && this.app.transactions.length === 0) {
            const localData = this.storage.loadFromLocalStorage();
            if (localData.accounts.length > 0 || localData.transactions.length > 0) {
              if (confirm("Seu banco de dados do Supabase parece estar vazio, mas você possui dados locais salvos. Deseja enviar seus dados locais para o Supabase agora?")) {
                await this.storage.migrateLocalDataToSupabase();
                await this.app.init(); // Reload from cloud
              }
            }
          }

          // Hide setup screen
          const setupScreen = document.getElementById('setup-screen');
          if (setupScreen) setupScreen.classList.remove('active');
          const warningBar = document.getElementById('demo-warning-bar');
          if (warningBar) warningBar.style.display = 'none';

          // Resolve dynamic user profile name based on email
          let activeUser = "Casal";
          const emailLower = email.toLowerCase().trim();
          if (emailLower === 'neto_gurgel@hotmail.com' || emailLower === 'alcides@lumen.com.br') activeUser = "Alcides";
          else if (emailLower.includes('paula')) activeUser = "Paula";
          localStorage.setItem("lumen_active_user", activeUser);

          // Update header & pills
          this.updateWelcomeText();
          this.updateSyncUI();
          this.renderActivePage();

          alert('Conectado ao Supabase Cloud com sucesso! Seus dados estão sincronizados.');
        } catch (err) {
          alert('Erro de conexão com o Supabase: ' + err.message);
          submitBtn.textContent = originalText;
          submitBtn.removeAttribute('disabled');
        }
      });
    }

    // 1. OneDrive Connection Button
    const connectBtn = document.getElementById('connect-onedrive-btn');
    connectBtn.addEventListener('click', async () => {
      if (this.storage.isOneDriveConnected()) {
        if (confirm('Deseja desconectar a pasta do OneDrive? O aplicativo voltará a salvar os dados no navegador.')) {
          await this.storage.disconnectOneDriveFolder();
          await this.app.init(); // Reload from localStorage
          this.updateSyncUI();
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
            this.updateSyncUI();
            const warningBar = document.getElementById('demo-warning-bar');
            if (warningBar) warningBar.style.display = 'none';
            this.renderActivePage();
          }
        } catch (e) {
          alert('Não foi possível conectar a pasta: ' + e.message);
        }
      }
    });

    // 1.5 Supabase Sidebar Disconnect Button
    const sbSidebarBtn = document.getElementById('connect-supabase-sidebar-btn');
    if (sbSidebarBtn) {
      sbSidebarBtn.addEventListener('click', async () => {
        if (confirm('Deseja mesmo desconectar do Supabase Cloud? O aplicativo voltará ao modo local offline.')) {
          try {
            await this.storage.logoutSupabase();
            await this.app.init(); // Reload from localStorage
            this.updateSyncUI();
            const warningBar = document.getElementById('demo-warning-bar');
            if (warningBar) warningBar.style.display = 'block';
            this.renderActivePage();
            alert('Desconectado do Supabase Cloud. Voltando ao banco local do navegador.');
          } catch (err) {
            alert('Erro ao desconectar: ' + err.message);
          }
        }
      });
    }

    // 1.8 Logout Button Click Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm("Deseja mesmo sair da sua conta e desconectar do Supabase?")) {
          try {
            await this.storage.logoutSupabase();
            window.location.reload(); // Hard reload to clear state and show login screen
          } catch (err) {
            alert("Erro ao deslogar: " + err.message);
          }
        }
      });
    }

    // 1.9 Manual Sincronizar Button Click Handler
    const syncBtn = document.getElementById('header-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        const icon = syncBtn.querySelector('.sync-icon');
        if (icon) icon.classList.add('spinning');
        syncBtn.setAttribute('disabled', 'true');

        try {
          // Busca o estado consolidado absoluto mais recente na nuvem Supabase
          await this.app.init();
          this.updateWelcomeText();
          this.updateSyncUI();
          this.renderActivePage(); // Re-renderiza a tela atualizada
          console.log("Banco de dados sincronizado com sucesso sob demanda.");
        } catch (err) {
          alert("Não foi possível sincronizar com a nuvem: " + err.message);
        } finally {
          // Pequeno timeout sutil para a animação de rotação parecer fluida
          setTimeout(() => {
            if (icon) icon.classList.remove('spinning');
            syncBtn.removeAttribute('disabled');
          }, 600);
        }
      });
    }

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

    // Quick Add Account Click Handler
    const quickAddNewAccBtn = document.getElementById('quick-add-new-acc-btn');
    if (quickAddNewAccBtn) {
      quickAddNewAccBtn.addEventListener('click', async () => {
        const name = prompt("Criar Nova Conta:\nDigite o nome da conta:");
        if (name && name.trim()) {
          const cleanName = name.trim();
          let acc = this.app.accounts.find(a => a.name.toLowerCase() === cleanName.toLowerCase());
          if (!acc) {
            try {
              acc = this.app.addAccount({ name: cleanName, initial_balance: 0 });
              await this.app.save();
            } catch (err) {
              alert(err.message);
              return;
            }
          }
          // Reload options and auto-select new account
          this.populateQuickAddAccounts();
          const accSelect = document.getElementById('tx-account');
          if (accSelect) {
            accSelect.value = acc.id;
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
    this.populateQuickAddAccounts();

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

  populateQuickAddAccounts() {
    const accSelect = document.getElementById('tx-account');
    if (!accSelect) return;

    let accOptions = '';
    const sortedAccs = [...this.app.accounts]
      .filter(a => a.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));

    sortedAccs.forEach(acc => {
      accOptions += `<option value="${acc.id}">${acc.name}</option>`;
    });
    accSelect.innerHTML = accOptions;
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

  /**
   * Initializes Supabase Realtime DB synchronization and Presence tracking.
   */
  initializeRealtime() {
    if (!this.storage.isSupabaseConnected()) return;

    this.storage.setupRealtimeSync(
      // 1. Mudanças de Banco em Tempo Real (Realtime)
      async (payload) => {
        console.log("App: Atualização detectada no Supabase. Sincronizando views...");
        try {
          await this.app.init(); // Recarrega do Supabase e refiltra as views em memória
          this.updateWelcomeText();
          this.updateSyncUI();
          this.renderActivePage(); // Atualiza a tela atual em tempo real!
        } catch (err) {
          console.error("Falha ao re-sincronizar na escuta Realtime:", err);
        }
      },
      // 2. Mudanças na lista de usuários online (Presence)
      (onlineUsers) => {
        const presenceEl = document.getElementById("header-presence");
        if (!presenceEl) return;

        if (onlineUsers.length > 0) {
          presenceEl.style.display = "inline-flex";
          const names = onlineUsers.map(u => u.name).join(", ");
          presenceEl.innerHTML = `
            <span style="display: inline-block; width: 6px; height: 6px; background-color: var(--color-income); border-radius: 50%; align-self: center; margin-right: 4px; box-shadow: 0 0 8px var(--color-income);"></span>
            Online: ${names}
          `;
        } else {
          presenceEl.style.display = "none";
        }
      }
    );
  }
}

// Start Controller
const controller = new ApplicationController();
window.controller = controller;
controller.start();
