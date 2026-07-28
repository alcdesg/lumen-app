class SettingsPage {
  static render(app, state) {
    try {
      const activeUser = sessionStorage.getItem("lumen_active_user") || "Casal";
      
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

        <!-- JSON Backup Import Card -->
        <div class="section-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary);">
            Importar Banco de Dados Local (JSON)
          </h4>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            Se você possui arquivos de dados locais (como <code>transactions.json</code>, <code>accounts.json</code>, etc.) na pasta do seu computador, selecione-os abaixo para restaurar seu histórico no aplicativo e sincronizar na nuvem.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span><strong>Contas (accounts.json):</strong></span>
              <input type="file" id="json-import-accounts" accept=".json" style="max-width: 220px; font-size: 11px;">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span><strong>Categorias (categories.json):</strong></span>
              <input type="file" id="json-import-categories" accept=".json" style="max-width: 220px; font-size: 11px;">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span><strong>Transações (transactions.json):</strong></span>
              <input type="file" id="json-import-transactions" accept=".json" style="max-width: 220px; font-size: 11px;">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <span><strong>Lotes (batches.json):</strong></span>
              <input type="file" id="json-import-batches" accept=".json" style="max-width: 220px; font-size: 11px;">
            </div>
          </div>
          <button type="button" class="btn btn-primary" id="btn-json-import-submit" style="width: 100%; padding: 10px; font-size: 13px; font-weight: 600; margin-top: 4px;">
            Carregar e Salvar no Sistema
          </button>
        </div>

        <!-- Access Control / UAC Settings Card -->
        <div class="section-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between;">
            <span>Controle de Acesso & UAC</span>
            <span style="font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: bold; background: var(--accent-primary); color: white;">
              Segurança Ativa
            </span>
          </h4>
          
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            Defina a senha mestra utilizada pelo Controle de Contas (UAC) para autorizar ações restritas e gerencie perfis de acesso de convidados.
          </p>
          
          <form id="settings-uac-config-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label for="settings-uac-master-pass" style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Senha Mestra do Administrador (UAC)</label>
              <input type="password" id="settings-uac-master-pass" value="${app.settings.admin_master_password || 'admin123'}" required style="padding: 8px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px; font-family: inherit;">
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Mapeamento de Perfis de Acesso</label>
              <div id="uac-roles-list" style="display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="font-family: monospace; color: var(--text-muted);">alcides@lumen.com.br</span>
                  <span class="badge" style="background: var(--color-income-bg); color: var(--color-income);">Administrador Master</span>
                </div>
                ${Object.entries(app.settings.user_roles || {}).map(([email, role]) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; padding-top: 4px;">
                    <span style="font-family: monospace;">${email}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="badge" style="background: ${role === 'editor' ? 'var(--color-warning-bg)' : 'rgba(255,255,255,0.05)'}; color: ${role === 'editor' ? 'var(--color-warning)' : 'var(--text-muted)'};">${role === 'editor' ? 'Editor' : 'Leitor'}</span>
                      <button type="button" class="remove-role-btn btn" data-email="${email}" style="padding: 2px 6px; font-size: 10px; border-color: var(--color-expense); color: var(--color-expense); height: auto; cursor: pointer;">Excluir</button>
                    </div>
                  </div>
                `).join("")}
                
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <input type="email" id="new-role-email" placeholder="email@exemplo.com" style="flex: 1; padding: 6px; font-size: 11px; background: var(--bg-base); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
                  <select id="new-role-select" style="padding: 6px; font-size: 11px; background: var(--bg-base); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
                    <option value="editor">Editor</option>
                    <option value="viewer">Leitor</option>
                  </select>
                  <button type="button" id="add-role-mapping-btn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px; height: auto; cursor: pointer;">Adicionar</button>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="padding: 10px; font-size: 13px; font-weight: 600; border-radius: 6px; margin-top: 4px; cursor: pointer;">
              Salvar Configurações UAC
            </button>
          </form>
        </div>

        <!-- Cadastro de Novos Usuários Card (Apenas Admin) -->
        ${app.userRole === 'admin' ? `
          <div class="section-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary);">
              Cadastrar Novo Usuário na Nuvem
            </h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
              Cadastre uma nova credencial no Supabase para permitir o acesso de outro membro ou leitor da família.
            </p>
            <form id="settings-signup-form" style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="signup-email" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">E-mail do Usuário</label>
                <input type="email" id="signup-email" placeholder="usuario@lumen.com" required style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="signup-password" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Senha Provisória</label>
                <input type="password" id="signup-password" placeholder="Mínimo 6 caracteres" required style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label for="signup-role" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Nível de Acesso (UAC)</label>
                <select id="signup-role" style="padding: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; font-family: inherit;">
                  <option value="editor">Editor (Pode inserir e editar dados)</option>
                  <option value="viewer">Leitor (Apenas visualização)</option>
                  <option value="admin">Administrador (Acesso completo e UAC)</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 13px; font-weight: 600; margin-top: 4px; cursor: pointer;">
                Criar Usuário na Nuvem
              </button>
            </form>
          </div>

          <!-- Usuários Cadastrados na Nuvem Card (Apenas Admin) -->
          <div class="section-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--text-secondary);">
              Usuários Cadastrados na Nuvem
            </h4>
            
            ${!state.usersListLoaded ? `
              <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 12px 0;">
                Carregando usuários da nuvem...
              </div>
            ` : `
              <div style="overflow-x: auto; width: 100%;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-weight: 600;">
                      <th style="padding: 8px 4px;">E-mail</th>
                      <th style="padding: 8px 4px;">Perfil</th>
                      <th style="padding: 8px 4px;">Último Acesso</th>
                      <th style="padding: 8px 4px; text-align: right;">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(state.usersList || []).map(u => {
                      const emailTrim = u.email ? u.email.toLowerCase().trim() : '';
                      const role = emailTrim === 'neto_gurgel@hotmail.com' || emailTrim === 'alcides@lumen.com.br'
                        ? 'admin'
                        : (app.settings.user_roles || {})[emailTrim] || 'viewer';
                      
                      const roleLabel = role === 'admin' ? 'Administrador' : (role === 'editor' ? 'Editor' : 'Leitor');
                      const roleColor = role === 'admin' ? 'var(--color-income)' : (role === 'editor' ? 'var(--color-warning)' : 'var(--text-muted)');
                      
                      const lastLogin = u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca acessou';
                      const isMaster = emailTrim === 'alcides@lumen.com.br' || emailTrim === 'neto_gurgel@hotmail.com';
                      
                      return `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                          <td style="padding: 10px 4px; font-family: monospace; word-break: break-all;">${u.email}</td>
                          <td style="padding: 10px 4px; font-weight: 600; color: ${roleColor};">${roleLabel}</td>
                          <td style="padding: 10px 4px; color: var(--text-secondary);">${lastLogin}</td>
                          <td style="padding: 10px 4px; text-align: right;">
                            ${isMaster ? `
                              <span style="font-size: 10px; color: var(--text-muted); font-style: italic;">Master</span>
                            ` : `
                              <button type="button" class="btn btn-delete delete-cloud-user-btn" data-user-id="${u.id}" data-user-email="${u.email}" style="padding: 4px 8px; font-size: 10px; border-color: var(--color-expense); color: var(--color-expense); height: auto; cursor: pointer;">Excluir</button>
                            `}
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        ` : ''}

        <!-- Zona de Perigo Card -->
        <div class="section-card" style="padding: 24px; border: 1px solid var(--color-expense-bg); background-color: hsla(0, 85%, 60%, 0.03); display: flex; flex-direction: column; gap: 16px;">
          <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; color: var(--color-expense);">
            Zona de Perigo
          </h4>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            Desejam começar a usar o Lumen com seus dados reais? 
            Clique no botão abaixo para apagar permanentemente todas as contas, categorias, transações e histórico do navegador, do OneDrive e da nuvem do Supabase para iniciar do zero. Esta operação não pode ser desfeita!
          </p>
          <button type="button" id="reset-database-btn" class="btn btn-danger" style="font-weight: 600; width: 100%; padding: 10px; font-size: 13px;">
            Resetar Banco de Dados
          </button>
        </div>

      </div>
    `;
    } catch (e) {
      console.error("Erro ao renderizar SettingsPage:", e);
      return `
        <div class="settings-container animate-fade-in" style="padding: 20px 0; max-width: 600px; margin: 0 auto;">
          <div class="section-card" style="border: 1px solid var(--color-expense-bg); background: hsla(0, 85%, 60%, 0.05);">
            <h3 style="color: var(--color-expense);">⚠️ Falha ao Carregar Configurações</h3>
            <p style="font-size: 13px; line-height: 1.5; color: var(--text-secondary); margin-top: 8px;">
              Ocorreu um erro ao renderizar as configurações: <code>${e.message}</code>
            </p>
            <button class="btn btn-secondary" onclick="window.location.reload()" style="margin-top: 12px; font-size: 12px;">Recarregar Aplicativo</button>
          </div>
        </div>
      `;
    }
  }

  static initEvents(app, state, appInstance) {
    // 1. Handle Active User Change
    const userButtons = document.querySelectorAll(".settings-user-btn");
    userButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const selectedUser = e.currentTarget.getAttribute("data-user");
        sessionStorage.setItem("lumen_active_user", selectedUser);
        
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
        const activeUser = sessionStorage.getItem("lumen_active_user") || "Casal";
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
      sbForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const url = document.getElementById("sb-settings-url").value.trim();
        const key = document.getElementById("sb-settings-key").value.trim();
        const email = document.getElementById("sb-settings-email").value.trim();
        const pass = document.getElementById("sb-settings-pass").value;

        app.requestAdminAuthorization("Conectar ao Supabase Cloud", async () => {
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
      });
    }

    // 4. Handle Supabase Disconnect Click
    const btnDisconnect = document.getElementById("btn-supabase-disconnect");
    if (btnDisconnect) {
      btnDisconnect.addEventListener("click", () => {
        app.requestAdminAuthorization("Desconectar do Supabase Cloud", async () => {
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
      });
    }

    // 5. Handle Supabase Migration (push local storage -> cloud)
    const btnMigrate = document.getElementById("btn-supabase-migrate");
    if (btnMigrate) {
      btnMigrate.addEventListener("click", () => {
        app.requestAdminAuthorization("Exportar Dados Locais para Nuvem", async () => {
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
      });
    }

    // 5.5 Handle JSON Backup Import
    const btnJsonImport = document.getElementById("btn-json-import-submit");
    if (btnJsonImport) {
      btnJsonImport.addEventListener("click", () => {
        app.requestAdminAuthorization("Importar Banco de Dados JSON", async () => {
          const fileAcc = document.getElementById("json-import-accounts").files[0];
          const fileCat = document.getElementById("json-import-categories").files[0];
          const fileTx = document.getElementById("json-import-transactions").files[0];
          const fileBat = document.getElementById("json-import-batches").files[0];

          if (!fileAcc && !fileCat && !fileTx && !fileBat) {
            alert("Selecione pelo menos um arquivo de backup (.json) para importar.");
            return;
          }

          const originalText = btnJsonImport.textContent;
          btnJsonImport.textContent = "Processando...";
          btnJsonImport.setAttribute("disabled", "true");

          try {
            const readJsonFile = (file) => {
              return new Promise((resolve, reject) => {
                if (!file) { resolve(null); return; }
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    resolve(JSON.parse(e.target.result));
                  } catch (err) {
                    reject(new Error(`Erro ao ler o arquivo ${file.name}: ${err.message}`));
                  }
                };
                reader.onerror = () => reject(new Error(`Falha ao ler o arquivo ${file.name}`));
                reader.readAsText(file);
              });
            };

            const [accounts, categories, transactions, batches] = await Promise.all([
              readJsonFile(fileAcc),
              readJsonFile(fileCat),
              readJsonFile(fileTx),
              readJsonFile(fileBat)
            ]);

            // Merge with existing state if some files were not selected
            const currentData = appInstance.storage.loadFromLocalStorage();
            const dataToSave = {
              accounts: accounts || currentData.accounts,
              categories: categories || currentData.categories,
              transactions: transactions || currentData.transactions,
              batches: batches || currentData.batches,
              settings: currentData.settings
            };

            // Save to LocalStorage and Cloud (if connected)
            await appInstance.storage.saveData(dataToSave);
            
            // Reinitialize application memory state
            await app.init();
            
            alert("Backup importado e sincronizado com sucesso!");
            appInstance.renderActivePage();
          } catch (err) {
            alert("Falha na importação: " + err.message);
            btnJsonImport.textContent = originalText;
            btnJsonImport.removeAttribute("disabled");
          }
        });
      });
    }

    // 6. Handle UAC Settings Form Submit
    const uacForm = document.getElementById("settings-uac-config-form");
    if (uacForm) {
      uacForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newPass = document.getElementById("settings-uac-master-pass").value;

        // Intercept with Windows UAC authorization if not master admin
        app.requestAdminAuthorization("Salvar Configurações UAC", async () => {
          try {
            app.settings.admin_master_password = newPass;
            await app.save();
            alert("Senha mestra do UAC alterada com sucesso!");
            appInstance.renderActivePage();
          } catch (err) {
            alert("Erro ao salvar senha mestra: " + err.message);
          }
        });
      });
    }

    // 7. Handle Add Access Control Mapping
    const addRoleBtn = document.getElementById("add-role-mapping-btn");
    if (addRoleBtn) {
      addRoleBtn.addEventListener("click", () => {
        const emailInput = document.getElementById("new-role-email");
        const selectRole = document.getElementById("new-role-select");
        const email = emailInput.value.trim().toLowerCase();

        if (!email) {
          alert("Por favor, digite um e-mail válido.");
          return;
        }

        // Intercept with Windows UAC authorization if not master admin
        app.requestAdminAuthorization("Adicionar Usuário ao Controle de Acesso", async () => {
          try {
            if (!app.settings.user_roles) app.settings.user_roles = {};
            app.settings.user_roles[email] = selectRole.value;
            await app.save();
            alert(`Perfil de acesso para ${email} adicionado com sucesso!`);
            appInstance.renderActivePage();
          } catch (err) {
            alert("Erro ao adicionar perfil: " + err.message);
          }
        });
      });
    }

    // 8. Handle Remove Access Control Mapping
    const removeRoleBtns = document.querySelectorAll(".remove-role-btn");
    removeRoleBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const email = e.currentTarget.getAttribute("data-email");

        // Intercept with Windows UAC authorization if not master admin
        app.requestAdminAuthorization("Remover Usuário do Controle de Acesso", async () => {
          try {
            if (app.settings.user_roles && app.settings.user_roles[email]) {
              delete app.settings.user_roles[email];
              await app.save();
              alert(`Perfil de acesso para ${email} removido.`);
              appInstance.renderActivePage();
            }
          } catch (err) {
            alert("Erro ao excluir perfil: " + err.message);
          }
        });
      });
    });

    // 9. Handle Reset Database
    const resetBtn = document.getElementById("reset-database-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        app.requestAdminAuthorization("Redefinir Banco de Dados (Reset Geral)", async () => {
          if (confirm("ATENÇÃO: Você tem certeza de que deseja redefinir o banco de dados?\n\nEsta ação apagará todas as contas, transações e categorias atuais do navegador, do OneDrive e do Supabase para iniciar do zero. Essa operação não pode ser desfeita!")) {
            if (confirm("Confirmação final: Deseja realmente zerar o banco de dados?")) {
              try {
                await app.storage.clearDatabase();
                await app.init(); // Reload app state from clean DB
                appInstance.updateWelcomeText();
                alert("Banco de dados redefinido com sucesso! O aplicativo agora está limpo para seus lançamentos reais.");
                window.location.hash = "#help"; // Redirect to Help tutorial!
              } catch (err) {
                alert(err.message);
              }
            }
          }
        });
      });
    }

    // User list lazy loader (Admin Only)
    if (app.userRole === 'admin' && app.storage.isSupabaseConnected() && !state.usersListLoaded) {
      state.usersList = [];
      app.storage.getUsersList().then(users => {
        state.usersList = users;
        state.usersListLoaded = true;
        appInstance.renderActivePage();
      }).catch(err => {
        console.error("Falha ao ler lista de usuários do Supabase:", err);
        state.usersListLoaded = true; // Define true para evitar loops de erro
      });
    }

    // 10. Handle Signup Form Submit (Create New User)
    const signupForm = document.getElementById("settings-signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value.trim().toLowerCase();
        const password = document.getElementById("signup-password").value;
        const role = document.getElementById("signup-role").value;

        if (!email || password.length < 6) {
          alert("Por favor, digite um e-mail válido e uma senha com no mínimo 6 caracteres.");
          return;
        }

        app.requestAdminAuthorization("Cadastrar Novo Usuário na Nuvem", async () => {
          const submitBtn = signupForm.querySelector("button[type='submit']");
          const originalText = submitBtn.textContent;
          submitBtn.textContent = "Processando...";
          submitBtn.setAttribute("disabled", "true");

          try {
            // 1. Sign up credential in Supabase Auth
            await app.storage.signUpUser(email, password);

            // 2. Map user role in settings
            if (!app.settings.user_roles) app.settings.user_roles = {};
            app.settings.user_roles[email] = role;
            await app.save();

            alert(`Usuário ${email} cadastrado com sucesso na nuvem com papel de ${role === 'admin' ? 'Administrador' : (role === 'editor' ? 'Editor' : 'Leitor')}!`);
            
            // Clean inputs and reload list
            signupForm.reset();
            state.usersListLoaded = false; // Força recarregar lista
            appInstance.renderActivePage();
          } catch (err) {
            alert("Falha ao cadastrar usuário na nuvem: " + err.message);
          } finally {
            submitBtn.textContent = originalText;
            submitBtn.removeAttribute("disabled");
          }
        });
      });
    }

    // Handle Delete User Click
    const deleteUserBtns = document.querySelectorAll(".delete-cloud-user-btn");
    deleteUserBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const userId = btn.getAttribute("data-user-id");
        const userEmail = btn.getAttribute("data-user-email");

        if (confirm(`Tem certeza que deseja excluir permanentemente o usuário ${userEmail} do Supabase? ele perderá acesso imediatamente.`)) {
          app.requestAdminAuthorization("Excluir Usuário do Supabase", async () => {
            try {
              // 1. Deletar do Auth do Supabase via RPC
              await app.storage.deleteUser(userId);

              // 2. Remover do mapeamento de roles
              if (app.settings.user_roles) {
                delete app.settings.user_roles[userEmail.toLowerCase().trim()];
                await app.save();
              }

              alert(`Usuário ${userEmail} excluído com sucesso!`);
              state.usersListLoaded = false; // Força recarregar lista
              appInstance.renderActivePage();
            } catch (err) {
              alert("Erro ao excluir usuário: " + err.message);
            }
          });
        }
      });
    });
  }
}
