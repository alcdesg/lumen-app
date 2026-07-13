/**
 * FinancialEngine.js
 * 
 * Central domain engine for calculations. Does not interact with UI or DB.
 * Pure mathematical functions for cash flow projection and financial decision support.
 */

class FinancialEngine {
  /**
   * Helper to format date as YYYY-MM-DD
   */
  static formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  /**
   * Generates a list of date strings YYYY-MM-DD between two dates inclusive.
   */
  static getDaysRange(startDateStr, endDateStr) {
    const start = new Date(startDateStr + 'T12:00:00'); // Use mid-day to avoid timezone shifting
    const end = new Date(endDateStr + 'T12:00:00');
    const days = [];
    
    let current = new Date(start);
    while (current <= end) {
      days.push(this.formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  /**
   * Projects daily balances and totals for a range of dates.
   * 
   * @param {Array} accounts Active accounts
   * @param {Array} transactions Active, non-deleted transaction versions
   * @param {string} startDateStr YYYY-MM-DD
   * @param {string} endDateStr YYYY-MM-DD
   * @returns {Object} Mapping from 'YYYY-MM-DD' to { income, expense, balance, transactions }
   */
  static calculateDailyBalances(accounts, transactions, startDateStr, endDateStr) {
    // 1. Calculate base balance of all active accounts
    const initialAccountsBalance = accounts
      .filter(acc => acc.is_active)
      .reduce((sum, acc) => sum + (acc.initial_balance || 0), 0);

    // 2. Sum up all transactions prior to startDateStr to get starting balance
    const priorTransactions = transactions.filter(t => t.date < startDateStr);
    const priorBalanceChange = priorTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    let runningBalance = initialAccountsBalance + priorBalanceChange;

    // 3. Generate all days in the range
    const days = this.getDaysRange(startDateStr, endDateStr);
    const dailyBalances = {};

    // Group transactions by date
    const txByDate = {};
    transactions.forEach(t => {
      if (t.date >= startDateStr && t.date <= endDateStr) {
        if (!txByDate[t.date]) txByDate[t.date] = [];
        txByDate[t.date].push(t);
      }
    });

    // Calculate day by day
    days.forEach(day => {
      const dayTxs = txByDate[day] || [];
      const income = dayTxs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const netChange = dayTxs.reduce((sum, t) => sum + t.amount, 0);
      runningBalance += netChange;

      dailyBalances[day] = {
        date: day,
        income,
        expense,
        balance: runningBalance,
        transactions: dayTxs
      };
    });

    return dailyBalances;
  }

  /**
   * Calculates the primary KPIs for the decision panel based on a 30-day projection from today.
   * 
   * @param {Object} dailyBalances Pre-calculated daily balances mapping
   * @param {Array} transactions All active transactions
   * @param {string} todayStr YYYY-MM-DD
   * @returns {Object} The calculated KPIs
   */
  static calculateKPIs(dailyBalances, transactions, todayStr) {
    const todayData = dailyBalances[todayStr] || { balance: 0 };
    const cashToday = todayData.balance;

    // Projection dates (30 days from today)
    const futureDays = this.getDaysRange(todayStr, this.addDays(todayStr, 30));
    
    let cashFuture = cashToday;
    let lowestBalance = cashToday;
    let lowestBalanceDate = todayStr;

    futureDays.forEach(day => {
      const dayData = dailyBalances[day];
      if (dayData) {
        const bal = dayData.balance;
        if (bal < lowestBalance) {
          lowestBalance = bal;
          lowestBalanceDate = day;
        }
        cashFuture = bal; // Will end up as the balance on the last day (today + 30)
      }
    });

    // Decision Margin = Lowest Balance Projected in the next 30 days
    const decisionMargin = lowestBalance;

    // Days until next income
    let daysToNextIncome = null;
    const futureIncomes = transactions
      .filter(t => t.date > todayStr && t.amount > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (futureIncomes.length > 0) {
      const nextIncomeDate = futureIncomes[0].date;
      const diffTime = new Date(nextIncomeDate + 'T12:00:00') - new Date(todayStr + 'T12:00:00');
      daysToNextIncome = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      cashToday,
      cashFuture,
      lowestBalance,
      lowestBalanceDate,
      decisionMargin,
      daysToNextIncome
    };
  }

  /**
   * Calculates the visual intensity classification for a day.
   * 
   * Intensities:
   * - 'negative': Balance < 0
   * - 'critical': Balance is positive but low (e.g. <= R$ 1.500)
   * - 'warning': Balance is positive but warning level (e.g. <= R$ 4.000)
   * - 'comfortable': Balance is stable and safe (e.g. > R$ 4.000)
   * - 'very_comfortable': Balance is very high (e.g. > R$ 10.000)
   * 
   * @param {number} balance The balance of that day
   * @returns {string} The intensity class
   */
  static getIntensity(balance) {
    if (balance < 0) {
      return 'negative';
    } else if (balance <= 1500) {
      return 'critical';
    } else if (balance <= 4000) {
      return 'warning';
    } else if (balance <= 10000) {
      return 'comfortable';
    } else {
      return 'very_comfortable';
    }
  }

  /**
   * Helper to add N days to a date string
   */
  static addDays(dateStr, days) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return this.formatDate(d);
  }
}
