const { CATEGORIES } = require('../services/calculationEngine');

function validateExpense(req, res, next) {
  const { category, amount, expense_date } = req.body;
  const errors = [];

  if (!category || !CATEGORIES.includes(category))
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    errors.push('amount must be a positive number');
  if (amount && parseFloat(amount) > 10000000)
    errors.push('amount exceeds maximum allowed value');
  if (!expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(expense_date))
    errors.push('expense_date must be YYYY-MM-DD');

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
}

function validateBudget(req, res, next) {
  const { monthly_budget } = req.body;
  if (monthly_budget === undefined || monthly_budget === null)
    return res.status(400).json({ success: false, error: 'monthly_budget is required' });
  const val = parseFloat(monthly_budget);
  if (isNaN(val) || val < 0)
    return res.status(400).json({ success: false, error: 'monthly_budget must be a non-negative number' });
  if (val > 50000)
    return res.status(400).json({ success: false, error: 'monthly_budget cannot exceed 50000' });
  next();
}

function validateAdcReading(req, res, next) {
  const { adc_reading } = req.body;
  if (adc_reading === undefined)
    return res.status(400).json({ success: false, error: 'adc_reading is required' });
  const val = parseInt(adc_reading);
  if (isNaN(val) || val < 0 || val > 4095)
    return res.status(400).json({ success: false, error: 'adc_reading must be 0–4095' });
  next();
}

module.exports = { validateExpense, validateBudget, validateAdcReading };
