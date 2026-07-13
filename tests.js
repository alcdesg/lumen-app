// QA Test Suite - executed in the browser context

// --- Micro Test Framework ---
const testCases = [];
let currentAssertions = [];

function test(name, fn) {
  testCases.push({ name, fn });
}

const expect = (actual) => {
  const assert = (passed, message) => {
    currentAssertions.push({ passed, message });
  };
  return {
    toBe(expected) {
      assert(actual === expected, `Esperava: "${expected}" (Recebido: "${actual}")`);
    },
    toEqual(expected) {
      const actJson = JSON.stringify(actual);
      const expJson = JSON.stringify(expected);
      assert(actJson === expJson, `Esperava estrutura: ${expJson} (Recebida: ${actJson})`);
    },
    toBeGreaterThan(expected) {
      assert(actual > expected, `Esperava que ${actual} fosse maior que ${expected}`);
    },
    toThrow() {
      let threw = false;
      try {
        actual();
      } catch (e) {
        threw = true;
      }
      assert(threw, "Esperava que a função disparasse um erro, mas ela executou com sucesso.");
    }
  };
};

// Mock Storage class to isolate tests
class MockStorage {
  constructor() {
    this.db = { accounts: [], categories: [], transactions: [], batches: [] };
  }
  async init() {}
  async loadData() { return this.db; }
  async saveData(data) { this.db = data; }
  isOneDriveConnected() { return false; }
}

// --- Test Definitions ---

// 1. Motor Financeiro
test("FinancialEngine.getIntensity - Limites de Intensidade Visual", () => {
  expect(FinancialEngine.getIntensity(-100)).toBe('negative');
  expect(FinancialEngine.getIntensity(500)).toBe('critical');
  expect(FinancialEngine.getIntensity(2500)).toBe('warning');
  expect(FinancialEngine.getIntensity(6000)).toBe('comfortable');
  expect(FinancialEngine.getIntensity(15000)).toBe('very_comfortable');
});

test("FinancialEngine.calculateDailyBalances - Projeção de fluxo de caixa", () => {
  const accounts = [
    new Account({ id: 'a1', name: 'Banco A', initial_balance: 1000 })
  ];
  const transactions = [
    new Transaction({ id: 't1', account_id: 'a1', category_id: 'c1', description: 'Past income', amount: 500, date: '2026-07-01', status: 'confirmed' }),
    new Transaction({ id: 't2', account_id: 'a1', category_id: 'c2', description: 'Future expense', amount: -200, date: '2026-07-15', status: 'planned' })
  ];

  // Calculate daily balances from 2026-07-10 to 2026-07-20
  const balances = FinancialEngine.calculateDailyBalances(accounts, transactions, '2026-07-10', '2026-07-20');
  
  // Starting balance on 2026-07-10 should include: initial (1000) + Past income on 2026-07-01 (500) = 1500
  expect(balances['2026-07-10'].balance).toBe(1500);
  
  // Balance on 2026-07-15 should subtract the future expense (-200) = 1300
  expect(balances['2026-07-15'].balance).toBe(1300);
  expect(balances['2026-07-15'].expense).toBe(200);

  // Balance on 2026-07-20 should remain 1300
  expect(balances['2026-07-20'].balance).toBe(1300);
});

test("FinancialEngine.calculateKPIs - Margem de Decisão e Próxima Receita", () => {
  const accounts = [new Account({ id: 'a1', name: 'Conta', initial_balance: 1000 })];
  const transactions = [
    // Pre-calculated inputs
    new Transaction({ id: 't1', account_id: 'a1', category_id: 'c1', description: 'Super', amount: -300, date: '2026-07-15', status: 'planned' }),
    new Transaction({ id: 't2', account_id: 'a1', category_id: 'c2', description: 'Salario', amount: 2000, date: '2026-07-20', status: 'planned' })
  ];

  const today = '2026-07-13';
  const dailyBalances = FinancialEngine.calculateDailyBalances(accounts, transactions, today, '2026-08-15');
  const kpis = FinancialEngine.calculateKPIs(dailyBalances, transactions, today);

  expect(kpis.cashToday).toBe(1000); // 1000 (no transactions before today)
  // Lowest point is on 2026-07-15 before salary: 1000 - 300 = 700. Salary on 2026-07-20 raises it.
  expect(kpis.lowestBalance).toBe(700);
  expect(kpis.lowestBalanceDate).toBe('2026-07-15');
  expect(kpis.decisionMargin).toBe(700); // Margem de Decisão R$ 700
  expect(kpis.daysToNextIncome).toBe(7); // from 13 to 20 = 7 days
});

// 2. Validação e Versionamento
test("Transaction - Edição gera nova versão e preserva histórico", () => {
  const txV1 = new Transaction({
    id: 'tx-test',
    version: 1,
    account_id: 'a1',
    category_id: 'c1',
    description: 'Gasolina',
    amount: -100,
    date: '2026-07-10',
    status: 'confirmed'
  });

  expect(txV1.validate()).toBe(true);

  // Edit version
  const txV2 = txV1.createNewVersion({ amount: -120 });
  expect(txV2.version).toBe(2);
  expect(txV2.id).toBe('tx-test'); // Matches original logical ID
  expect(txV2.amount).toBe(-120); // Updated value
  expect(txV2.date).toBe('2026-07-10'); // Cloned value
  expect(txV2.is_active).toBe(true); // Active version
});

test("Transaction - Validações de campos de domínio", () => {
  // Empty description should throw
  const badTx = new Transaction({ account_id: 'a1', category_id: 'c1', description: '', amount: -10, date: '2026-07-10' });
  expect(() => badTx.validate()).toThrow();

  // Value zero should throw
  const badValTx = new Transaction({ account_id: 'a1', category_id: 'c1', description: 'Gasolina', amount: 0, date: '2026-07-10' });
  expect(() => badValTx.validate()).toThrow();

  // Invalid date format should throw
  const badDateTx = new Transaction({ account_id: 'a1', category_id: 'c1', description: 'Gasolina', amount: -20, date: '10/07/2026' });
  expect(() => badDateTx.validate()).toThrow();
});

// 3. Aplicação / Casos de Uso
test("LumenApp - Adicionar, Editar e Excluir Transação com Histórico de Versões", async () => {
  const app = new LumenApp(new MockStorage());
  
  // Set up accounts and categories
  app.accounts.push(new Account({ id: 'a1', name: 'Conta Corrente', initial_balance: 1000 }));
  app.categories.push(new Category({ id: 'c1', name: 'Mercado', type: 'expense' }));

  // 1. Add Transaction (v1)
  const tx = app.addTransaction({
    account_id: 'a1',
    category_id: 'c1',
    description: 'Compras',
    amount: -150,
    date: '2026-07-12',
    status: 'confirmed'
  });
  
  expect(tx.version).toBe(1);
  expect(app.transactions.length).toBe(1);
  expect(app.getActiveTransactions().length).toBe(1);

  // 2. Edit Transaction (creates v2, deactivates v1)
  const txV2 = app.updateTransaction(tx.id, { description: 'Supermercado', amount: -180 });
  expect(txV2.version).toBe(2);
  expect(app.transactions.length).toBe(2); // In-memory database keeps both rows
  expect(app.getActiveTransactions().length).toBe(1); // Only one is active
  
  const originalTx = app.transactions.find(t => t.id === tx.id && t.version === 1);
  expect(originalTx.is_active).toBe(false); // Version 1 is deactivated
  expect(originalTx.replaced_by_version).toBe(2);

  // 3. Soft-delete Transaction (creates v3 marked as deleted, deactivates v2)
  app.deleteTransaction(tx.id);
  expect(app.transactions.length).toBe(3); // Maintains all 3 versions for audit
  expect(app.getActiveTransactions().length).toBe(0); // None are active anymore
  
  const finalVer = app.getTransactionHistory(tx.id)[2]; // Get version 3
  expect(finalVer.is_deleted).toBe(true);
  expect(finalVer.is_active).toBe(false);
});

// 4. Importação e Reversão
test("CsvParser - Importação robusta e conversão decimal", () => {
  const csvText = `Data;Descrição;Valor;Categoria;Conta\n` + 
                  `10/07/2026;Supermercado;R$ -1.250,50;Alimentação;Itaú\n` +
                  `2026-07-12;Salário;3500;Salário;Carteira`;
                  
  const parsed = CsvParser.parse(csvText);
  expect(parsed.errors.length).toBe(0);
  expect(parsed.transactions.length).toBe(2);

  // Check currency normalization (PT-BR format to BRL float)
  expect(parsed.transactions[0].amount).toBe(-1250.5);
  expect(parsed.transactions[0].date).toBe("2026-07-10");
  expect(parsed.transactions[0].categoryName).toBe("Alimentação");
  expect(parsed.transactions[0].accountName).toBe("Itaú");

  // Check standard format parsed correctly
  expect(parsed.transactions[1].amount).toBe(3500);
  expect(parsed.transactions[1].date).toBe("2026-07-12");
});

test("LumenApp - Lote de Importação CSV e Rollback", async () => {
  const app = new LumenApp(new MockStorage());
  const csvText = `Data,Descrição,Valor,Categoria,Conta\n` + 
                  `2026-07-10,Jantar Fino,-300.00,Lazer,Itaú\n` +
                  `2026-07-11,Gasolina,-150.00,Transporte,Itaú`;
  
  const today = '2026-07-13';

  // Import batch
  const res = await app.importTransactions(csvText, "fatura.csv", today);
  expect(res.success).toBe(true);
  expect(app.transactions.length).toBe(2); // 2 transactions imported
  expect(app.batches.length).toBe(1); // 1 batch recorded
  expect(app.batches[0].status).toBe('active');

  // Verify accounts and categories were created on the fly
  expect(app.accounts.length).toBe(1);
  expect(app.accounts[0].name).toBe("Itaú");
  expect(app.categories.length).toBe(2); // Lazer & Transporte

  // Perform Rollback
  await app.rollbackImportBatch(res.batchId);
  expect(app.batches[0].status).toBe('rolled_back');
  
  // All transactions in the batch should now be soft-deleted/inactive
  expect(app.getActiveTransactions().length).toBe(0);
  
  // Version 2 should exist as historical log for rollback
  expect(app.transactions.length).toBe(4); // 2 originals (v1) + 2 rollbacks (v2)
});

test("Transaction - Propriedade de Responsável (Paula / Alcides / Casal)", () => {
  const tx = new Transaction({
    account_id: 'a1',
    category_id: 'c1',
    description: 'Gasolina',
    amount: -100,
    date: '2026-07-10',
    member: 'Paula'
  });
  expect(tx.member).toBe('Paula');
  expect(tx.validate()).toBe(true);

  // Invalid member validation
  const badMemberTx = new Transaction({
    account_id: 'a1',
    category_id: 'c1',
    description: 'Gasolina',
    amount: -100,
    date: '2026-07-10',
    member: 'Tio Joao'
  });
  expect(() => badMemberTx.validate()).toThrow();
});

test("CsvParser - Importação com coluna de Responsável", () => {
  const csvText = `Data;Descrição;Valor;Categoria;Conta;Responsável\n` + 
                  `10/07/2026;Supermercado;R$ -1.250,50;Alimentação;Itaú;Paula\n` +
                  `11/07/2026;Gasolina;-150;Transporte;Itaú;Alcides\n` +
                  `12/07/2026;Aluguel;-2000;Moradia;Itaú;`; // default Casal
                  
  const parsed = CsvParser.parse(csvText);
  expect(parsed.errors.length).toBe(0);
  expect(parsed.transactions.length).toBe(3);
  expect(parsed.transactions[0].member).toBe('Paula');
  expect(parsed.transactions[1].member).toBe('Alcides');
  expect(parsed.transactions[2].member).toBe('Casal');
});

test("LumenApp - getPendingPlannedTransactions & reconcileTransaction", () => {
  const app = new LumenApp(new MockStorage());
  app.accounts.push(new Account({ id: 'a1', name: 'Banco A', initial_balance: 1000 }));
  app.categories.push(new Category({ id: 'c1', name: 'Luz', type: 'expense' }));

  // Add 1 past planned, 1 future planned, 1 past confirmed
  app.transactions.push(new Transaction({ id: 't1', account_id: 'a1', category_id: 'c1', description: 'Luz planejada', amount: -200, date: '2026-07-10', status: 'planned' }));
  app.transactions.push(new Transaction({ id: 't2', account_id: 'a1', category_id: 'c1', description: 'Luz futura', amount: -200, date: '2026-07-20', status: 'planned' }));
  app.transactions.push(new Transaction({ id: 't3', account_id: 'a1', category_id: 'c1', description: 'Luz paga', amount: -180, date: '2026-07-09', status: 'confirmed' }));

  const pending = app.getPendingPlannedTransactions('2026-07-13');
  expect(pending.length).toBe(1);
  expect(pending[0].id).toBe('t1');

  // Reconcile pending
  const reconciled = app.reconcileTransaction('t1', { amount: -215.50, date: '2026-07-11', status: 'confirmed' });
  expect(reconciled.version).toBe(2);
  expect(reconciled.status).toBe('confirmed');
  expect(reconciled.amount).toBe(-215.50);
  expect(reconciled.date).toBe('2026-07-11');
  
  // The original version should be inactive
  const original = app.transactions.find(t => t.id === 't1' && t.version === 1);
  expect(original.is_active).toBe(false);
  
  // The active transaction list should not have t1 as planned anymore
  expect(app.getPendingPlannedTransactions('2026-07-13').length).toBe(0);
});

test("LumenApp - findMatchingPlannedTransaction & CSV reconciliation flow", async () => {
  const app = new LumenApp(new MockStorage());
  app.accounts.push(new Account({ id: 'a1', name: 'Itaú', initial_balance: 1000 }));
  app.categories.push(new Category({ id: 'c1', name: 'Alimentação', type: 'expense' }));

  // Pre-existing planned expense
  app.transactions.push(new Transaction({ id: 't-planned', account_id: 'a1', category_id: 'c1', description: 'Supermercado Mensal', amount: -500, date: '2026-07-12', status: 'planned' }));

  const csvRowMatch = {
    row: 2,
    date: '2026-07-13', // +1 day (within +/- 5 days)
    description: 'Mercado Pão de Açúcar',
    amount: -510.50, // within 20% of -500
    categoryName: 'Alimentação',
    accountName: 'Itaú'
  };

  const match = app.findMatchingPlannedTransaction(csvRowMatch);
  expect(match !== null).toBe(true);
  expect(match.id).toBe('t-planned');

  // Import with reconciliation
  const csvText = `Data;Descrição;Valor;Categoria;Conta\n13/07/2026;Mercado Pão de Açúcar;-510,50;Alimentação;Itaú`;
  const reconciliations = { 2: 't-planned' };

  const res = await app.importTransactions(csvText, "fatura.csv", "2026-07-13", reconciliations);
  expect(res.success).toBe(true);

  // Check that the planned transaction was updated to version 2 (confirmed)
  const activeTx = app.getActiveTransaction('t-planned');
  expect(activeTx.version).toBe(2);
  expect(activeTx.status).toBe('confirmed');
  expect(activeTx.amount).toBe(-510.5);

  // Check that no duplicate was created
  expect(app.getActiveTransactions().length).toBe(1);

  // Roll back the batch
  await app.rollbackImportBatch(res.batchId);
  // Reconciled transaction should revert back to planned version 1!
  const rolledBackActive = app.getActiveTransaction('t-planned');
  expect(rolledBackActive.version).toBe(1);
  expect(rolledBackActive.status).toBe('planned');
  expect(rolledBackActive.amount).toBe(-500);
});


// --- Execution Logic ---
async function runTests() {
  const testListBody = document.getElementById("test-list-body");
  const totalValEl = document.getElementById("total-val");
  const passValEl = document.getElementById("pass-val");
  const failValEl = document.getElementById("fail-val");
  const progressBar = document.getElementById("progress-bar");

  if (!testListBody) return;
  testListBody.innerHTML = "";

  let passedTestsCount = 0;
  let failedTestsCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tCase = testCases[i];
    currentAssertions = [];
    
    let errorMsg = null;
    try {
      tCase.fn();
    } catch (err) {
      errorMsg = err.message;
      currentAssertions.push({ passed: false, message: `Erro fatal no teste: ${errorMsg}` });
    }

    const testFailed = currentAssertions.some(a => !a.passed);
    if (testFailed) {
      failedTestsCount++;
    } else {
      passedTestsCount++;
    }

    // Render Test Case Card in HTML DOM
    const caseId = `case-${i}`;
    const testCaseDiv = document.createElement("div");
    testCaseDiv.className = `test-case`;
    testCaseDiv.id = caseId;

    let assertionsHtml = '';
    currentAssertions.forEach(a => {
      assertionsHtml += `
        <div class="assertion-line ${a.passed ? 'pass' : 'fail'}">
          <span class="assertion-dot ${a.passed ? 'dot-pass' : 'dot-fail'}"></span>
          <span>${a.message}</span>
        </div>
      `;
    });

    testCaseDiv.innerHTML = `
      <div class="test-case-header">
        <span>${tCase.name}</span>
        <span class="test-status-pill ${testFailed ? 'pill-fail' : 'pill-pass'}">${testFailed ? 'Falhou' : 'Passou'}</span>
      </div>
      <div class="test-case-details">
        ${assertionsHtml}
      </div>
    `;

    // Collapsible toggle
    testCaseDiv.querySelector(".test-case-header").addEventListener("click", () => {
      testCaseDiv.classList.toggle("expanded");
    });

    testListBody.appendChild(testCaseDiv);

    // Update progress bar
    const progress = ((i + 1) / testCases.length) * 100;
    progressBar.style.width = `${progress}%`;
    if (failedTestsCount > 0) {
      progressBar.classList.add("has-failed");
    }

    // Update real-time counters
    totalValEl.textContent = i + 1;
    passValEl.textContent = passedTestsCount;
    failValEl.textContent = failedTestsCount;
  }
}

// Start testing immediately on DOM ready
document.addEventListener("DOMContentLoaded", runTests);
