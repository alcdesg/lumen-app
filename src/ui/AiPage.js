class AiPage {
  static render(app, state) {
    const apiKey = localStorage.getItem("lumen_gemini_key") || "";

    if (!apiKey) {
      return `
        <div class="ai-container animate-fade-in" style="max-width: 600px; margin: 40px auto;">
          <div class="section-card" style="text-align: center; padding: 40px 32px;">
            <div style="background-color: var(--accent-primary-glow); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
              <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: var(--accent-primary);">
                <path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/>
              </svg>
            </div>
            
            <h2 style="margin-bottom: 12px; font-size: 24px;">Configurar Lumen IA</h2>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
              Plugue inteligência artificial diretamente no seu painel para analisar seus gastos, projetar cenários e encontrar oportunidades de economia no YTG. 
              Seus dados financeiros permanecem 100% locais e nunca são compartilhados com servidores externos.
            </p>

            <form id="ai-key-setup-form" style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
              <div class="form-row">
                <label for="gemini-api-key" style="font-weight: 700;">Chave de API do Gemini*</label>
                <input type="password" id="gemini-api-key" placeholder="Colar api_key aqui..." required autocomplete="off" style="font-family: monospace;">
                <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
                  Você pode obter uma chave de API do Gemini de graça em menos de 1 minuto usando sua conta Google através do 
                  <a href="https://aistudio.google.com/" target="_blank" style="color: var(--accent-secondary); text-decoration: underline;">Google AI Studio</a>.
                </span>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 8px;">Conectar Lumen IA</button>
            </form>
          </div>
        </div>
      `;
    }

    // Chat view
    return `
      <div class="ai-container animate-fade-in" style="display: flex; flex-direction: column; height: calc(100vh - 48px); max-height: 800px; max-width: 900px; margin: 0 auto; gap: 16px;">
        
        <!-- Header -->
        <div class="section-card" style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background-color: var(--color-income-bg); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;">
              <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: var(--color-income);">
                <path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/>
              </svg>
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-income); position: absolute; bottom: 0; right: 0; border: 1.5px solid var(--bg-sidebar);"></div>
            </div>
            <div>
              <h3 style="font-size: 16px; margin: 0; border: none; padding: 0;">Lumen IA</h3>
              <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Online • Análise financeira baseada em Gemini 1.5 Flash</p>
            </div>
          </div>
          
          <button id="disconnect-ai-btn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px; display: flex; align-items: center; gap: 6px;" title="Remover API Key local">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            Desconectar IA
          </button>
        </div>

        <!-- Messages Area -->
        <div class="section-card" id="ai-chat-messages" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding: 24px; background-color: rgba(15, 23, 42, 0.15);">
          <!-- Welcome message -->
          <div class="ai-msg assistant-msg" style="display: flex; gap: 12px; max-width: 85%;">
            <div style="background-color: var(--color-income-bg); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: var(--color-income);"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/></svg>
            </div>
            <div style="background-color: var(--bg-sidebar); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 0 12px 12px 12px; font-size: 13px; line-height: 1.5; color: var(--text-main);">
              Olá, Paula e Alcides! Eu sou o <strong>Lumen IA</strong>. 
              Acabei de analisar os dados consolidados das suas contas de caixa e transações planejadas. 
              <br><br>
              Como posso ajudar vocês hoje? Vocês podem digitar suas próprias perguntas ou usar uma das sugestões rápidas abaixo.
            </div>
          </div>
        </div>

        <!-- Suggestions and Typing Area -->
        <div style="display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;">
          
          <!-- Rapid suggestions -->
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none;" id="ai-suggestions-row">
            <button class="btn btn-secondary ai-suggest-btn" style="padding: 6px 12px; font-size: 11px; white-space: nowrap; border-radius: 20px;" data-prompt="Quais são as nossas 3 principais fontes de despesas este mês?">
              🔍 Quais os maiores gastos deste mês?
            </button>
            <button class="btn btn-secondary ai-suggest-btn" style="padding: 6px 12px; font-size: 11px; white-space: nowrap; border-radius: 20px;" data-prompt="Como podemos economizar R$ 500 no restante do ano (YTG) baseando-se nos nossos dados de despesas?">
              💡 Como economizar R$ 500 no YTG?
            </button>
            <button class="btn btn-secondary ai-suggest-btn" style="padding: 6px 12px; font-size: 11px; white-space: nowrap; border-radius: 20px;" data-prompt="Analise nosso fluxo de caixa projetado nos próximos meses e nos diga se corremos algum risco de ficar no vermelho.">
              ⚠️ Análise de risco de saldo
            </button>
            <button class="btn btn-secondary ai-suggest-btn" style="padding: 6px 12px; font-size: 11px; white-space: nowrap; border-radius: 20px;" data-prompt="Faça um raio-x das despesas de Paula vs Alcides vs Casal. Onde cada um está gastando mais?">
              👥 Paula vs Alcides vs Casal
            </button>
          </div>

          <!-- Typing area -->
          <form id="ai-chat-form" style="display: flex; gap: 8px; background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px; border-radius: var(--border-radius-lg); align-items: center;">
            <input type="text" id="ai-chat-input" placeholder="Pergunte ao Lumen IA sobre suas finanças..." required autocomplete="off" style="border: none; background: transparent; padding: 8px 12px; font-size: 13px; color: var(--text-main); flex-grow: 1; box-shadow: none;">
            <button type="submit" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              Enviar
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>

        </div>

      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    const apiKeySetupForm = document.getElementById("ai-key-setup-form");
    const disconnectAiBtn = document.getElementById("disconnect-ai-btn");
    const aiChatForm = document.getElementById("ai-chat-form");
    const aiChatMessages = document.getElementById("ai-chat-messages");
    const suggestBtns = document.querySelectorAll(".ai-suggest-btn");

    // 1. Setup API Key Form
    if (apiKeySetupForm) {
      apiKeySetupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const key = document.getElementById("gemini-api-key").value.trim();
        if (key) {
          localStorage.setItem("lumen_gemini_key", key);
          appInstance.renderActivePage();
        }
      });
    }

    // 2. Disconnect key button
    if (disconnectAiBtn) {
      disconnectAiBtn.addEventListener("click", () => {
        if (confirm("Deseja realmente desconectar o Lumen IA? Sua chave de API será apagada deste navegador.")) {
          localStorage.removeItem("lumen_gemini_key");
          appInstance.renderActivePage();
        }
      });
    }

    // 3. Handle messages submission
    const appendUserMessage = (text) => {
      const msgHtml = `
        <div class="ai-msg user-msg" style="display: flex; gap: 12px; max-width: 85%; align-self: flex-end; justify-content: flex-end;">
          <div style="background-color: var(--accent-primary-glow); border: 1px solid var(--accent-primary); padding: 12px 16px; border-radius: 12px 0 12px 12px; font-size: 13px; line-height: 1.5; color: var(--text-main);">
            ${AiPage.escapeHtml(text)}
          </div>
          <div style="background-color: var(--accent-primary-glow); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--accent-primary); font-weight: 700; font-size: 10px;">
            VC
          </div>
        </div>
      `;
      aiChatMessages.insertAdjacentHTML("beforeend", msgHtml);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    };

    const appendAssistantMessage = (htmlContent) => {
      const msgHtml = `
        <div class="ai-msg assistant-msg animate-fade-in" style="display: flex; gap: 12px; max-width: 85%;">
          <div style="background-color: var(--color-income-bg); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: var(--color-income);"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/></svg>
          </div>
          <div style="background-color: var(--bg-sidebar); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 0 12px 12px 12px; font-size: 13px; line-height: 1.5; color: var(--text-main);">
            ${htmlContent}
          </div>
        </div>
      `;
      aiChatMessages.insertAdjacentHTML("beforeend", msgHtml);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    };

    const appendLoadingIndicator = () => {
      const loaderHtml = `
        <div class="ai-msg assistant-msg loading-msg" style="display: flex; gap: 12px; max-width: 85%;">
          <div style="background-color: var(--color-income-bg); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: var(--color-income);"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/></svg>
          </div>
          <div style="background-color: var(--bg-sidebar); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 0 12px 12px 12px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 12px; color: var(--text-muted);">Lumen IA está analisando seus dados...</span>
            <div class="pulse-dot" style="width:6px; height:6px; border-radius:50%; background-color:var(--color-income); animation: pulse 1.2s infinite ease-in-out;"></div>
          </div>
        </div>
      `;
      aiChatMessages.insertAdjacentHTML("beforeend", loaderHtml);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    };

    const removeLoadingIndicator = () => {
      const loader = aiChatMessages.querySelector(".loading-msg");
      if (loader) loader.remove();
    };

    const queryGemini = async (userPrompt) => {
      const apiKey = localStorage.getItem("lumen_gemini_key");
      if (!apiKey) return;

      appendUserMessage(userPrompt);
      appendLoadingIndicator();

      const context = AiPage.constructContext(app);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${context}\n\nPERGUNTA DO USUÁRIO:\n"${userPrompt}"`
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar a resposta.";
        const formattedHtml = AiPage.formatMarkdown(replyText);
        
        removeLoadingIndicator();
        appendAssistantMessage(formattedHtml);
      } catch (err) {
        removeLoadingIndicator();
        appendAssistantMessage(`<span style="color:var(--color-expense); font-weight:600;">⚠️ Erro de conexão com a API do Gemini:</span><br>${AiPage.escapeHtml(err.message)}`);
      }
    };

    // Form send event
    if (aiChatForm) {
      aiChatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inputEl = document.getElementById("ai-chat-input");
        const prompt = inputEl.value.trim();
        if (!prompt) return;

        inputEl.value = "";
        await queryGemini(prompt);
      });
    }

    // Suggestion buttons click trigger
    suggestBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const prompt = e.currentTarget.getAttribute("data-prompt");
        if (prompt) {
          await queryGemini(prompt);
        }
      });
    });
  }

  static escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  static formatMarkdown(text) {
    let html = AiPage.escapeHtml(text);

    // Bold tags
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bold lists/titles
    html = html.replace(/^\*\s(.*)$/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');
    html = html.replace(/^-\s(.*)$/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');

    // Paragraph line breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  static constructContext(app) {
    const today = "2026-07-13"; // Baseline today

    // Calculate actual balances
    const balances = {};
    app.accounts.forEach(a => {
      balances[a.name] = app.getAccountBalance(a.id, today);
    });

    // Extract active transactions
    const activeTxs = app.getActiveTransactions();
    
    // Sort transactions chronologically (newest first, keep up to 100 for context bounds)
    activeTxs.sort((a, b) => b.date.localeCompare(a.date));
    
    const txSummary = activeTxs.slice(0, 100).map(t => {
      const cat = app.categories.find(c => c.id === t.category_id)?.name || 'Sem Categoria';
      const acc = app.accounts.find(a => a.id === t.account_id)?.name || 'Sem Conta';
      return `- Data: ${t.date}, Desc: ${t.description}, Categoria: ${cat}, Conta: ${acc}, Responsável: ${t.member || 'Casal'}, Valor: R$ ${t.amount.toFixed(2)}, Status: ${t.status}`;
    });

    return `
Você é o "Lumen IA", um analista e planejador financeiro de elite. Você foi contratado pelo casal Paula e Alcides para ajudá-los na tomada de decisões financeiras.
Os dados financeiros consolidados de Paula e Alcides hoje (${today}) são:

SALDOS CONSOLIDADOS HOJE:
${Object.entries(balances).map(([name, bal]) => `- ${name}: R$ ${bal.toFixed(2)}`).join('\n')}

TRANSAÇÕES MAIS RECENTES (ÚLTIMAS 100 ENTRE PLANEJADOS E REALIZADOS):
${txSummary.join('\n')}
${activeTxs.length > 100 ? `(Mais ${activeTxs.length - 100} transações foram omitidas para manter a velocidade do contexto)` : ''}

INSTRUÇÕES DO SEU PAPEL:
1. Responda em português brasileiro de forma direta, clara e acolhedora.
2. Identifique os maiores ralos financeiros do casal (onde estão os maiores gastos).
3. Ajude-os a entender se correm riscos de fechar no vermelho nos próximos meses com base nas transações planejadas.
4. Foque em oportunidades para o "YTG" (Year-to-Go, restante de 2026).
5. Como assessor financeiro, dê dicas construtivas de economia, mas não seja julgador.
    `;
  }
}
