/**
 * ScenariosPage.js
 * 
 * UI Component for managing isolated simulation scenarios ("Cenários & Projetos"),
 * Bridge 1 (Juxtaposition with operational cash flow) and Bridge 2 (Promotion to real transactions).
 */
class ScenariosPage {
  static render(app, state) {
    if (!state.scenariosState) {
      state.scenariosState = {
        activeScenarioId: null,
        showArchived: false,
        selectedItemIds: []
      };
    }

    const scenariosState = state.scenariosState;
    const activeScenario = scenariosState.activeScenarioId ? app.getScenarioById(scenariosState.activeScenarioId) : null;

    return `
      <div class="scenarios-page-container" style="display: flex; flex-direction: column; gap: 24px;">
        ${activeScenario ? this.renderScenarioDetail(app, state, activeScenario) : this.renderScenariosList(app, state)}
      </div>
      ${this.renderModals(app, state, activeScenario)}
    `;
  }

  /**
   * Renders the grid list of all active or archived scenarios.
   */
  static renderScenariosList(app, state) {
    const showArchived = state.scenariosState.showArchived;
    const scenarios = app.getScenarios(showArchived).filter(s => showArchived ? true : !s.archived_at);

    return `
      <div class="page-header-actions" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 10px;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="color: var(--accent-primary);"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 5h2v5h-2z"/></svg>
            Cenários & Projetos
          </h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
            Espaço isolado de simulação para planejar grandes sonhos (viagens, reformas, compras) sem afetar o caixa real.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); cursor: pointer;">
            <input type="checkbox" id="toggle-show-archived-scenarios" ${showArchived ? 'checked' : ''} style="accent-color: var(--accent-primary);">
            Exibir Arquivados
          </label>

          ${app.canEdit() ? `
            <button class="btn btn-primary" id="btn-open-create-scenario" style="padding: 10px 16px; font-size: 13px;">
              <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
              Novo Cenário
            </button>
          ` : ''}
        </div>
      </div>

      ${scenarios.length === 0 ? `
        <div class="card" style="padding: 48px; text-align: center; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); opacity: 0.5; margin-bottom: 16px;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 5h2v5h-2z"/></svg>
          <h3 style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Nenhum Cenário ${showArchived ? 'Arquivado' : 'Ativo'}</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 420px; margin: 0 auto 20px;">
            Crie um cenário hipotético para orçar um projeto (ex.: "Viagem de Férias", "Reforma da Sala") e verifique a viabilidade sem comprometer seu caixa real.
          </p>
          ${app.canEdit() ? `
            <button class="btn btn-primary" id="btn-open-create-scenario-empty">Criar Meu Primeiro Cenário</button>
          ` : ''}
        </div>
      ` : `
        <div class="scenarios-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${scenarios.map(s => this.renderScenarioCard(app, s)).join('')}
        </div>
      `}
    `;
  }

  /**
   * Renders an individual Scenario card in the list view.
   */
  static renderScenarioCard(app, scenario) {
    const totals = app.calculateScenarioTotal(scenario.id);
    const isArchived = scenario.isArchived();

    const netColor = totals.netTotal >= 0 ? 'var(--color-income)' : 'var(--color-expense)';
    const formattedNet = (totals.netTotal >= 0 ? '+' : '') + totals.netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return `
      <div class="card scenario-card" data-id="${scenario.id}" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s; position: relative;">
        ${isArchived ? `<span class="badge" style="position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.1); color: var(--text-muted); border: 1px solid var(--border-color); padding: 2px 8px; font-size: 10px; font-weight: 600;">Arquivado</span>` : ''}

        <div>
          <h3 style="font-size: 17px; font-weight: 700; color: var(--text-main); margin-bottom: 6px; padding-right: 60px;">${this.escapeHtml(scenario.name)}</h3>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 16px; min-height: 34px;">
            ${scenario.description ? this.escapeHtml(scenario.description) : '<em>Sem descrição fornecida.</em>'}
          </p>

          <div style="background: var(--bg-sidebar); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Resultado Líquido</span>
              <span style="font-size: 16px; font-weight: 700; color: ${netColor};">${formattedNet}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span>Entradas: <strong style="color: var(--color-income);">+${totals.incomeTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
              <span>Saídas: <strong style="color: var(--color-expense);">-${totals.expenseTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--text-muted);">
            <span>📋 ${totals.totalItems} item(ns)</span>
            <span>•</span>
            <span style="color: var(--accent-primary); font-weight: 600;">${totals.draftCount} a promover</span>
            ${totals.materializedCount > 0 ? `
              <span>•</span>
              <span style="color: var(--color-income);">✔ ${totals.materializedCount} promovido(s)</span>
            ` : ''}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <button class="btn btn-secondary btn-open-scenario" data-id="${scenario.id}" style="font-size: 12px; padding: 6px 14px; font-weight: 600;">
            Abrir Cenário →
          </button>

          ${app.canEdit() ? `
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-action-icon btn-edit-scenario" data-id="${scenario.id}" title="Editar Nome/Descrição" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-action-icon btn-archive-scenario" data-id="${scenario.id}" title="${isArchived ? 'Desarquivar' : 'Arquivar'}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Renders the detail view of an opened Scenario (Bridge 1 & Bridge 2 active workspace).
   */
  static renderScenarioDetail(app, state, scenario) {
    const items = app.getScenarioItems(scenario.id);
    const totals = app.calculateScenarioTotal(scenario.id);
    const juxtaposition = app.calculateScenarioJuxtaposition(scenario.id);
    const selectedIds = new Set(state.scenariosState.selectedItemIds || []);

    const draftItems = items.filter(i => i.status === 'draft');
    const allDraftSelected = draftItems.length > 0 && draftItems.every(i => selectedIds.has(i.id));

    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Breadcrumb & Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
              <a href="#scenarios" id="btn-back-to-scenarios" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">← Cenários</a>
              <span>/</span>
              <span>${this.escapeHtml(scenario.name)}</span>
            </div>
            <h2 style="font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0;">${this.escapeHtml(scenario.name)}</h2>
            ${scenario.description ? `<p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(scenario.description)}</p>` : ''}
          </div>

          <div style="display: flex; gap: 10px;">
            ${app.canEdit() ? `
              <button class="btn btn-secondary" id="btn-open-add-item" style="padding: 10px 16px; font-size: 13px;">
                <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
                Adicionar Item
              </button>
            ` : ''}
          </div>
        </div>

        <!-- PONTE 1: Banner de Justaposição com o Caixa Projetado -->
        ${this.renderJuxtapositionBanner(juxtaposition)}

        <!-- Summary KPIs Header Bar -->
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
          <div class="card stat-card" style="padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Resultado Líquido</span>
            <div style="font-size: 20px; font-weight: 700; color: ${totals.netTotal >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}; margin-top: 4px;">
              ${(totals.netTotal >= 0 ? '+' : '') + totals.netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          <div class="card stat-card" style="padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Total de Entradas</span>
            <div style="font-size: 18px; font-weight: 700; color: var(--color-income); margin-top: 4px;">
              +${totals.incomeTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          <div class="card stat-card" style="padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Total de Saídas</span>
            <div style="font-size: 18px; font-weight: 700; color: var(--color-expense); margin-top: 4px;">
              -${totals.expenseTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          <div class="card stat-card" style="padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Progresso</span>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-top: 4px;">
              ${totals.materializedCount} / ${totals.totalItems} promovidos
            </div>
          </div>
        </div>

        <!-- PONTE 2: Barra de Ações em Lote e Filtros -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 12px 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-main); cursor: pointer;">
              <input type="checkbox" id="select-all-draft-items" ${allDraftSelected ? 'checked' : ''} ${draftItems.length === 0 ? 'disabled' : ''} style="accent-color: var(--accent-primary);">
              Selecionar todos a promover (${draftItems.length})
            </label>
            ${selectedIds.size > 0 ? `
              <span class="badge" style="background: rgba(110, 68, 255, 0.2); color: var(--accent-primary); border: 1px solid rgba(110, 68, 255, 0.4); font-size: 11px; font-weight: 600;">
                ${selectedIds.size} selecionado(s)
              </span>
            ` : ''}
          </div>

          ${app.canEdit() ? `
            <button class="btn btn-primary" id="btn-open-batch-promote" ${selectedIds.size === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="font-size: 12px; padding: 8px 16px; background: var(--accent-primary);">
              🚀 Promover Selecionados em Lote (${selectedIds.size})
            </button>
          ` : ''}
        </div>

        <!-- Items Table -->
        <div class="card" style="padding: 0; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
          ${items.length === 0 ? `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
              <p style="font-size: 14px; margin-bottom: 12px;">Nenhum item cadastrado neste cenário.</p>
              ${app.canEdit() ? `<button class="btn btn-secondary" id="btn-open-add-item-empty" style="font-size: 12px;">+ Adicionar Primeiro Item</button>` : ''}
            </div>
          ` : `
            <div class="table-responsive" style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="background: var(--bg-sidebar); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                    <th style="padding: 12px 16px; width: 40px; text-align: center;">#</th>
                    <th style="padding: 12px 16px;">Data (Obrigatória)</th>
                    <th style="padding: 12px 16px;">Descrição</th>
                    <th style="padding: 12px 16px;">Tipo</th>
                    <th style="padding: 12px 16px;">Valor (R$)</th>
                    <th style="padding: 12px 16px;">Categoria & Conta</th>
                    <th style="padding: 12px 16px;">Membro</th>
                    <th style="padding: 12px 16px;">Status</th>
                    <th style="padding: 12px 16px; text-align: right;">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => this.renderItemRow(app, item, selectedIds.has(item.id))).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Renders Ponte 1 Juxtaposition Banner with operational cash flow.
   */
  static renderJuxtapositionBanner(jux) {
    if (!jux || !jux.hasItems) {
      return `
        <div class="card" style="background: rgba(110, 68, 255, 0.05); border: 1px solid rgba(110, 68, 255, 0.2); border-radius: var(--border-radius-md); padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">💡</span>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
            <strong>Ponte 1 — Justaposição com o Caixa Projetado:</strong> Adicione itens com data para visualizar a simulação do impacto financeiro no caixa real sem contaminação.
          </p>
        </div>
      `;
    }

    const formattedTargetDate = jux.targetDate ? new Date(jux.targetDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Data N/A';
    const formattedProjectedCash = jux.projectedCashOnTargetDate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedScenarioNet = (jux.scenarioNetTotal >= 0 ? '+' : '') + jux.scenarioNetTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedHypothetical = jux.hypotheticalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const isHypotheticalPositive = jux.hypotheticalBalance >= 0;
    const hypColor = isHypotheticalPositive ? 'var(--color-income)' : 'var(--color-expense)';

    return `
      <div class="card juxtaposition-card" style="background: linear-gradient(135deg, rgba(110, 68, 255, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid var(--accent-primary); border-radius: var(--border-radius-lg); padding: 18px 22px; position: relative;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: var(--accent-primary); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; box-shadow: 0 0 12px var(--accent-primary);">
              💡
            </div>
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px;">
                Justaposição com o Caixa Operacional
                <span class="badge" style="font-size: 10px; background: rgba(110, 68, 255, 0.2); color: var(--accent-primary); border: 1px solid var(--accent-primary);">Leitura Pura</span>
              </h4>
              <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Custo total em <strong>${formattedTargetDate}</strong> comparado com o saldo projetado real da sua conta corrente.
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <div style="text-align: right;">
              <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Caixa Real Projetado (${formattedTargetDate})</span>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">${formattedProjectedCash}</div>
            </div>

            <span style="font-size: 18px; color: var(--text-muted); font-weight: 300;">${jux.scenarioNetTotal >= 0 ? '+' : '−'}</span>

            <div style="text-align: right;">
              <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Resultado do Cenário</span>
              <div style="font-size: 14px; font-weight: 700; color: ${jux.scenarioNetTotal >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">${formattedScenarioNet}</div>
            </div>

            <span style="font-size: 18px; color: var(--text-muted); font-weight: 300;">=</span>

            <div style="text-align: right; background: var(--bg-card); padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
              <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Resultado Hipotético do Caixa</span>
              <div style="font-size: 16px; font-weight: 800; color: ${hypColor};">${formattedHypothetical}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders a single scenario item table row.
   */
  static renderItemRow(app, item, isSelected) {
    const isMaterialized = item.isMaterialized();
    const formattedDate = item.date ? new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Data ausente';
    const formattedAmount = item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const isExpense = item.type === 'expense';

    const category = item.category_id ? app.categories.find(c => c.id === item.category_id) : null;
    const account = item.account_id ? app.accounts.find(a => a.id === item.account_id) : null;

    return `
      <tr style="border-bottom: 1px solid var(--border-color); ${isMaterialized ? 'opacity: 0.75; background: rgba(16, 185, 129, 0.03);' : ''}">
        <td style="padding: 12px 16px; text-align: center;">
          ${!isMaterialized && app.canEdit() ? `
            <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''} style="accent-color: var(--accent-primary);">
          ` : `
            <span style="color: var(--color-income); font-size: 12px;">✔</span>
          `}
        </td>
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main); white-space: nowrap;">
          ${formattedDate}
        </td>
        <td style="padding: 12px 16px; font-weight: 500; color: var(--text-main);">
          ${this.escapeHtml(item.description)}
        </td>
        <td style="padding: 12px 16px; white-space: nowrap;">
          <span class="badge" style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; ${isExpense ? 'background: rgba(239, 68, 68, 0.15); color: var(--color-expense);' : 'background: rgba(16, 185, 129, 0.15); color: var(--color-income);'}">
            ${isExpense ? 'Despesa' : 'Receita'}
          </span>
        </td>
        <td style="padding: 12px 16px; font-weight: 700; white-space: nowrap; color: ${isExpense ? 'var(--color-expense)' : 'var(--color-income)'};">
          ${isExpense ? '-' : '+'}${formattedAmount}
        </td>
        <td style="padding: 12px 16px; color: var(--text-muted); font-size: 12px;">
          <div>${category ? this.escapeHtml(category.name) : '<em style="opacity:0.6;">Sem categoria</em>'}</div>
          <div style="font-size: 11px; opacity: 0.8;">${account ? this.escapeHtml(account.name) : '<em style="opacity:0.6;">Sem conta</em>'}</div>
        </td>
        <td style="padding: 12px 16px; color: var(--text-secondary); font-size: 12px;">
          ${this.escapeHtml(item.member || 'Casal')}
        </td>
        <td style="padding: 12px 16px; white-space: nowrap;">
          ${isMaterialized ? `
            <span class="badge" title="Item promovido! Valor e data originais congelados (${item.valor_orcado ? item.valor_orcado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''} em ${item.data_orcada || ''})" style="background: rgba(16, 185, 129, 0.2); color: var(--color-income); border: 1px solid rgba(16, 185, 129, 0.4); font-size: 11px; font-weight: 600;">
              ✔ Promovido (Materialized)
            </span>
          ` : `
            <span class="badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted); border: 1px solid var(--border-color); font-size: 11px;">
              Rascunho
            </span>
          `}
        </td>
        <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
          ${app.canEdit() ? `
            ${!isMaterialized ? `
              <button class="btn btn-primary btn-promote-single" data-id="${item.id}" style="font-size: 11px; padding: 4px 10px; margin-right: 4px; background: var(--accent-primary);">
                Promover
              </button>
              <button class="btn btn-action-icon btn-edit-item" data-id="${item.id}" title="Editar Item" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-action-icon btn-delete-item" data-id="${item.id}" title="Excluir Item" style="background: transparent; border: none; color: var(--color-expense); cursor: pointer; padding: 4px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            ` : `
              <span style="font-size: 11px; color: var(--text-muted); font-style: italic;" title="Edição bloqueada per §6.2 ( snapshot congelado )">🔒 Congelado</span>
            `}
          ` : ''}
        </td>
      </tr>
    `;
  }

  /**
   * Renders UI Modals for creating/editing scenarios, items, and promotion dialogs.
   */
  static renderModals(app, state, activeScenario) {
    const categories = app.categories || [];
    const accounts = app.accounts || [];

    return `
      <!-- Modal Criar / Editar Cenário -->
      <div class="modal-overlay" id="modal-scenario-form">
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header">
            <h3 id="modal-scenario-title">Novo Cenário</h3>
            <button class="modal-close" id="btn-close-scenario-modal">&times;</button>
          </div>
          <form id="form-scenario">
            <input type="hidden" id="scenario-id" value="">
            <div class="form-group" style="margin-bottom: 14px;">
              <label for="scenario-name" style="font-size: 12px; font-weight: 600;">Nome do Cenário *</label>
              <input type="text" id="scenario-name" placeholder="Ex.: Reforma Apartamento, Viagem Chile 2027" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label for="scenario-description" style="font-size: 12px; font-weight: 600;">Descrição Livre (Opcional)</label>
              <textarea id="scenario-description" placeholder="Anotações, metas ou detalhes sobre este projeto..." rows="3" style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px; font-family: inherit;"></textarea>
            </div>
            <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-scenario-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Cenário</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Criar / Editar Item de Cenário -->
      <div class="modal-overlay" id="modal-scenario-item-form">
        <div class="modal-card" style="max-width: 520px;">
          <div class="modal-header">
            <h3 id="modal-item-title">Adicionar Item de Cenário</h3>
            <button class="modal-close" id="btn-close-item-modal">&times;</button>
          </div>
          <form id="form-scenario-item">
            <input type="hidden" id="item-id" value="">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label for="item-type" style="font-size: 12px; font-weight: 600;">Tipo *</label>
                <select id="item-type" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="expense">Despesa (Saída)</option>
                  <option value="income">Receita (Entrada)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="item-amount" style="font-size: 12px; font-weight: 600;">Valor (R$) *</label>
                <input type="number" id="item-amount" step="0.01" min="0.01" placeholder="0.00" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label for="item-description" style="font-size: 12px; font-weight: 600;">Descrição *</label>
              <input type="text" id="item-description" placeholder="Ex.: Piso porcelanato sala, Venda carro usado" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label for="item-date" style="font-size: 12px; font-weight: 600;">Data Estimada * (Regra §4.2)</label>
                <input type="date" id="item-date" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
              </div>

              <div class="form-group">
                <label for="item-member" style="font-size: 12px; font-weight: 600;">Responsável</label>
                <select id="item-member" style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="Casal">Casal</option>
                  <option value="Paula">Paula</option>
                  <option value="Alcides">Alcides</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div class="form-group">
                <label for="item-category" style="font-size: 12px; font-weight: 600;">Categoria (Opcional no rascunho)</label>
                <select id="item-category" style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="">-- Selecionar depois --</option>
                  ${categories.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)} (${c.type === 'income' ? 'Entrada' : 'Saída'})</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="item-account" style="font-size: 12px; font-weight: 600;">Conta (Opcional no rascunho)</label>
                <select id="item-account" style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="">-- Selecionar depois --</option>
                  ${accounts.map(a => `<option value="${a.id}">${this.escapeHtml(a.name)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-item-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Item</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Promover Item Individual (Bridge 2 Modal) -->
      <div class="modal-overlay" id="modal-promote-single">
        <div class="modal-card" style="max-width: 500px;">
          <div class="modal-header">
            <h3>🚀 Promover Item para Transação Operacional</h3>
            <button class="modal-close" id="btn-close-promote-single">&times;</button>
          </div>
          <form id="form-promote-single">
            <input type="hidden" id="promote-item-id" value="">
            
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px; background: rgba(110,68,255,0.08); padding: 10px; border-radius: 6px; border: 1px solid rgba(110,68,255,0.2);">
              Ao confirmar, uma nova transação real será criada no seu fluxo de caixa operacional. O item do cenário passará para <strong>Promovido (Materialized)</strong> com seu valor/data congelados.
            </p>

            <div class="form-group" style="margin-bottom: 12px;">
              <label for="promote-description" style="font-size: 12px; font-weight: 600;">Descrição</label>
              <input type="text" id="promote-description" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label for="promote-amount" style="font-size: 12px; font-weight: 600;">Valor (R$)</label>
                <input type="number" id="promote-amount" step="0.01" min="0.01" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
              </div>

              <div class="form-group">
                <label for="promote-date" style="font-size: 12px; font-weight: 600;">Data da Transação *</label>
                <input type="date" id="promote-date" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label for="promote-account" style="font-size: 12px; font-weight: 600;">Conta Operacional *</label>
                <select id="promote-account" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="">-- Selecione a Conta --</option>
                  ${accounts.map(a => `<option value="${a.id}">${this.escapeHtml(a.name)}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="promote-category" style="font-size: 12px; font-weight: 600;">Categoria Operacional *</label>
                <select id="promote-category" required style="width: 100%; padding: 10px; font-size: 13px; background: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="">-- Selecione a Categoria --</option>
                  ${categories.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label for="promote-status-hint" style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Status Operacional que será gerado (Regra §5.3):</label>
              <div id="promote-status-badge" style="font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px; background: var(--bg-sidebar); border: 1px solid var(--border-color); margin-top: 4px; display: inline-block;">
                Previsto (Planejado)
              </div>
            </div>

            <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-promote-single">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="background: var(--accent-primary);">Confirmar Promoção</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Promover em Lote (Bridge 2 Batch Modal) -->
      <div class="modal-overlay" id="modal-promote-batch">
        <div class="modal-card" style="max-width: 640px;">
          <div class="modal-header">
            <h3>🚀 Promover Itens em Lote</h3>
            <button class="modal-close" id="btn-close-promote-batch">&times;</button>
          </div>
          <form id="form-promote-batch">
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">
              Confirme a Conta e Categoria para os itens selecionados. Os itens sem conta/categoria pré-definidas assumirão os valores selecionados abaixo.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; background: var(--bg-sidebar); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
              <div class="form-group">
                <label for="batch-default-account" style="font-size: 11px; font-weight: 600;">Conta Padrão (se não especificada)</label>
                <select id="batch-default-account" style="width: 100%; padding: 8px; font-size: 12px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="">-- Escolher Conta Padrão --</option>
                  ${accounts.map(a => `<option value="${a.id}">${this.escapeHtml(a.name)}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="batch-default-category" style="font-size: 11px; font-weight: 600;">Categoria Padrão (se não especificada)</label>
                <select id="batch-default-category" style="width: 100%; padding: 8px; font-size: 12px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                  <option value="">-- Escolher Categoria Padrão --</option>
                  ${categories.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div id="batch-items-preview-list" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              <!-- Dynamic item rows inserted by initEvents -->
            </div>

            <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-promote-batch">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="background: var(--accent-primary);">Executar Promoção em Lote</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Initializes event listeners for the Scenarios view.
   */
  static initEvents(app, state, controller) {
    if (!state.scenariosState) {
      state.scenariosState = { activeScenarioId: null, showArchived: false, selectedItemIds: [] };
    }

    const scenariosState = state.scenariosState;
    const reRender = () => controller.renderActivePage();

    // Toggle Exibir Arquivados
    const toggleArchived = document.getElementById('toggle-show-archived-scenarios');
    if (toggleArchived) {
      toggleArchived.onchange = (e) => {
        scenariosState.showArchived = e.target.checked;
        reRender();
      };
    }

    // Voltar para lista de cenários
    const btnBack = document.getElementById('btn-back-to-scenarios');
    if (btnBack) {
      btnBack.onclick = (e) => {
        e.preventDefault();
        scenariosState.activeScenarioId = null;
        scenariosState.selectedItemIds = [];
        reRender();
      };
    }

    // Abrir cenário
    document.querySelectorAll('.btn-open-scenario').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        scenariosState.activeScenarioId = id;
        scenariosState.selectedItemIds = [];
        reRender();
      };
    });

    // --- Modal Criar/Editar Cenário ---
    const modalScenario = document.getElementById('modal-scenario-form');
    const formScenario = document.getElementById('form-scenario');
    const btnOpenCreate = document.getElementById('btn-open-create-scenario') || document.getElementById('btn-open-create-scenario-empty');
    const btnCloseScenario = document.getElementById('btn-close-scenario-modal');
    const btnCancelScenario = document.getElementById('btn-cancel-scenario-modal');

    const openScenarioModal = (scenario = null) => {
      if (!modalScenario) return;
      document.getElementById('modal-scenario-title').textContent = scenario ? 'Editar Cenário' : 'Novo Cenário';
      document.getElementById('scenario-id').value = scenario ? scenario.id : '';
      document.getElementById('scenario-name').value = scenario ? scenario.name : '';
      document.getElementById('scenario-description').value = scenario ? scenario.description : '';
      modalScenario.classList.add('active');
      document.getElementById('scenario-name').focus();
    };

    const closeScenarioModal = () => {
      if (modalScenario) modalScenario.classList.remove('active');
    };

    if (btnOpenCreate) btnOpenCreate.onclick = () => openScenarioModal();
    if (btnCloseScenario) btnCloseScenario.onclick = () => closeScenarioModal();
    if (btnCancelScenario) btnCancelScenario.onclick = () => closeScenarioModal();

    document.querySelectorAll('.btn-edit-scenario').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const sc = app.getScenarioById(id);
        if (sc) openScenarioModal(sc);
      };
    });

    document.querySelectorAll('.btn-archive-scenario').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const sc = app.getScenarioById(id);
        if (!sc) return;
        const isArch = sc.isArchived();
        if (confirm(`Deseja ${isArch ? 'desarquivar' : 'arquivar'} o cenário "${sc.name}"?`)) {
          if (isArch) {
            sc.archived_at = null;
            await app.save();
          } else {
            await app.archiveScenario(id);
          }
          reRender();
        }
      };
    });

    if (formScenario) {
      formScenario.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('scenario-id').value;
        const name = document.getElementById('scenario-name').value;
        const description = document.getElementById('scenario-description').value;

        try {
          if (id) {
            await app.updateScenario(id, { name, description });
          } else {
            const created = await app.addScenario({ name, description });
            scenariosState.activeScenarioId = created.id;
          }
          closeScenarioModal();
          reRender();
        } catch (err) {
          alert('Erro ao salvar cenário: ' + err.message);
        }
      };
    }

    // --- Modal Criar/Editar Item de Cenário ---
    const modalItem = document.getElementById('modal-scenario-item-form');
    const formItem = document.getElementById('form-scenario-item');
    const btnOpenAddItem = document.getElementById('btn-open-add-item') || document.getElementById('btn-open-add-item-empty');
    const btnCloseItem = document.getElementById('btn-close-item-modal');
    const btnCancelItem = document.getElementById('btn-cancel-item-modal');

    const openItemModal = (item = null) => {
      if (!modalItem) return;
      document.getElementById('modal-item-title').textContent = item ? 'Editar Item do Cenário' : 'Adicionar Item ao Cenário';
      document.getElementById('item-id').value = item ? item.id : '';
      document.getElementById('item-type').value = item ? item.type : 'expense';
      document.getElementById('item-amount').value = item ? item.amount : '';
      document.getElementById('item-description').value = item ? item.description : '';
      document.getElementById('item-date').value = item ? item.date : FinancialEngine.formatDate(new Date());
      document.getElementById('item-member').value = item ? item.member || 'Casal' : 'Casal';
      document.getElementById('item-category').value = item ? item.category_id || '' : '';
      document.getElementById('item-account').value = item ? item.account_id || '' : '';
      
      modalItem.classList.add('active');
      document.getElementById('item-description').focus();
    };

    const closeItemModal = () => {
      if (modalItem) modalItem.classList.remove('active');
    };

    if (btnOpenAddItem) btnOpenAddItem.onclick = () => openItemModal();
    if (btnCloseItem) btnCloseItem.onclick = () => closeItemModal();
    if (btnCancelItem) btnCancelItem.onclick = () => closeItemModal();

    document.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const item = app.scenarioItems.find(i => i.id === id);
        if (item) openItemModal(item);
      };
    });

    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const item = app.scenarioItems.find(i => i.id === id);
        if (!item) return;
        if (confirm(`Excluir o item "${item.description}"?`)) {
          await app.deleteScenarioItem(id);
          scenariosState.selectedItemIds = scenariosState.selectedItemIds.filter(i => i !== id);
          reRender();
        }
      };
    });

    if (formItem) {
      formItem.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const scenario_id = scenariosState.activeScenarioId;
        const type = document.getElementById('item-type').value;
        const amount = document.getElementById('item-amount').value;
        const description = document.getElementById('item-description').value;
        const date = document.getElementById('item-date').value;
        const member = document.getElementById('item-member').value;
        const category_id = document.getElementById('item-category').value || null;
        const account_id = document.getElementById('item-account').value || null;

        try {
          if (id) {
            await app.updateScenarioItem(id, { type, amount, description, date, member, category_id, account_id });
          } else {
            await app.addScenarioItem({ scenario_id, type, amount, description, date, member, category_id, account_id });
          }
          closeItemModal();
          reRender();
        } catch (err) {
          alert('Erro ao salvar item: ' + err.message);
        }
      };
    }

    // --- Checkbox Selection & Batch Promotion ---
    const selectAllCheckbox = document.getElementById('select-all-draft-items');
    if (selectAllCheckbox) {
      selectAllCheckbox.onchange = (e) => {
        const isChecked = e.target.checked;
        const activeItems = app.getScenarioItems(scenariosState.activeScenarioId).filter(i => i.status === 'draft');
        if (isChecked) {
          scenariosState.selectedItemIds = activeItems.map(i => i.id);
        } else {
          scenariosState.selectedItemIds = [];
        }
        reRender();
      };
    }

    document.querySelectorAll('.item-checkbox').forEach(cb => {
      cb.onchange = (e) => {
        const id = cb.getAttribute('data-id');
        const checked = e.target.checked;
        let set = new Set(scenariosState.selectedItemIds || []);
        if (checked) set.add(id);
        else set.delete(id);
        scenariosState.selectedItemIds = Array.from(set);
        reRender();
      };
    });

    // --- Single Promotion Modal (Bridge 2) ---
    const modalPromoteSingle = document.getElementById('modal-promote-single');
    const formPromoteSingle = document.getElementById('form-promote-single');
    const btnClosePromoteSingle = document.getElementById('btn-close-promote-single');
    const btnCancelPromoteSingle = document.getElementById('btn-cancel-promote-single');

    const openSinglePromoteModal = (item) => {
      if (!modalPromoteSingle) return;
      document.getElementById('promote-item-id').value = item.id;
      document.getElementById('promote-description').value = item.description;
      document.getElementById('promote-amount').value = item.amount;
      document.getElementById('promote-date').value = item.date || FinancialEngine.formatDate(new Date());
      document.getElementById('promote-account').value = item.account_id || (app.accounts[0] ? app.accounts[0].id : '');
      document.getElementById('promote-category').value = item.category_id || (app.categories[0] ? app.categories[0].id : '');

      const updateStatusBadge = () => {
        const d = document.getElementById('promote-date').value;
        const todayStr = FinancialEngine.formatDate(new Date());
        const badge = document.getElementById('promote-status-badge');
        if (badge) {
          if (d >= todayStr) {
            badge.textContent = 'Previsto (Planejado)';
            badge.style.color = 'var(--accent-primary)';
          } else {
            badge.textContent = 'Realizado (Confirmado)';
            badge.style.color = 'var(--color-income)';
          }
        }
      };

      document.getElementById('promote-date').onchange = updateStatusBadge;
      updateStatusBadge();

      modalPromoteSingle.classList.add('active');
    };

    const closeSinglePromoteModal = () => {
      if (modalPromoteSingle) modalPromoteSingle.classList.remove('active');
    };

    if (btnClosePromoteSingle) btnClosePromoteSingle.onclick = () => closeSinglePromoteModal();
    if (btnCancelPromoteSingle) btnCancelPromoteSingle.onclick = () => closeSinglePromoteModal();

    document.querySelectorAll('.btn-promote-single').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const item = app.scenarioItems.find(i => i.id === id);
        if (item) openSinglePromoteModal(item);
      };
    });

    if (formPromoteSingle) {
      formPromoteSingle.onsubmit = async (e) => {
        e.preventDefault();
        const itemId = document.getElementById('promote-item-id').value;
        const description = document.getElementById('promote-description').value;
        const amount = document.getElementById('promote-amount').value;
        const date = document.getElementById('promote-date').value;
        const account_id = document.getElementById('promote-account').value;
        const category_id = document.getElementById('promote-category').value;

        try {
          await app.promoteScenarioItem(itemId, { description, amount, date, account_id, category_id });
          closeSinglePromoteModal();
          alert('🚀 Item promovido com sucesso! Uma transação real foi adicionada ao fluxo de caixa.');
          reRender();
        } catch (err) {
          alert('Erro ao promover item: ' + err.message);
        }
      };
    }

    // --- Batch Promotion Modal (Bridge 2 Batch) ---
    const modalPromoteBatch = document.getElementById('modal-promote-batch');
    const formPromoteBatch = document.getElementById('form-promote-batch');
    const btnOpenBatch = document.getElementById('btn-open-batch-promote');
    const btnClosePromoteBatch = document.getElementById('btn-close-promote-batch');
    const btnCancelPromoteBatch = document.getElementById('btn-cancel-promote-batch');

    const openBatchPromoteModal = () => {
      if (!modalPromoteBatch) return;
      const selectedIds = state.scenariosState.selectedItemIds || [];
      const itemsToPromote = app.scenarioItems.filter(i => selectedIds.includes(i.id) && i.status === 'draft');

      const container = document.getElementById('batch-items-preview-list');
      if (container) {
        container.innerHTML = itemsToPromote.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12px;">
            <div>
              <strong style="color: var(--text-main);">${this.escapeHtml(item.description)}</strong>
              <span style="color: var(--text-muted); font-size: 11px; margin-left: 8px;">(${item.date})</span>
            </div>
            <span style="font-weight: 700; color: ${item.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)'};">
              ${item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        `).join('');
      }

      modalPromoteBatch.classList.add('active');
    };

    const closeBatchPromoteModal = () => {
      if (modalPromoteBatch) modalPromoteBatch.classList.remove('active');
    };

    if (btnOpenBatch) btnOpenBatch.onclick = () => openBatchPromoteModal();
    if (btnClosePromoteBatch) btnClosePromoteBatch.onclick = () => closeBatchPromoteModal();
    if (btnCancelPromoteBatch) btnCancelPromoteBatch.onclick = () => closeBatchPromoteModal();

    if (formPromoteBatch) {
      formPromoteBatch.onsubmit = async (e) => {
        e.preventDefault();
        const defaultAcc = document.getElementById('batch-default-account').value;
        const defaultCat = document.getElementById('batch-default-category').value;
        const selectedIds = state.scenariosState.selectedItemIds || [];
        const itemsToPromote = app.scenarioItems.filter(i => selectedIds.includes(i.id) && i.status === 'draft');

        const itemPromotions = itemsToPromote.map(item => ({
          itemId: item.id,
          account_id: item.account_id || defaultAcc,
          category_id: item.category_id || defaultCat
        }));

        try {
          const results = await app.promoteScenarioItemsBatch(itemPromotions);
          closeBatchPromoteModal();
          state.scenariosState.selectedItemIds = [];
          alert(`🚀 ${results.length} item(ns) promovido(s) com sucesso para o fluxo operacional!`);
          reRender();
        } catch (err) {
          alert('Erro na promoção em lote: ' + err.message);
        }
      };
    }
  }

  static escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenariosPage;
}
