export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatPct = (pct) => `${Math.min(999, Math.round(pct || 0))}%`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const getMonthLabel = (monthStr) => {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const getStatusClass = (status) => {
  const map = { good: 'status-good', warning: 'status-warning', critical: 'status-critical', exceeded: 'status-exceeded' };
  return map[status] || 'status-good';
};

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Healthcare', 'Entertainment', 'Other'];

export const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Shopping: '#a855f7',
  Bills: '#ef4444',
  Education: '#06b6d4',
  Healthcare: '#10b981',
  Entertainment: '#f59e0b',
  Other: '#6b7280',
};
