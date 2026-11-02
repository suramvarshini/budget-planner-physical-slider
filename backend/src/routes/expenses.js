const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');
const { validateExpense } = require('../middleware/validate');

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }

// GET /api/expenses?month=YYYY-MM&category=Food
router.get('/', (req, res, next) => {
  try {
    const db = getDB();
    const month = req.query.month || getCurrentMonth();
    const category = req.query.category;
    let query = 'SELECT * FROM expenses WHERE month = ?';
    const params = [month];
    if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY expense_date DESC, id DESC';
    const expenses = db.prepare(query).all(...params);
    res.json({ success: true, data: expenses, count: expenses.length });
  } catch (err) { next(err); }
});

// POST /api/expenses
router.post('/', validateExpense, (req, res, next) => {
  try {
    const db = getDB();
    const { category, amount, description, expense_date } = req.body;
    const month = expense_date.slice(0, 7);
    const result = db.prepare(`
      INSERT INTO expenses (month, category, amount, description, expense_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(month, category, parseFloat(amount), description || '', expense_date);
    const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created, message: 'Expense added successfully' });
  } catch (err) { next(err); }
});

// PUT /api/expenses/:id
router.put('/:id', validateExpense, (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { category, amount, description, expense_date } = req.body;
    const month = expense_date.slice(0, 7);
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Expense not found' });
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE expenses SET month=?,category=?,amount=?,description=?,expense_date=?,updated_at=? WHERE id=?
    `).run(month, category, parseFloat(amount), description || '', expense_date, now, id);
    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Expense updated successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Expense not found' });
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
