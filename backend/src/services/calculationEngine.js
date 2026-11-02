/**
 * Budget Calculation Engine - Pure functions, no side effects, fully testable
 */

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Healthcare', 'Entertainment', 'Other'];

function calculateTotalExpenses(expenses) {
  return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
}

function calculateRemainingBalance(budget, totalExpenses) {
  return budget - totalExpenses;
}

function calculateUtilization(budget, totalExpenses) {
  if (!budget || budget === 0) return 0;
  return (totalExpenses / budget) * 100;
}

function getBudgetStatus(utilizationPct) {
  if (utilizationPct >= 100) return { status: 'exceeded', color: 'red',    label: 'OVER BUDGET' };
  if (utilizationPct >= 90)  return { status: 'critical', color: 'orange', label: 'Critical'    };
  if (utilizationPct >= 75)  return { status: 'warning',  color: 'yellow', label: 'Warning'     };
  return                            { status: 'good',     color: 'green',  label: 'On Track'    };
}

function getLEDStates(utilizationPct) {
  const over = utilizationPct >= 100;
  return { greenLED: !over, redLED: over };
}

function getAlertLevel(utilizationPct) {
  if (utilizationPct >= 100) return { level: 'exceeded', message: 'Budget exceeded! You are overspending.' };
  if (utilizationPct >= 90)  return { level: 'critical', message: 'Critical: 90%+ of budget used.' };
  if (utilizationPct >= 75)  return { level: 'warning',  message: 'Warning: 75%+ of budget used.' };
  if (utilizationPct >= 50)  return { level: 'info',     message: 'Notice: Half of your budget has been used.' };
  return null;
}

function adcToBudget(adcReading, maxBudget = 50000) {
  const clamped = Math.max(0, Math.min(4095, adcReading));
  return Math.round((clamped / 4095) * maxBudget);
}

function budgetToAdc(budget, maxBudget = 50000) {
  const clamped = Math.max(0, Math.min(maxBudget, budget));
  return Math.round((clamped / maxBudget) * 4095);
}

function groupByCategory(expenses) {
  const grouped = {};
  CATEGORIES.forEach(cat => { grouped[cat] = 0; });
  expenses.forEach(exp => {
    const cat = CATEGORIES.includes(exp.category) ? exp.category : 'Other';
    grouped[cat] += parseFloat(exp.amount) || 0;
  });
  return grouped;
}

function groupByDate(expenses) {
  const grouped = {};
  expenses.forEach(exp => {
    const date = exp.expense_date;
    grouped[date] = (grouped[date] || 0) + (parseFloat(exp.amount) || 0);
  });
  return grouped;
}

function calculateDashboardSummary(budget, expenses) {
  const totalExpenses    = calculateTotalExpenses(expenses);
  const remainingBalance = calculateRemainingBalance(budget, totalExpenses);
  const utilizationPct   = calculateUtilization(budget, totalExpenses);
  const statusInfo       = getBudgetStatus(utilizationPct);
  const ledStates        = getLEDStates(utilizationPct);
  const alertLevel       = getAlertLevel(utilizationPct);
  const isOverBudget     = utilizationPct >= 100;

  return {
    monthlyBudget: budget,
    totalExpenses,
    remainingBalance,
    utilizationPct: Math.round(utilizationPct * 100) / 100,
    expenseCount: expenses.length,
    ...statusInfo,
    ...ledStates,
    alertLevel,
    isOverBudget,
    overspentAmount: isOverBudget ? Math.abs(remainingBalance) : 0,
    byCategory: groupByCategory(expenses),
    byDate: groupByDate(expenses),
  };
}

module.exports = {
  CATEGORIES,
  calculateTotalExpenses,
  calculateRemainingBalance,
  calculateUtilization,
  getBudgetStatus,
  getLEDStates,
  getAlertLevel,
  adcToBudget,
  budgetToAdc,
  groupByCategory,
  groupByDate,
  calculateDashboardSummary,
};
