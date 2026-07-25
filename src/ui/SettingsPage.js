class SettingsPage {
  static render(app, state) {
    const activeUser = localStorage.getItem("lumen_active_user") || "Casal";
    
    // Load individual user theme preferences (defaulting to dark)
    const themePaula = localStorage.getItem("lumen_theme_Paula") || "dark";
    const themeAlcides = localStorage.getItem("lumen_theme_Alcides") || "dark";
    const themeCasal = localStorage.getItem("lumen_theme_Casal") || "dark";

    const isSbConnected = app.storage.isSupabaseConnected();
    const sbUrl = localStorage.getItem("lumen_supabase_url") || "";
    const sbKey = localStorage.getItem("lumen_supabase_key") || "";
    const sbEmail = localStorage.getItem("lumen_supabase_email") || "";

    return `
      <div class="settings-container animate-fade-in" style="display:flex; flex-direction:column; gap:24px; max-width: 600px; margin: 0 auto; padding: 20px 0;">
        
        <div class="section-card">
          <h3>Configurações do Lumen</h3>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
            Personalize sua experiência no Lumen. Escolha quem está usando a aplicação no momento para que ela se adapte às suas preferências de tema visual e configure sua nuvem.
          </p>
        </div>

        <!-- Membro Ativo Card -->
        <div class="section-card" style="padding: 24px;">
          <h4 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary);">Membro Ativo</h4>
          
          <div style="display: flex; gap: 16px;">
            <button class="settings-user-btn ${activeUser === 'Paula' ? 'active' : ''}" data-user="Paula" style="flex: 1; padding: 20px; border-radius: 8px; border: 2px solid ${activeUser === 'Paula' ? 'var(--accent-secondary)' : 'var(--border-color)'}; background: ${activeUser === 'Paula' ? 'rgba(var(--accent-secondary-rgb, 100, 180, 240), 0.08)' : 'var(--bg-card)'}; color: var(--text-main); font-weight: 600; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: hsl(320, 80%, 60%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">P</div>
              Paula
            </button>
            <button class="settings-user-btn ${activeUser === 'Alcides' ? 'active' : ''}" data-user="Alcides" style="flex: 1; padding: 20px; border-radius: 8px; border: 2px solid ${activeUser === 'Alcides' ? 'var(--accent-secondary)' : 'var(--border-color)'}; background: ${activeUser === 'Alcides' ? 'rgba(var(--accent-secondary-rgb, 100, 180, 240), 0.08)' : 'var(--bg-card)'}; color: var(--text-main); font-weight: 600; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: hsl(200, 85%, 55%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">A</div>
              Alcides
            </button>
            <button class="settings-user-btn ${activeUser === 'Casal' ? 'active' : ''}" data-user="Casal" style="flex: 1; padding: 20px; border-radius: 8px; border: 2px solid ${activeUser === 'Casal' ? 'var(--accent-secondary)' : 'var(--border-color)'}; background: ${activeUser === 'Casal' ? 'rgba(var(--accent-secondary-rgb, 100, 180, 240), 0.08)' : 'var(--bg-card)'}; color: var(--text-main); font-weight: 600; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--text-muted); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">C</div>
              Casal
            </button>
          </div>
        </div>

        <!-- Preferências de Tema Card -->
        <div class="section-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary);">Preferências de Tema Visual</h4>
          
          <!-- Tema Paula -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <span style="font-weight: 600;">Preferência da Paula</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn theme-pref-btn ${themePaula === 'light' ? 'btn-primary' : 'btn-secondary'}" data-user="Paula" data-theme="light" style="padding: 6px 12px; font-size: 12px;">Claro</button>
              <button class="btn theme-pref-btn ${themePaula === 'dark' ? 'btn-primary' : 'btn-secondary'}" data-user="Paula" data-theme="dark" style="padding: 6px 12px; font-size: 12px;">Escuro</button>
            </div>
          </div>

          <!-- Tema Alcides -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <span style="font-weight: 600;">Preferência do Alcides</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn theme-pref-btn ${themeAlcides === 'light' ? 'btn-primary' : 'btn-secondary'}" data-user="Alcides" data-theme="light" style="padding: 6px 12px; font-size: 12px;">Claro</button>
              <button class="btn theme-pref-btn ${themeAlcides === 'dark' ? 'btn-primary' : 'btn-secondary'}" data-user="Alcides" data-theme="dark" style="padding: 6px 12px; font-size: 12px;">Escuro</button>
            </div>
          </div>

          <!-- Tema Casal -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">Preferência do Casal (Geral)</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn theme-pref-btn ${themeCasal === 'light' ? 'btn-primary' : 'btn-secondary'}" data-user="Casal" data-theme="light" style="padding: 6px 12px; font-size: 12px;">Claro</button>
              <button class="btn theme-pref-btn ${themeCasal === 'dark' ? 'btn-primary' : 'btn-secondary'}" data-user="Casal" data-theme="dark" style="padding: 6px 12px; font-size: 12px;">Escuro</button>
            </div>
          </div>
        </div>

        <!-- Supabase Cloud Card -->
        <div class="section-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between;">
            <span>Sincronização Supabase Cloud</span>
            <span style="font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: bold; background: ${isSbConnected ? 'var(--color-income-bg)' : 'var(--color-expense-bg)'}; color: ${isSbConnected ? 'var(--color-income)' : 'var(--color-expense)'};">
              ${isSbConnected ? 'Conectado (Nuvem Ativa)' : 'Desconectado (Modo Local)'}
            </span>
          </h4>

          ${isSbConnected ? `
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div><strong>URL do Projeto:</strong> <span style="font-family: monospace; color: var(--text-main); word-break: break-all;">${sbUrl}</span></div>
              <div><strong>E-mail Autenticado:</strong> <span style="font-family: monospace; color: var(--text-main);">${sbEmail}</span></div>
            </div>
            <div style="display: flex; gap: 12px;">
              <button class="btn btn-primary" id="btn-supabase-migrate" style="flex: 1; padding: 10px; font-size: 12px;">
                Exportar Dados Locais para Nuvem
              </button>
              <button class="btn btn-secondary" id="btn-supabase-disconnect" style="padding: 10px; font-size: 12px; border-color: var(--color-expense); color: var(--color-expense);">
                Desconectar Nuvem
              </button>
            </div>
          ` : `
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
              Conecte-se ao seu projeto do Supabase para manter seus dados financeiros sincronizados em tempo real na nuvem para você e seu cônjuge.
            </p>
            <form id="supabase-settings-form" style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="sb-settings-url" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Supabase URL</label>
                <input type="url" id="sb-settings-url" value="${sbUrl}" placeholder="https://your-project.supabase.co" required style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="sb-settings-key" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Supabase Anon Key</label>
                <input type="password" id="sb-settings-key" value="${sbKey}" placeholder="eyJhbGciOi..." required style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="sb-settings-email" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">E-mail do Casal</label>
                <input type="email" id="sb-settings-email" value="${sbEmail}" placeholder="casal@exemplo.com" required style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="sb-settings-pass" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Senha</label>
                <input type="password" id="sb-settings-pass" placeholder="******" required style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 13px; font-weight: 600; margin-top: 4px;">
                Conectar e Carregar Dados do Banco
              </button>
            </form>
          `}
        </div>

      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    // 1. Handle Active User Change
    const userButtons = document.querySelectorAll(".settings-user-btn");
    userButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const selectedUser = e.currentTarget.getAttribute("data-user");
        localStorage.setItem("lumen_active_user", selectedUser);
        
        // Load the chosen user's theme preference and apply it
        const theme = localStorage.getItem(`lumen_theme_${selectedUser}`) || "dark";
        localStorage.setItem("lumen_theme", theme);
        
        if (theme === "light") {
          document.body.classList.add("light-theme");
        } else {
          document.body.classList.remove("light-theme");
        }

        // Update welcome tags and UI
        appInstance.updateWelcomeText();
        appInstance.updateThemeUI();
        appInstance.renderActivePage(); // Reload settings page
      });
    });

    // 2. Handle Theme Preference Change
    const themeButtons = document.querySelectorAll(".theme-pref-btn");
    themeButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const user = e.currentTarget.getAttribute("data-user");
        const theme = e.currentTarget.getAttribute("data-theme");
        
        localStorage.setItem(`lumen_theme_${user}`, theme);

        // If the edited user is the currently active user, apply the theme immediately
        const activeUser = localStorage.getItem("lumen_active_user") || "Casal";
        if (user === activeUser) {
          localStorage.setItem("lumen_theme", theme);
          if (theme === "light") {
            document.body.classList.add("light-theme");
          } else {
            document.body.classList.remove("light-theme");
          }
          appInstance.updateThemeUI();
        }

        appInstance.renderActivePage(); // Refresh UI to toggle button highlights
      });
    });

    // 3. Handle Supabase Connection Form Submit
    const sbForm = document.getElementById("supabase-settings-form");
    if (sbForm) {
      sbForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = document.getElementById("sb-settings-url").value.trim();
        const key = document.getElementById("sb-settings-key").value.trim();
        const email = document.getElementById("sb-settings-email").value.trim();
        const pass = document.getElementById("sb-settings-pass").value;

        const btn = sbForm.querySelector("button[type='submit']");
        const originalText = btn.textContent;
        btn.textContent = "Conectando...";
        btn.setAttribute("disabled", "true");

        try {
          // Log into Supabase
          await appInstance.storage.loginSupabase(url, key, email, pass);
          localStorage.setItem("lumen_supabase_email", email);

           // Force load of fresh database records from Cloud
          await app.init();

          // Auto-migration check: If Supabase is empty but LocalStorage has data, prompt to migrate
          if (app.accounts.length === 0 && app.transactions.length === 0) {
            const localData = appInstance.storage.loadFromLocalStorage();
            if (localData.accounts.length > 0 || localData.transactions.length > 0) {
              if (confirm("Seu banco de dados do Supabase parece estar vazio, mas você possui dados locais salvos. Deseja enviar seus dados locais para o Supabase agora?")) {
                await appInstance.storage.migrateLocalDataToSupabase();
                await app.init(); // Reload from cloud
              }
            }
          }

          // Refresh application headers
          appInstance.updateWelcomeText();
          appInstance.updateSyncUI();

          // Display Supabase sync pill in sidebar and hide OneDrive
          const sbPill = document.getElementById("supabase-sync-pill");
          const odPill = document.getElementById("onedrive-sync-pill");
          if (sbPill) {
            sbPill.style.display = "flex";
            sbPill.classList.remove("disconnected");
            sbPill.classList.add("connected");
            if (sbPill.querySelector(".pill-text")) sbPill.querySelector(".pill-text").textContent = "Supabase Ativo";
          }
          if (odPill) odPill.style.display = "none";

          alert("Conectado ao Supabase Cloud com sucesso! Seus dados estão sincronizados.");
          appInstance.renderActivePage();
        } catch (err) {
          alert("Erro de conexão com o Supabase: " + err.message);
          btn.textContent = originalText;
          btn.removeAttribute("disabled");
        }
      });
    }

    // 4. Handle Supabase Disconnect Click
    const btnDisconnect = document.getElementById("btn-supabase-disconnect");
    if (btnDisconnect) {
      btnDisconnect.addEventListener("click", async () => {
        if (confirm("Deseja mesmo desconectar do Supabase Cloud? O aplicativo voltará ao modo local offline.")) {
          try {
            await appInstance.storage.logoutSupabase();
            
            // Reinitialize local state from LocalStorage
            await app.init();

            // Adjust sidebar pills
            const sbPill = document.getElementById("supabase-sync-pill");
            const odPill = document.getElementById("onedrive-sync-pill");
            if (sbPill) sbPill.style.display = "none";
            if (odPill) odPill.style.display = "flex";

            appInstance.updateWelcomeText();
            appInstance.updateSyncUI();

            alert("Desconectado do Supabase Cloud. Voltando ao banco local do navegador.");
            appInstance.renderActivePage();
          } catch (err) {
            alert("Erro ao desconectar: " + err.message);
          }
        }
      });
    }

    // 5. Handle Supabase Migration (push local storage -> cloud)
    const btnMigrate = document.getElementById("btn-supabase-migrate");
    if (btnMigrate) {
      btnMigrate.addEventListener("click", async () => {
        if (confirm("Isso enviará todos os seus dados locais atuais (contas, categorias, transações) para o Supabase, sobrescrevendo itens com o mesmo ID na nuvem. Deseja prosseguir?")) {
          const originalText = btnMigrate.textContent;
          btnMigrate.textContent = "Sincronizando...";
          btnMigrate.setAttribute("disabled", "true");
          try {
            await appInstance.storage.migrateLocalDataToSupabase();
            alert("Migração concluída! Todos os dados locais atuais foram copiados para o Supabase Cloud.");
            appInstance.renderActivePage();
          } catch (err) {
            alert("Falha ao exportar dados: " + err.message);
            btnMigrate.textContent = originalText;
            btnMigrate.removeAttribute("disabled");
          }
        }
      });
    }
  }
}
