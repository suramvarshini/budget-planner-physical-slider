const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');
const { calculateDashboardSummary } = require('../services/calculationEngine');

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }

// GET /api/dashboard?month=YYYY-MM
router.get('/', (req, res, next) => {
  try {
    const db = getDB();
    const month = req.query.month || getCurrentMonth();

    let budgetRow = db.prepare('SELECT * FROM budget_settings WHERE month = ?').get(month);
    if (!budgetRow) {
      db.prepare('INSERT INTO budget_settings (month, monthly_budget) VALUES (?, ?)').run(month, 5000);
      budgetRow = db.prepare('SELECT * FROM budget_settings WHERE month = ?').get(month);
    }

    const expenses = db.prepare('SELECT * FROM expenses WHERE month = ? ORDER BY expense_date DESC').all(month);
    const summary = calculateDashboardSummary(budgetRow.monthly_budget, expenses);

    res.json({
      success: true,
      data: {
        month,
        ...summary,
        budgetRecord: budgetRow,
        recentExpenses: expenses.slice(0, 10),
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
