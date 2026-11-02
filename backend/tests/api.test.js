const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

let server;
let baseUrl;

before((_, done) => {
  const app = require('../src/server');
  // Start server on an ephemeral port
  server = app.listen(0, () => {
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

after((_, done) => {
  server.close(done);
});

async function api(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, headers: res.headers, data: json };
}

describe('Backend API Integration', () => {
  test('GET /api/health', async () => {
    const res = await api('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.status, 'online');
    assert.equal(res.data.mode, 'simulation');
  });

  test('GET /api/dashboard for 2026-10', async () => {
    const res = await api('/api/dashboard?month=2026-10');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.monthlyBudget >= 0);
    assert.ok(res.data.data.totalExpenses >= 0);
    assert.ok(typeof res.data.data.greenLED === 'boolean');
    assert.ok(typeof res.data.data.redLED === 'boolean');
  });

  test('GET & PUT /api/budget', async () => {
    const putRes = await api('/api/budget', {
      method: 'PUT',
      body: JSON.stringify({ month: '2026-10', monthly_budget: 9500 }),
    });
    assert.equal(putRes.status, 200);
    assert.equal(putRes.data.data.monthly_budget, 9500);

    const getRes = await api('/api/budget?month=2026-10');
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.data.monthly_budget, 9500);
  });

  test('PUT /api/budget validation rejects invalid budget', async () => {
    const negRes = await api('/api/budget', {
      method: 'PUT',
      body: JSON.stringify({ month: '2026-10', monthly_budget: -100 }),
    });
    assert.equal(negRes.status, 400);

    const overRes = await api('/api/budget', {
      method: 'PUT',
      body: JSON.stringify({ month: '2026-10', monthly_budget: 60000 }),
    });
    assert.equal(overRes.status, 400);
  });

  test('CRUD /api/expenses', async () => {
    // 1. Create
    const createRes = await api('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        category: 'Education',
        amount: 250,
        description: 'Notebook and pens',
        expense_date: '2026-10-25',
      }),
    });
    assert.equal(createRes.status, 201);
    const newId = createRes.data.data.id;
    assert.ok(newId > 0);

    // 2. Read
    const getRes = await api('/api/expenses?month=2026-10');
    assert.equal(getRes.status, 200);
    const found = getRes.data.data.find(e => e.id === newId);
    assert.ok(found);
    assert.equal(found.amount, 250);

    // 3. Update
    const updateRes = await api(`/api/expenses/${newId}`, {
      method: 'PUT',
      body: JSON.stringify({
        category: 'Education',
        amount: 300,
        description: 'Notebook, pens, and calculator',
        expense_date: '2026-10-25',
      }),
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.data.amount, 300);

    // 4. Delete
    const deleteRes = await api(`/api/expenses/${newId}`, {
      method: 'DELETE',
    });
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.data.success, true);
  });

  test('POST /api/expenses validation rejects negative amount', async () => {
    const res = await api('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        category: 'Food',
        amount: -50,
        expense_date: '2026-10-25',
      }),
    });
    assert.equal(res.status, 400);
  });

  test('Device simulator endpoints (/api/device)', async () => {
    // Status
    const statusRes = await api('/api/device/status');
    assert.equal(statusRes.status, 200);
    assert.equal(statusRes.data.data.deviceId, 'SIM-DEVICE-001');

    // Simulate reading (ADC = 2048, ~₹25006)
    const simRes = await api('/api/device/simulate', {
      method: 'POST',
      body: JSON.stringify({ adc_reading: 2048 }),
    });
    assert.equal(simRes.status, 200);
    assert.equal(simRes.data.data.adc_reading, 2048);
    assert.ok(simRes.data.data.monthly_budget > 24000);

    // Reset
    const resetRes = await api('/api/device/reset', { method: 'POST' });
    assert.equal(resetRes.status, 200);
    assert.equal(resetRes.data.data.adc_reading, 409);
    assert.equal(resetRes.data.data.monthly_budget, 5000);
  });

  test('GET /api/history returns monthly summaries', async () => {
    const res = await api('/api/history');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length > 0);
  });

  test('GET /api/reports/csv exports CSV format', async () => {
    const res = await api('/api/reports/csv?month=2026-10&type=expenses');
    assert.equal(res.status, 200);
    assert.ok(res.data.includes('Category'));
    assert.ok(res.data.includes('Amount (INR)'));
  });

  test('GET /api/products/search returns demo product price estimates', async () => {
    const res = await api('/api/products/search?category=Food');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.length > 0);
    assert.equal(res.data.data[0].category, 'Food');
    assert.equal(res.data.data[0].priceType, 'demo_estimate');
  });
});
