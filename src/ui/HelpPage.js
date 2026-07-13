class HelpPage {
  static render(app, state) {
    return `
      <div class="panel-grid animate-fade-in" style="max-width: 900px; margin: 0 auto; gap: 24px;">
        
        <!-- Welcome Title -->
        <div class="section-card" style="background: radial-gradient(100% 100% at 0% 0%, hsla(250, 84%, 67%, 0.1) 0%, rgba(15, 23, 42, 0) 100%);">
          <h2 style="font-size:24px; margin-bottom: 8px;">Guia de Uso do Lumen</h2>
          <p style="color:var(--text-secondary); font-size:14px; line-height:1.5;">
            Bem-vindos, <strong>Paula & Alcides</strong>! Este guia foi feito para ajudar vocês a entenderem os conceitos do Lumen e guia-los no processo de transição para o uso real do aplicativo.
          </p>
        </div>

        <!-- 30-Day Decision Logic Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          
          <div class="section-card">
            <h3 style="font-size:15px; color: var(--accent-secondary); margin-bottom: 12px; border:none; padding:0;">1. O que é a Margem de Decisão?</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              Diferente de dashboards tradicionais, o Lumen calcula a sua <strong>Margem de Decisão</strong>. Ela é definida como o <strong>menor saldo projetado do casal nos próximos 30 dias</strong>.
              <br><br>
              • <strong>Margem Positiva (Verde)</strong>: Vocês podem gastar até esse valor hoje, pois o saldo futuro nunca ficará negativo.
              <br>
              • <strong>Margem Negativa (Vermelha)</strong>: O caixa vai estourar nos próximos dias. Evitem compras supérfluas.
            </p>
          </div>

          <div class="section-card">
            <h3 style="font-size:15px; color: var(--accent-primary); margin-bottom: 12px; border:none; padding:0;">2. Planejado vs. Confirmado</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              O segredo da projeção é registrar as despesas e receitas futuras com o status de <strong>Planejado</strong> (Ex: Aluguel no dia 10, Energia no dia 25, Salários).
              <br><br>
              À medida que as contas forem pagas ou os salários recebidos, editem o lançamento e alterem o status para <strong>Confirmado</strong>. Isso garante projeções de saldo 100% corretas no Calendário.
            </p>
          </div>

        </div>

        <!-- OneDrive + History Details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          
          <div class="section-card">
            <h3 style="font-size:15px; color: var(--color-income); margin-bottom: 12px; border:none; padding:0;">3. Como funciona a pasta do OneDrive?</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              Por padrão, o Lumen salva os dados no navegador (LocalStorage). Ao clicar em <strong>"Conectar"</strong> no canto inferior esquerdo e escolher a sua pasta de OneDrive:
              <br><br>
              • O Lumen grava e lê arquivos JSON diretamente em seu computador.
              <br>
              • O OneDrive cuida do backup e sincronização em nuvem automaticamente.
              <br>
              • Vocês podem abrir o mesmo arquivo HTML em outro computador e conectar à mesma pasta para ver os mesmos dados!
            </p>
          </div>

          <div class="section-card">
            <h3 style="font-size:15px; color: var(--color-expense); margin-bottom: 12px; border:none; padding:0;">4. Por que minhas edições geram histórico?</h3>
            <p style="font-size:13px; color: var(--text-secondary); line-height:1.6;">
              No Lumen, <strong>dados históricos nunca são perdidos ou sobrescritos</strong>. 
              Toda vez que uma transação é editada ou excluída, o sistema arquiva a versão antiga como inativa e insere uma nova versão atualizada.
              <br><br>
              Isso garante que vocês possam auditar a evolução dos seus lançamentos na aba **Auditoria & Versões**, impedindo erros de digitação acidentais.
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
                <strong>Apagar os dados de demonstração (Demo Data)</strong><br>
                Navegue até a página de <strong>Contas & Categorias</strong>. Role até o rodapé e clique no botão vermelho <strong>"Resetar Banco de Dados"</strong>. Isso limpará todas as movimentações e categorias de teste, deixando a base pronta.
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 2:</span>
              <div>
                <strong>Conectar ao OneDrive local</strong><br>
                Clique no botão <strong>"Conectar"</strong> no rodapé da barra lateral e selecione o diretório do projeto no seu OneDrive: <br>
                <code style="background-color:var(--bg-base); padding:2px 6px; border-radius:4px; font-size:11px;">C:\\Users\\117451\\OneDrive - paguemenos.com.br\\Lumen - Personal Controller Financial</code><br>
                Conceda a permissão ao navegador.
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 3:</span>
              <div>
                <strong>Cadastrar as Contas e Saldos Iniciais</strong><br>
                Em <strong>Contas & Categorias</strong>, crie as suas contas (Ex: Conta Corrente Itaú, Reserva Nubank, Dinheiro Físico) digitando os seus saldos reais de hoje.
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 4:</span>
              <div>
                <strong>Cadastrar as Categorias</strong><br>
                Crie as categorias que fizerem sentido para vocês (Ex: Aluguel, Supermercado, Lazer, Uber).
              </div>
            </div>

            <div style="display:flex; gap:12px;">
              <span style="font-weight:700; color:var(--accent-primary); font-size:15px;">Passo 5:</span>
              <div>
                <strong>Lançar as Receitas e Despesas Futuras</strong><br>
                Clique em <strong>"Nova Movimentação"</strong> e insira todas as suas entradas e saídas recorrentes futuras como <strong>"Planejado"</strong>. O calendário e o painel de decisões se atualizarão instantaneamente, dando a vocês uma visão precisa do fluxo de caixa do casal!
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
