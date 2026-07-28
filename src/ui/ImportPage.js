class ImportPage {
  static render(app, state) {
    const today = new Date().toLocaleDateString('en-CA'); // Dynamic local date

    // 1. Check if there is an active preview/validation state
    let mainViewHtml = '';
    const importState = state.importState || { status: 'idle', errors: [], transactions: [], filename: '', fileText: '' };
    
    if (importState.status === 'idle') {
      mainViewHtml = `
        <div class="dropzone-card" id="csv-dropzone" style="margin-bottom: 24px;">
          <svg class="dropzone-icon" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
          <h3>Importar Planilha Financeira</h3>
          <p>Arraste e solte o seu arquivo CSV aqui ou clique para selecionar</p>
          <input type="file" id="csv-file-input" class="file-input" accept=".csv">
        </div>

        <!-- CSV Column Dictionary Helper -->
        <div class="section-card" style="margin-bottom: 24px;">
          <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-secondary); margin-bottom:12px;">
            Estrutura Obrigatória do CSV (Dicionário de Colunas)
          </h4>
          <p style="color:var(--text-muted); font-size:12px; margin-bottom:16px; line-height:1.5;">
            O arquivo CSV deve conter exatamente o cabeçalho abaixo. O separador recomendado é o <strong>ponto-e-vírgula (;)</strong> com decimais separados por <strong>vírgula (,)</strong>, facilitando o uso direto do Excel em português!
            Se a categoria ou conta digitada não existir no sistema, o Lumen a criará de forma automática.
          </p>
          <div class="data-table-wrapper" style="margin-bottom:16px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:120px;">Nome da Coluna</th>
                  <th style="width:120px;">Tipo de Dado</th>
                  <th>Descrição da Coluna</th>
                  <th style="width:180px;">Exemplo de Preenchimento</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Data</strong></td>
                  <td>Texto / Data</td>
                  <td>Dia da movimentação no formato brasileiro ou padrão internacional.</td>
                  <td><code>13/07/2026</code> ou <code>2026-07-13</code></td>
                </tr>
                <tr>
                  <td><strong>Descricao</strong></td>
                  <td>Texto</td>
                  <td>Nome ou descrição da transação.</td>
                  <td><code>Supermercado Semanal</code></td>
                </tr>
                <tr>
                  <td><strong>Valor</strong></td>
                  <td>Numérico</td>
                  <td>Valor em BRL. Use sinal negativo <strong>(-)</strong> para despesas e positivo para receitas.</td>
                  <td><code>-180,50</code> ou <code>4500,00</code></td>
                </tr>
                <tr>
                  <td><strong>Categoria</strong></td>
                  <td>Texto</td>
                  <td>Classificação da movimentação.</td>
                  <td><code>Alimentação</code>, <code>Salário</code></td>
                </tr>
                <tr>
                  <td><strong>Conta</strong></td>
                  <td>Texto</td>
                  <td>De qual conta de origem é o saldo.</td>
                  <td><code>Conta Corrente</code>, <code>Reserva</code></td>
                </tr>
                <tr>
                  <td><strong>Responsável</strong></td>
                  <td>Texto (Opcional)</td>
                  <td>Membro do casal proprietário da transação. Se omitido, assume "Casal".</td>
                  <td><code>Paula</code>, <code>Alcides</code> ou <code>Casal</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h5 style="font-size:11px; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">Exemplo de arquivo (Copiar e colar no Bloco de Notas e salvar como .csv):</h5>
          <pre style="background-color:var(--bg-base); padding:10px 12px; border-radius:var(--border-radius-md); font-family:monospace; font-size:11px; color:var(--accent-secondary); border:1px solid var(--border-color); overflow-x:auto;">Data;Descricao;Valor;Categoria;Conta;Responsável
13/07/2026;Salário Paula;4500,00;Salário;Conta Corrente;Paula
14/07/2026;Aluguel Mensal;-2500,00;Moradia;Conta Corrente;Casal
15/07/2026;Supermercado;-320,50;Alimentação;Conta Corrente;Alcides</pre>
        </div>
      `;
    } else if (importState.status === 'validating') {
      const hasErrors = importState.errors.length > 0;
      
      let alertBanner = '';
      let previewTableRows = '';
      
      if (hasErrors) {
        alertBanner = `
          <div class="errors-box">
            <h4>Inconsistências Encontradas (${importState.errors.length})</h4>
            <ul class="errors-list">
              ${importState.errors.map(err => `<li>• ${err}</li>`).join('')}
            </ul>
          </div>
        `;
      } else {
        alertBanner = `
          <div style="background-color: var(--color-income-bg); border: 1px solid hsla(142, 69%, 58%, 0.15); border-radius: var(--border-radius-md); padding: 16px; color: var(--color-income); font-weight: 500; font-size: 13px;">
            ✓ Planilha validada com sucesso! Nenhuma inconsistência encontrada.
          </div>
        `;

        // Track already matched planned and duplicate transactions to avoid duplicate matches in preview
        const alreadyMatched = [];
        const alreadyMatchedDuplicate = [];

        importState.transactions.forEach(row => {
          const accExists = app.allAccounts.some(a => a.name.toLowerCase() === row.accountName.toLowerCase() && a.is_active);
          const catExists = app.categories.some(c => c.name.toLowerCase() === row.categoryName.toLowerCase() && c.is_active);
          const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(row.amount));
          const amountClass = row.amount > 0 ? 'amount-in' : 'amount-out';
          const sign = row.amount > 0 ? '+' : '-';
          const formattedDate = row.date.split('-').reverse().join('/');

          // Member badge for preview
          let memberBadge = '';
          if (row.member === 'Paula') {
            memberBadge = `<span class="badge" style="background-color:hsla(320, 80%, 60%, 0.15); color:hsl(320, 80%, 75%); border:1px solid hsla(320, 80%, 60%, 0.25);">Paula</span>`;
          } else if (row.member === 'Alcides') {
            memberBadge = `<span class="badge" style="background-color:hsla(200, 85%, 55%, 0.15); color:hsl(200, 85%, 70%); border:1px solid hsla(200, 85%, 55%, 0.25);">Alcides</span>`;
          } else {
            memberBadge = `<span class="badge" style="background-color:var(--bg-base); color:var(--text-secondary); border:1px solid var(--border-color);">Casal</span>`;
          }

          // Strict monthly candidates for manual dropdown link
          const rowMonth = row.date.substring(0, 7);
          const rowAcc = app.allAccounts.find(a => a.name.toLowerCase() === row.accountName.toLowerCase() && a.is_active);
          const monthPlannedTxs = app.getActiveTransactions().filter(t => {
            if (t.status !== 'planned') return false;
            if (rowAcc && t.account_id !== rowAcc.id) return false;
            return t.date.substring(0, 7) === rowMonth;
          });

          // Try to find a matching planned transaction in the database
          const matchedPlanned = app.findMatchingPlannedTransaction(row, alreadyMatched);
          // Try to find a matching duplicate transaction (already imported/created)
          const matchedDuplicate = app.findMatchingDuplicateTransaction(row, today, alreadyMatchedDuplicate);

          let actionCell = '';
          let descHtml = `style="font-weight:600;"`;
          let descSubtitle = '';

          if (matchedPlanned) {
            alreadyMatched.push(matchedPlanned.id);
            
            const rowAmount = Number(row.amount);
            const tAmount = Number(matchedPlanned.amount || 0);
            const tolerance = Math.abs(rowAmount) * 0.20;
            const isDiscrepant = Math.abs(tAmount - rowAmount) > tolerance;
            const formattedPlannedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(tAmount));

            if (isDiscrepant) {
              descSubtitle = `<div style="font-size:10px; color:hsl(35, 90%, 60%); margin-top:2px; font-weight:700;">⚠️ Substitui (Valor divergente): ${matchedPlanned.description} (${formattedPlannedAmount})</div>`;
            } else {
              descSubtitle = `<div style="font-size:10px; color:var(--accent-secondary); margin-top:2px; font-weight:normal;">🔗 Substitui: ${matchedPlanned.description} (Previsto)</div>`;
            }

            actionCell = `
              <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                <input type="checkbox" class="reconcile-checkbox" data-row-num="${row.row}" data-planned-id="${matchedPlanned.id}" checked style="cursor:pointer; width:16px; height:16px; accent-color:var(--accent-secondary);">
                <span style="font-size:9px; color:var(--accent-secondary); font-weight:600;">Substituir</span>
              </div>
            `;
          } else if (matchedDuplicate) {
            alreadyMatchedDuplicate.push(matchedDuplicate.id);
            
            descSubtitle = `<div style="font-size:10px; color:var(--color-expense); margin-top:2px; font-weight:700;">⚠️ Já Importado (Duplicado?): ${matchedDuplicate.description} (${formattedAmount})</div>`;
            
            actionCell = `
              <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                <input type="checkbox" class="import-row-checkbox" data-row-num="${row.row}" style="cursor:pointer; width:16px; height:16px; accent-color:var(--color-expense);">
                <span style="font-size:9px; color:var(--color-expense); font-weight:600;">Pular</span>
              </div>
            `;
          } else if (monthPlannedTxs.length > 0) {
            // No auto match, but candidates exist for manual link
            const availableCandidates = monthPlannedTxs.filter(c => !alreadyMatched.includes(c.id));
            if (availableCandidates.length > 0) {
              actionCell = `
                <div style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" class="import-row-checkbox" data-row-num="${row.row}" checked style="cursor:pointer; width:14px; height:14px; accent-color:var(--color-income);">
                  <select class="reconcile-select" data-row-num="${row.row}" style="font-size: 11px; padding: 4px; border: 1px solid var(--border-color); background-color: var(--bg-sidebar); color: var(--text-secondary); border-radius: 4px; width: 140px; cursor: pointer;">
                    <option value="">-- Novo (Vincular?) --</option>
                    ${availableCandidates.map(c => {
                      const fmtCVal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.abs(c.amount));
                      const cDate = c.date.split('-').reverse().slice(0, 2).join('/');
                      return `<option value="${c.id}">${c.description} (${cDate} - ${fmtCVal})</option>`;
                    }).join('')}
                  </select>
                </div>
              `;
            } else {
              actionCell = `
                <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                  <input type="checkbox" class="import-row-checkbox" data-row-num="${row.row}" checked style="cursor:pointer; width:16px; height:16px; accent-color:var(--color-income);">
                  <span style="font-size:9px; color:var(--color-income); font-weight:600;">Novo</span>
                </div>
              `;
            }
          } else {
            actionCell = `
              <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                <input type="checkbox" class="import-row-checkbox" data-row-num="${row.row}" checked style="cursor:pointer; width:16px; height:16px; accent-color:var(--color-income);">
                <span style="font-size:9px; color:var(--color-income); font-weight:600;">Novo</span>
              </div>
            `;
          }

          previewTableRows += `
            <tr>
              <td style="text-align: center; vertical-align: middle;">${actionCell}</td>
              <td>L${row.row}</td>
              <td>${formattedDate}</td>
              <td>
                <div ${descHtml}>${row.description}</div>
                ${descSubtitle}
              </td>
              <td>
                <span class="account-tag" style="background-color: var(--bg-base); border: 1px solid var(--border-color);">
                  ${row.accountName} ${!accExists ? '<span style="color:var(--accent-secondary); font-size:9px; font-weight:700;">(Nova)</span>' : ''}
                </span>
              </td>
              <td>
                <span class="account-tag" style="background-color: var(--bg-base); border: 1px solid var(--border-color);">
                  ${row.categoryName} ${!catExists ? '<span style="color:var(--accent-primary); font-size:9px; font-weight:700;">(Nova)</span>' : ''}
                </span>
              </td>
              <td>${memberBadge}</td>
              <td class="${amountClass}" style="font-weight: 700; font-family: 'Inter', sans-serif;">
                ${sign}${formattedAmount}
              </td>
            </tr>
          `;
        });
      }

      mainViewHtml = `
        <div class="validation-card section-card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
            <h3>Visualização de Lote: ${importState.filename}</h3>
            <span class="badge ${hasErrors ? 'badge-planned' : 'badge-confirmed'}">${importState.transactions.length} transações</span>
          </div>

          ${alertBanner}

          ${!hasErrors ? `
            <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-secondary);">Pré-visualização dos lançamentos</h4>
            <div class="preview-table-box">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 70px; text-align: center;">Conciliar</th>
                    <th style="width: 50px;">Linha</th>
                    <th style="width: 100px;">Data</th>
                    <th>Descrição</th>
                    <th style="width: 150px;">Conta Mapeada</th>
                    <th style="width: 150px;">Categoria Mapeada</th>
                    <th style="width: 110px;">Responsável</th>
                    <th style="width: 130px;">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${previewTableRows}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="validation-actions">
            <button class="btn btn-secondary" id="import-cancel-btn">Descartar Lote</button>
            ${!hasErrors ? `<button class="btn btn-primary" id="import-confirm-btn">Confirmar Importação</button>` : ''}
          </div>
        </div>
      `;
    }

    // 2. Render Import Batches History list
    let historyRows = '';
    const batches = app.batches || [];
    const sortedBatches = [...batches].sort((a, b) => b.imported_at.localeCompare(a.imported_at));

    if (sortedBatches.length === 0) {
      historyRows = `
        <tr>
          <td colspan="5" class="empty-state" style="padding: 24px;">
            Nenhum lote importado anteriormente.
          </td>
        </tr>
      `;
    } else {
      sortedBatches.forEach(b => {
        const importDate = new Date(b.imported_at);
        const formattedDate = `${String(importDate.getDate()).padStart(2, '0')}/${String(importDate.getMonth() + 1).padStart(2, '0')}/${importDate.getFullYear()} às ${String(importDate.getHours()).padStart(2, '0')}:${String(importDate.getMinutes()).padStart(2, '0')}`;
        
        let statusBadge = '';
        let actionBtn = '';
        if (b.status === 'active') {
          statusBadge = `<span class="badge badge-confirmed">Importado</span>`;
          actionBtn = `<button class="btn btn-danger rollback-batch-btn" data-batch-id="${b.id}" style="padding: 4px 8px; font-size:11px;">Reverter</button>`;
        } else {
          statusBadge = `<span class="badge badge-planned" style="background-color:rgba(180,50,50,0.15); color:hsl(350, 40%, 65%);">Revertido</span>`;
          actionBtn = `<span style="font-size:11px; color:var(--text-muted);">Já Revertido</span>`;
        }

        historyRows += `
          <tr>
            <td style="font-weight:600;">${formattedDate}</td>
            <td>${b.filename}</td>
            <td>${b.transaction_ids.length}</td>
            <td>${statusBadge}</td>
            <td style="text-align: right;">${actionBtn}</td>
          </tr>
        `;
      });
    }

    return `
      <div class="import-grid animate-fade-in">
        
        <!-- Main upload panel -->
        ${mainViewHtml}

        <!-- Import History Table -->
        <div class="section-card">
          <h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">Lotes de Importação</h3>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 200px;">Data da Importação</th>
                  <th>Arquivo Planilha</th>
                  <th style="width: 100px;">Transações</th>
                  <th style="width: 120px;">Status</th>
                  <th style="width: 120px; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    const dropzone = document.getElementById("csv-dropzone");
    const fileInput = document.getElementById("csv-file-input");
    const cancelBtn = document.getElementById("import-cancel-btn");
    const confirmBtn = document.getElementById("import-confirm-btn");
    
    const todayStr = new Date().toLocaleDateString('en-CA'); // App baseline date

    // Idle dropzone setup
    if (dropzone) {
      dropzone.addEventListener("click", () => fileInput.click());
      
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      
      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });
      
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      });
      
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) handleFile(file);
      });
    }

    const processCsvText = (text, filename) => {
      const parsed = CsvParser.parse(text);
      
      state.importState = {
        status: 'validating',
        filename: filename,
        fileText: text,
        errors: parsed.errors,
        transactions: parsed.transactions
      };
      appInstance.renderActivePage(); // Update UI to validation screen
    };

    const handleFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        
        // Auto-detect Portuguese Excel encoding (ISO-8859-1 / Windows-1252)
        // If the text contains the Unicode replacement character \ufffd, it means UTF-8 decoding failed,
        // so we automatically fallback and read it as ISO-8859-1
        if (text.includes('\ufffd')) {
          const retryReader = new FileReader();
          retryReader.onload = (evt) => {
            processCsvText(evt.target.result, file.name);
          };
          retryReader.readAsText(file, "ISO-8859-1");
        } else {
          processCsvText(text, file.name);
        }
      };
      reader.readAsText(file, "UTF-8");
    };

    // Validation screen action handlers
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        state.importState = { status: 'idle', errors: [], transactions: [], filename: '', fileText: '' };
        appInstance.renderActivePage(); // Reload default page
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        const text = state.importState.fileText;
        const filename = state.importState.filename;
        
        // Scan the DOM for selected reconciliations and ignored rows
        const reconciliations = {};
        const ignoredRowNums = [];

        // Check planned matches
        const reconcileCheckboxes = document.querySelectorAll(".reconcile-checkbox");
        reconcileCheckboxes.forEach(cb => {
          const rowNum = Number(cb.getAttribute("data-row-num"));
          if (cb.checked) {
            const plannedId = cb.getAttribute("data-planned-id");
            reconciliations[rowNum] = plannedId;
          } else {
            ignoredRowNums.push(rowNum);
          }
        });

        // Check new/duplicate transaction checkboxes
        const importCheckboxes = document.querySelectorAll(".import-row-checkbox");
        importCheckboxes.forEach(cb => {
          const rowNum = Number(cb.getAttribute("data-row-num"));
          if (!cb.checked) {
            ignoredRowNums.push(rowNum);
          }
        });

        // Check manual dropdown selection
        const dropdowns = document.querySelectorAll(".reconcile-select");
        dropdowns.forEach(sel => {
          const rowNum = Number(sel.getAttribute("data-row-num"));
          const plannedId = sel.value;
          if (plannedId) {
            reconciliations[rowNum] = plannedId;
            // If linked manually, make sure it is not in the ignored list
            const idx = ignoredRowNums.indexOf(rowNum);
            if (idx > -1) {
              ignoredRowNums.splice(idx, 1);
            }
          }
        });

        try {
          const res = await app.importTransactions(text, filename, todayStr, reconciliations, ignoredRowNums);
          if (res.success) {
            alert(`Lote "${filename}" importado com sucesso! ${res.count} transações cadastradas.`);
            state.importState = { status: 'idle', errors: [], transactions: [], filename: '', fileText: '' };
            
            // Update sidebar badge
            if (typeof appInstance.updateTasksBadge === 'function') {
              appInstance.updateTasksBadge();
            }
            appInstance.renderActivePage(); // Return to idle/refresh batch history
          } else {
            alert("Erro durante importação: " + res.errors.join("\n"));
          }
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Rollback batch trigger
    const rollbackBtns = document.querySelectorAll(".rollback-batch-btn");
    rollbackBtns.forEach(btn => {
      btn.addEventListener("click", async () => {
        const batchId = btn.getAttribute("data-batch-id");
        const batch = app.batches.find(b => b.id === batchId);
        
        if (confirm(`Atenção! Você deseja reverter a importação do lote "${batch.filename}"?\nIsso irá desativar todas as ${batch.transaction_ids.length} transações importadas por este arquivo e recalcular os saldos instantaneamente.`)) {
          try {
            await app.rollbackImportBatch(batchId);
            alert("Saldos revertidos com sucesso!");
            
            if (typeof appInstance.updateTasksBadge === 'function') {
              appInstance.updateTasksBadge();
            }
            appInstance.renderActivePage(); // Reload history
          } catch (err) {
            alert(err.message);
          }
        }
      });
    });
  }
}
