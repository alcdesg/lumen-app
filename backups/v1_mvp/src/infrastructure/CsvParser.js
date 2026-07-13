/**
 * CsvParser.js
 * 
 * Handles CSV file parsing, normalization, and validation.
 */
class CsvParser {
  /**
   * Auto-detects line and column separators and parses CSV text.
   * Expected columns: Data, Descricao, Valor, Categoria, Conta
   * 
   * @param {string} csvText The raw CSV file contents
   * @returns {Object} { transactions: Array, errors: Array }
   */
  static parse(csvText) {
    const errors = [];
    const normalizedTransactions = [];

    if (!csvText || !csvText.trim()) {
      errors.push("O arquivo CSV está vazio.");
      return { transactions: [], errors };
    }

    // Split rows (handling Windows and Unix line endings)
    const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
      errors.push("O arquivo deve conter pelo menos o cabeçalho e uma linha de dados.");
      return { transactions: [], errors };
    }

    // Detect delimiter in header (either , or ;)
    const header = lines[0];
    let delimiter = ',';
    if (header.includes(';')) {
      delimiter = ';';
    }

    // Split header columns
    const columns = header.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    // Column indices mapping
    const colMap = {
      date: columns.findIndex(c => c === 'data' || c === 'date'),
      description: columns.findIndex(c => c === 'descricao' || c === 'descrição' || c === 'description'),
      amount: columns.findIndex(c => c === 'valor' || c === 'amount' || c === 'value'),
      category: columns.findIndex(c => c === 'categoria' || c === 'category'),
      account: columns.findIndex(c => c === 'conta' || c === 'account')
    };

    // Validate headers
    const missingHeaders = [];
    if (colMap.date === -1) missingHeaders.push("Data");
    if (colMap.description === -1) missingHeaders.push("Descricao");
    if (colMap.amount === -1) missingHeaders.push("Valor");
    if (colMap.category === -1) missingHeaders.push("Categoria");
    if (colMap.account === -1) missingHeaders.push("Conta");

    if (missingHeaders.length > 0) {
      errors.push(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}. Cabeçalhos encontrados: ${columns.join(', ')}`);
      return { transactions: [], errors };
    }

    // Process rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Splitting columns with support for quoted strings (which might contain commas/semicolons)
      const values = this.splitCsvLine(line, delimiter);
      
      const rowNum = i + 1;

      // Extract raw values
      const rawDate = values[colMap.date];
      const rawDesc = values[colMap.description];
      const rawAmount = values[colMap.amount];
      const rawCat = values[colMap.category];
      const rawAcc = values[colMap.account];

      // Row level validations
      if (!rawDate || !rawDesc || !rawAmount || !rawCat || !rawAcc) {
        errors.push(`Linha ${rowNum}: Campos vazios ou incompletos.`);
        continue;
      }

      // 1. Normalize Date (DD/MM/YYYY or YYYY-MM-DD to YYYY-MM-DD)
      let finalDate = null;
      const cleanDateStr = rawDate.trim();
      
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanDateStr)) {
        const [d, m, y] = cleanDateStr.split('/');
        finalDate = `${y}-${m}-${d}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateStr)) {
        finalDate = cleanDateStr;
      } else {
        errors.push(`Linha ${rowNum}: Data inválida "${rawDate}". Formatos aceitos: DD/MM/AAAA ou AAAA-MM-DD.`);
        continue;
      }

      // Validate date object validity
      const parsedDate = new Date(finalDate + 'T12:00:00');
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Linha ${rowNum}: Data inexistente "${rawDate}".`);
        continue;
      }

      // 2. Normalize Amount (handles R$ symbol, dot thousands, comma decimals)
      let finalAmount = null;
      let cleanAmountStr = rawAmount.trim()
        .replace(/R\$\s?/, '') // Remove currency symbol
        .replace(/\s/g, '');   // Remove spaces

      // Detect and convert decimal system (European R$ 1.234,56 to standard 1234.56)
      if (cleanAmountStr.includes(',') && cleanAmountStr.includes('.')) {
        // e.g. -1.500,20 -> -1500.20
        cleanAmountStr = cleanAmountStr.replace(/\./g, '').replace(',', '.');
      } else if (cleanAmountStr.includes(',')) {
        // e.g. 350,50 -> 350.50 (or thousands like 1,500? In PT-BR it is decimal)
        // Check if there is only one comma and no dots: treat comma as decimal dot
        cleanAmountStr = cleanAmountStr.replace(',', '.');
      }

      finalAmount = Number(cleanAmountStr);
      if (isNaN(finalAmount) || finalAmount === 0) {
        errors.push(`Linha ${rowNum}: Valor inválido "${rawAmount}". O valor deve ser numérico e diferente de zero.`);
        continue;
      }

      // 3. Trim values
      const description = rawDesc.trim();
      const category = rawCat.trim();
      const account = rawAcc.trim();

      normalizedTransactions.push({
        row: rowNum,
        date: finalDate,
        description,
        amount: finalAmount,
        categoryName: category,
        accountName: account
      });
    }

    return {
      transactions: normalizedTransactions,
      errors
    };
  }

  /**
   * Helper to split a CSV line respecting quotes.
   */
  static splitCsvLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  }
}
