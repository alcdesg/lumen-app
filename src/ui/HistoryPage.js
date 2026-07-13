class HistoryPage {
  static render(app, state) {
    // 1. Gather all transaction versions (active and inactive, including deleted versions)
    // Sort them by updated_at descending to create a timeline of operations
    const allVersions = [...app.transactions]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

    let timelineHtml = '';

    if (allVersions.length === 0) {
      timelineHtml = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
          <h4>Sem histórico de auditoria</h4>
          <p>Nenhuma transação foi criada ou editada ainda.</p>
        </div>
      `;
    } else {
      timelineHtml = `<div class="history-flow">`;
      
      allVersions.forEach(txVer => {
        const importDate = new Date(txVer.updated_at);
        const formattedTime = `${String(importDate.getDate()).padStart(2, '0')}/${String(importDate.getMonth() + 1).padStart(2, '0')}/${importDate.getFullYear()} às ${String(importDate.getHours()).padStart(2, '0')}:${String(importDate.getMinutes()).padStart(2, '0')}`;
        
        let typeBadge = '';
        let markerClass = '';
        let detailText = '';
        const fmtAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(txVer.amount));
        const sign = txVer.amount > 0 ? '+' : '-';
        const acc = app.accounts.find(a => a.id === txVer.account_id) || { name: 'Sem Conta' };
        
        if (txVer.is_deleted) {
          // Exclusão
          typeBadge = `<span class="badge badge-planned" style="background-color: var(--color-expense-bg); color: var(--color-expense);">Exclusão</span>`;
          markerClass = 'marker-delete';
          detailText = `A movimentação "${txVer.description}" de valor ${sign}${fmtAmount} na conta "${acc.name}" foi marcada como excluída (Versão ${txVer.version}).`;
        } else if (txVer.version === 1) {
          // Criação
          typeBadge = `<span class="badge badge-confirmed">Criação</span>`;
          markerClass = 'marker-create';
          const batchInfo = txVer.import_batch_id ? ` (Importada via planilha)` : '';
          detailText = `Nova movimentação "${txVer.description}" criada com valor ${sign}${fmtAmount} na conta "${acc.name}" para o dia ${txVer.date.split('-').reverse().join('/')}${batchInfo}.`;
        } else {
          // Edição (find predecessor, which is version = current.version - 1)
          typeBadge = `<span class="badge badge-planned">Edição</span>`;
          markerClass = 'marker-update';
          
          const prevVer = app.transactions.find(t => t.id === txVer.id && t.version === txVer.version - 1);
          let changes = [];
          if (prevVer) {
            if (prevVer.description !== txVer.description) {
              changes.push(`Descrição: de "${prevVer.description}" para "${txVer.description}"`);
            }
            if (prevVer.amount !== txVer.amount) {
              const prevAmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(prevVer.amount));
              changes.push(`Valor: de ${prevVer.amount > 0 ? '+' : '-'}${prevAmt} para ${sign}${fmtAmount}`);
            }
            if (prevVer.date !== txVer.date) {
              changes.push(`Data: de ${prevVer.date.split('-').reverse().join('/')} para ${txVer.date.split('-').reverse().join('/')}`);
            }
            if (prevVer.account_id !== txVer.account_id) {
              const prevAcc = app.accounts.find(a => a.id === prevVer.account_id) || { name: 'Sem Conta' };
              changes.push(`Conta: de "${prevAcc.name}" para "${acc.name}"`);
            }
            if (prevVer.status !== txVer.status) {
              changes.push(`Status: de "${prevVer.status === 'confirmed' ? 'Realizado' : 'Previsto'}" para "${txVer.status === 'confirmed' ? 'Realizado' : 'Previsto'}"`);
            }
          }
          
          detailText = `A movimentação "${txVer.description}" foi editada para a Versão ${txVer.version}.<br>` + 
                       `<div class="log-detail">${changes.length > 0 ? changes.join('<br>') : 'Nenhuma alteração nos dados principais.'}</div>`;
        }

        timelineHtml += `
          <div class="log-item">
            <div class="log-marker ${markerClass}"></div>
            <div class="log-content">
              <div class="log-title">
                <span>Versão ${txVer.version} - ID Lógico: ${txVer.id}</span>
                <span class="log-time">${formattedTime}</span>
              </div>
              <div class="log-desc">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom: 6px;">
                  ${typeBadge}
                  <strong style="color:var(--text-main); font-size:13px;">${txVer.description}</strong>
                </div>
                <p style="line-height:1.4;">${detailText}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      timelineHtml += `</div>`;
    }

    return `
      <div class="section-card animate-fade-in" style="max-width: 900px; margin: 0 auto;">
        <h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 24px;">
          Histórico de Auditoria & Versionamento
        </h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-top: -16px; margin-bottom: 24px;">
          Toda alteração de lançamentos gera uma nova versão para manter a integridade histórica dos saldos projetados. 
          Audite abaixo a trilha cronológica das ações.
        </p>
        
        ${timelineHtml}
      </div>
    `;
  }

  static initEvents(app, state, appInstance) {
    // Audit timeline page is read-only
  }
}
