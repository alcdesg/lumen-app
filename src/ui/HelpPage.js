class HelpPage {
  static render(app, state) {
    return `
      <div class="panel-grid animate-fade-in" style="max-width: 900px; margin: 0 auto; gap: 24px;">
        
        <!-- Welcome Title -->
        <div class="section-card" style="background: radial-gradient(100% 100% at 0% 0%, hsla(250, 84%, 67%, 0.1) 0%, rgba(15, 23, 42, 0) 100%);">
          <h2 style="font-size:24px; margin-bottom: 8px;">Guia de Uso do Lumen</h2>
          <p style="color:var(--text-secondary); font-size:14px; line-height:1.5;">
            Bem-vindos ao Lumen! Este guia ajuda a entender a metodologia de projeções financeiras do aplicativo e as tecnologias que garantem a sincronização simultânea do casal.
          </p>
        </div>

        <!-- 30-Day Decision Logic Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          
          <div class="section-card">
            <h3 style="font-size:15px; color: var(--accent-secondary); margin-bottom: 12px; border:none; padding:0;">1. O que é a Margem de Decisão?</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              Diferente de sistemas de gastos passados, o Lumen calcula a sua <strong>Margem de Decisão</strong>. Ela é definida como o <strong>menor saldo projetado do casal nos próximos 30 dias</strong>.
              <br><br>
              • <strong>Margem Positiva (Verde)</strong>: Vocês podem gastar ou poupar até esse valor hoje, sabendo que as contas futuras não ficarão negativas.
              <br>
              • <strong>Margem Negativa (Vermelha)</strong>: O caixa vai estourar nos próximos dias. Evitem gastos não essenciais.
            </p>
          </div>

          <div class="section-card">
            <h3 style="font-size:15px; color: var(--accent-primary); margin-bottom: 12px; border:none; padding:0;">2. Planejado vs. Confirmado</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              O segredo do planejamento é lançar receitas e despesas futuras com o status de <strong>Planejado</strong> (salários, aluguel, energia, faturas).
              <br><br>
              À medida que as contas forem pagas ou os valores recebidos, alterem o status para <strong>Confirmado</strong>. Isso garante que a linha de projeção no calendário seja sempre realista e livre de distorções.
            </p>
          </div>

        </div>

        <!-- Supabase + History Details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          
          <div class="section-card">
            <h3 style="font-size:15px; color: var(--color-income); margin-bottom: 12px; border:none; padding:0;">3. Colaboração Real-Time & Nuvem</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              O Lumen utiliza o <strong>Supabase Cloud</strong> como fonte única de verdade.
              <br><br>
              • <strong>Atualização Sem Refresh</strong>: Lançamentos criados ou alterados por um membro aparecem instantaneamente na tela do outro.
              <br>
              • <strong>Indicador Online</strong>: A bolinha verde no topo mostra se ambos estão mexendo no sistema no mesmo momento.
              <br>
              • <strong>Isolamento de Sessão</strong>: O login é isolado por aba do navegador, permitindo múltiplos acessos e testes.
            </p>
          </div>

          <div class="section-card">
            <h3 style="font-size:15px; color: var(--color-expense); margin-bottom: 12px; border:none; padding:0;">4. Versionamento de Transações</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              Para garantir a rastreabilidade financeira do casal, <strong>nenhuma edição ou exclusão apaga dados anteriores</strong>.
              <br><br>
              Toda vez que vocês modificam um lançamento, a versão antiga é marcada como inativa e uma nova versão atualizada é salva. Vocês podem auditar toda essa trilha cronológica de edições na aba <strong>Auditoria & Versões</strong>.
            </p>
          </div>

        </div>

        <!-- Passo a Passo Real Data setup -->
        <div class="section-card">
          <h3 style="font-size:16px; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
            🏁 Guia Passo a Passo: Começando com Seus Dados Reais
          </h3>
          
          <div style="display:flex; flex-direction:column; gap:16px; font-size:13px; line-height:1.6; color:var(--text-secondary);">
            
            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 1:</span>
              <div>
                <strong>Acessar o Ambiente Nuvem do Casal</strong><br>
                Utilizem suas credenciais do Supabase para logar. Se o app estiver em "Modo de Demonstração" (Guest), naveguem em Configurações -> Zona de Perigo para conectar e sincronizar sua base definitiva.
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 2:</span>
              <div>
                <strong>Cadastrar as Contas e Saldos Iniciais</strong><br>
                Em <strong>Contas & Categorias</strong>, criem as carteiras ou caixas de destino (ex: Conta Itaú, Carteira Dinheiro, Reserva de Emergência) e digitem o saldo atual de hoje para cada uma.
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 3:</span>
              <div>
                <strong>Cadastrar Categorias Homogeneizadas</strong><br>
                Naveguem na mesma página e insiram categorias (ex: Alimentação, Habitação, Lazer). Lembrem-se que o Lumen unifica automaticamente acentos e caixa alta/baixa para evitar duplicados.
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 4:</span>
              <div>
                <strong>Lançar Receitas e Despesas Previstas</strong><br>
                Adicionem suas despesas e receitas mensais futuras como <strong>Planejado</strong>. Conforme os pagamentos ocorrerem, marquem como <strong>Confirmado</strong>. A Margem de Decisão do casal será calculada automaticamente!
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    // Read-only documentation page
  }
}
