const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');
const { validateBudget } = require('../middleware/validate');

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }

// GET /api/budget?month=YYYY-MM
router.get('/', (req, res, next) => {
  try {
    const db = getDB();
    const month = req.query.month || getCurrentMonth();
    let row = db.prepare('SELECT * FROM budget_settings WHERE month = ?').get(month);
    if (!row) {
      db.prepare('INSERT INTO budget_settings (month, monthly_budget) VALUES (?, ?)').run(month, 5000);
      row = db.prepare('SELECT * FROM budget_settings WHERE month = ?').get(month);
    }
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

// PUT /api/budget
router.put('/', validateBudget, (req, res, next) => {
  try {
    const db = getDB();
    const month = req.body.month || getCurrentMonth();
    const monthly_budget = parseFloat(req.body.monthly_budget);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO budget_settings (month, monthly_budget, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(month) DO UPDATE SET monthly_budget = excluded.monthly_budget, updated_at = excluded.updated_at
    `).run(month, monthly_budget, now);

    const updated = db.prepare('SELECT * FROM budget_settings WHERE month = ?').get(month);
    res.json({ success: true, data: updated, message: 'Budget updated successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
