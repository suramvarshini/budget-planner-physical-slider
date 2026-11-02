import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPct, formatDate, getMonthLabel, getStatusClass } from '../utils/formatters';

describe('Frontend Formatters & Utilities', () => {
  it('formats Indian Rupees currency correctly with symbol', () => {
    const formatted = formatCurrency(5000);
    expect(formatted).toContain('5,000');
    expect(formatted).toMatch(/₹|INR/);
  });

  it('formats zero and undefined currency safely', () => {
    expect(formatCurrency(0)).toContain('0');
    expect(formatCurrency(null)).toContain('0');
  });

  it('formats percentage cleanly', () => {
    expect(formatPct(45.67)).toBe('46%');
    expect(formatPct(100)).toBe('100%');
    expect(formatPct(0)).toBe('0%');
  });

  it('formats date strings', () => {
    const d = formatDate('2026-10-15');
    expect(d).toContain('Oct');
    expect(d).toContain('2026');
  });

  it('formats month labels', () => {
    const m = getMonthLabel('2026-10');
    expect(m).toContain('October');
    expect(m).toContain('2026');
  });

  it('maps budget status to CSS classes', () => {
    expect(getStatusClass('good')).toBe('status-good');
    expect(getStatusClass('warning')).toBe('status-warning');
    expect(getStatusClass('critical')).toBe('status-critical');
    expect(getStatusClass('exceeded')).toBe('status-exceeded');
  });
});
