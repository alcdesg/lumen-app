class SettingsPage {
  static render(app, state) {
    const activeUser = localStorage.getItem("lumen_active_user") || "Casal";
    
    // Load individual user theme preferences (defaulting to dark)
    const themePaula = localStorage.getItem("lumen_theme_Paula") || "dark";
    const themeAlcides = localStorage.getItem("lumen_theme_Alcides") || "dark";
    const themeCasal = localStorage.getItem("lumen_theme_Casal") || "dark";

    return `
      <div class="settings-container animate-fade-in" style="display:flex; flex-direction:column; gap:24px; max-width: 600px; margin: 0 auto; padding: 20px 0;">
        
        <div class="section-card">
          <h3>Configurações do Lumen</h3>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
            Personalize sua experiência no Lumen. Escolha quem está usando a aplicação no momento para que ela se adapte às suas preferências de tema visual.
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
  }
}
