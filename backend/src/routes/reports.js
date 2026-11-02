const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

// GET /api/reports/csv?month=YYYY-MM&type=expenses|budget
router.get('/csv', (req, res, next) => {
  try {
    const db = getDB();
    const type = req.query.type || 'expenses';
    const month = req.query.month;
    let rows, headers, filename;

    if (type === 'budget') {
      rows = db.prepare('SELECT * FROM budget_settings ORDER BY month DESC').all();
      headers = ['ID', 'Month', 'Monthly Budget (INR)', 'Created At', 'Updated At'];
      filename = 'budget_history.csv';
    } else {
      let query = 'SELECT id, month, category, amount, description, expense_date, created_at FROM expenses';
      const params = [];
      if (month) { query += ' WHERE month = ?'; params.push(month); }
      query += ' ORDER BY expense_date DESC';
      rows = db.prepare(query).all(...params);
      headers = ['ID', 'Month', 'Category', 'Amount (INR)', 'Description', 'Date', 'Created At'];
      filename = month ? `expenses_${month}.csv` : 'expenses_all.csv';
    }

    const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escape).join(','),
      ...rows.map(r => Object.values(r).map(escape).join(',')),
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) { next(err); }
});

module.exports = router;
