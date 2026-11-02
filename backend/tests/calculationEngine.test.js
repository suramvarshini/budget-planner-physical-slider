const { test } = require('node:test');
const assert   = require('node:assert/strict');
const {
  calculateTotalExpenses,
  calculateRemainingBalance,
  calculateUtilization,
  getBudgetStatus,
  getLEDStates,
  getAlertLevel,
  adcToBudget,
  budgetToAdc,
  calculateDashboardSummary,
} = require('../src/services/calculationEngine');

test('calculateTotalExpenses - sums amounts', () => {
  assert.equal(calculateTotalExpenses([{ amount: 100 }, { amount: 250.5 }, { amount: 400 }]), 750.5);
});

test('calculateTotalExpenses - empty returns 0', () => {
  assert.equal(calculateTotalExpenses([]), 0);
});

test('calculateRemainingBalance - positive', () => {
  assert.equal(calculateRemainingBalance(5000, 3000), 2000);
});

test('calculateRemainingBalance - overspent is negative', () => {
  assert.equal(calculateRemainingBalance(5000, 6000), -1000);
});

test('calculateUtilization - correct %', () => {
  assert.equal(calculateUtilization(10000, 7500), 75);
});

test('calculateUtilization - zero budget returns 0', () => {
  assert.equal(calculateUtilization(0, 1000), 0);
});

test('getBudgetStatus - good below 75%', () => {
  assert.equal(getBudgetStatus(50).status, 'good');
  assert.equal(getBudgetStatus(50).color,  'green');
});

test('getBudgetStatus - warning at 75%', () => {
  assert.equal(getBudgetStatus(75).status, 'warning');
});

test('getBudgetStatus - critical at 90%', () => {
  assert.equal(getBudgetStatus(90).status, 'critical');
});

test('getBudgetStatus - exceeded at 100%', () => {
  assert.equal(getBudgetStatus(100).status, 'exceeded');
  assert.equal(getBudgetStatus(150).color,  'red');
});

test('getLEDStates - green ON below 100%', () => {
  assert.equal(getLEDStates(80).greenLED, true);
  assert.equal(getLEDStates(80).redLED,   false);
});

test('getLEDStates - red ON at 100%+', () => {
  assert.equal(getLEDStates(100).greenLED, false);
  assert.equal(getLEDStates(100).redLED,   true);
});

test('adcToBudget - 0 → 0', () => {
  assert.equal(adcToBudget(0), 0);
});

test('adcToBudget - 4095 → 50000', () => {
  assert.equal(adcToBudget(4095), 50000);
});

test('adcToBudget - midpoint ~25000', () => {
  const r = adcToBudget(2047);
  assert.ok(r >= 24900 && r <= 25100, `Expected ~25000, got ${r}`);
});

test('budgetToAdc - roundtrip', () => {
  const budget = 25000;
  const adc = budgetToAdc(budget);
  const back = adcToBudget(adc);
  assert.ok(Math.abs(back - budget) < 20, `Roundtrip error: ${back} vs ${budget}`);
});

test('calculateDashboardSummary - over budget', () => {
  const s = calculateDashboardSummary(5000, [{ amount: 6000 }]);
  assert.equal(s.isOverBudget, true);
  assert.equal(s.redLED, true);
  assert.equal(s.greenLED, false);
  assert.equal(s.overspentAmount, 1000);
});

test('calculateDashboardSummary - within budget', () => {
  const s = calculateDashboardSummary(5000, [{ amount: 2000 }]);
  assert.equal(s.isOverBudget, false);
  assert.equal(s.greenLED, true);
  assert.equal(s.remainingBalance, 3000);
});

test('getAlertLevel - null below 50%', () => {
  assert.equal(getAlertLevel(40), null);
});

test('getAlertLevel - info at 50%', () => {
  assert.equal(getAlertLevel(50).level, 'info');
});

test('getAlertLevel - exceeded at 100%', () => {
  assert.equal(getAlertLevel(100).level, 'exceeded');
});
