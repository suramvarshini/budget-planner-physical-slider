import { describe, it, expect } from 'vitest';

// Pure logic mirrors the backend calculations to test frontend assumptions
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
  if (utilizationPct >= 100) return { status: 'exceeded', color: 'red', label: 'OVER BUDGET' };
  if (utilizationPct >= 90) return { status: 'critical', color: 'orange', label: 'Critical' };
  if (utilizationPct >= 75) return { status: 'warning', color: 'yellow', label: 'Warning' };
  return { status: 'good', color: 'green', label: 'On Track' };
}

function getLEDStates(utilizationPct) {
  const isOver = utilizationPct >= 100;
  return {
    greenLED: !isOver,
    redLED: isOver,
  };
}

function adcToBudget(adcReading, maxBudget = 50000) {
  const clamped = Math.max(0, Math.min(4095, adcReading));
  return Math.round((clamped / 4095) * maxBudget);
}

describe('Frontend Budget Calculation Engine', () => {
  it('calculates total expenses correctly', () => {
    expect(calculateTotalExpenses([{ amount: 1200 }, { amount: 800 }])).toBe(2000);
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it('calculates remaining balance correctly (positive & negative)', () => {
    expect(calculateRemainingBalance(5000, 3000)).toBe(2000);
    expect(calculateRemainingBalance(5000, 6500)).toBe(-1500);
  });

  it('calculates budget utilization safely without zero division', () => {
    expect(calculateUtilization(10000, 5000)).toBe(50);
    expect(calculateUtilization(0, 5000)).toBe(0);
  });

  it('evaluates status rules: <75% Green, 75-89% Yellow, 90-99% Orange, 100%+ Red', () => {
    expect(getBudgetStatus(50).status).toBe('good');
    expect(getBudgetStatus(50).color).toBe('green');

    expect(getBudgetStatus(75).status).toBe('warning');
    expect(getBudgetStatus(75).color).toBe('yellow');

    expect(getBudgetStatus(92).status).toBe('critical');
    expect(getBudgetStatus(92).color).toBe('orange');

    expect(getBudgetStatus(100).status).toBe('exceeded');
    expect(getBudgetStatus(100).color).toBe('red');
    expect(getBudgetStatus(100).label).toBe('OVER BUDGET');
  });

  it('sets LED states: Green ON (<100%), Red ON (>=100%)', () => {
    const safe = getLEDStates(85);
    expect(safe.greenLED).toBe(true);
    expect(safe.redLED).toBe(false);

    const over = getLEDStates(105);
    expect(over.greenLED).toBe(false);
    expect(over.redLED).toBe(true);
  });

  it('maps 12-bit ADC range (0-4095) to budget (₹0-₹50,000)', () => {
    expect(adcToBudget(0)).toBe(0);
    expect(adcToBudget(4095)).toBe(50000);
    const mid = adcToBudget(2048);
    expect(mid).toBeGreaterThan(24900);
    expect(mid).toBeLessThan(25100);
  });
});
