const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  health: () => request('/api/health'),

  // Dashboard
  getDashboard: (month) => request(`/api/dashboard${month ? `?month=${month}` : ''}`),

  // Budget
  getBudget: (month) => request(`/api/budget${month ? `?month=${month}` : ''}`),
  updateBudget: (monthly_budget, month) => request('/api/budget', {
    method: 'PUT',
    body: JSON.stringify({ monthly_budget, month }),
  }),

  // Expenses
  getExpenses: (month, category) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (category && category !== 'all') params.set('category', category);
    return request(`/api/expenses?${params}`);
  },
  createExpense: (data) => request('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/api/expenses/${id}`, { method: 'DELETE' }),

  // Device Simulator
  getDeviceStatus: () => request('/api/device/status'),
  simulate: (adc_reading) => request('/api/device/simulate', { method: 'POST', body: JSON.stringify({ adc_reading }) }),
  resetDevice: () => request('/api/device/reset', { method: 'POST' }),
  toggleRunning: () => request('/api/device/toggle-running', { method: 'POST' }),

  // History
  getHistory: () => request('/api/history'),

  // Reports
  getCSV: (month, type = 'expenses') => {
    const params = new URLSearchParams({ type });
    if (month) params.set('month', month);
    return fetch(`${BASE_URL}/api/reports/csv?${params}`).then(r => r.blob());
  },

  // Product price lookup (estimates)
  searchProducts: (query, category) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    return request(`/api/products/search?${params}`);
  },
};
