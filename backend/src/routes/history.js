const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');
const { calculateDashboardSummary } = require('../services/calculationEngine');

// GET /api/history
router.get('/', (req, res, next) => {
  try {
    const db = getDB();
    const months = db.prepare(`
      SELECT DISTINCT month FROM (
        SELECT month FROM expenses
        UNION
        SELECT month FROM budget_settings
      ) ORDER BY month DESC
    `).all().map(r => r.month);

    const summaries = months.map(month => {
      const budgetRow = db.prepare('SELECT monthly_budget FROM budget_settings WHERE month = ?').get(month);
      const budget = budgetRow ? budgetRow.monthly_budget : 5000;
      const expenses = db.prepare('SELECT * FROM expenses WHERE month = ?').all(month);
      return { month, ...calculateDashboardSummary(budget, expenses) };
    });

    res.json({ success: true, data: summaries });
  } catch (err) { next(err); }
});

module.exports = router;
