const { getDB } = require('./database');

function seed() {
  const db = getDB();
  const currentMonth = '2026-10';
  const prevMonth = '2026-09';

  db.prepare(`INSERT OR REPLACE INTO budget_settings (month, monthly_budget) VALUES (?, ?)`).run(currentMonth, 8000);
  db.prepare(`INSERT OR REPLACE INTO budget_settings (month, monthly_budget) VALUES (?, ?)`).run(prevMonth, 7500);

  db.prepare(`DELETE FROM expenses WHERE month IN (?, ?)`).run(currentMonth, prevMonth);

  const insertExpense = db.prepare(`
    INSERT INTO expenses (month, category, amount, description, expense_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const sampleExpenses = [
    [currentMonth, 'Food', 1200, 'Groceries', '2026-10-01'],
    [currentMonth, 'Transport', 450, 'Monthly bus pass', '2026-10-02'],
    [currentMonth, 'Bills', 800, 'Electricity bill', '2026-10-05'],
    [currentMonth, 'Education', 1500, 'Online course', '2026-10-08'],
    [currentMonth, 'Entertainment', 350, 'Movie tickets', '2026-10-12'],
    [currentMonth, 'Food', 680, 'Restaurant dinner', '2026-10-15'],
    [currentMonth, 'Healthcare', 500, 'Doctor visit', '2026-10-18'],
    [currentMonth, 'Shopping', 1200, 'Clothes & accessories', '2026-10-20'],
    [prevMonth, 'Food', 1400, 'Groceries', '2026-09-03'],
    [prevMonth, 'Transport', 450, 'Monthly bus pass', '2026-09-01'],
    [prevMonth, 'Bills', 950, 'Electricity + internet', '2026-09-05'],
    [prevMonth, 'Shopping', 2100, 'New phone accessories', '2026-09-10'],
    [prevMonth, 'Food', 750, 'Dining out', '2026-09-20'],
    [prevMonth, 'Entertainment', 600, 'OTT subscriptions', '2026-09-25'],
  ];

  db.exec('BEGIN TRANSACTION');
  try {
    for (const exp of sampleExpenses) {
      insertExpense.run(...exp);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log('✅ Database seeded successfully');
}

seed();
