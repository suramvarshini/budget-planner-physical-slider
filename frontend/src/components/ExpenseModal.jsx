import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import '../styles/modal.css';

const defaultForm = {
  category: 'Food',
  amount: '',
  description: '',
  expense_date: new Date().toISOString().split('T')[0],
};

export default function ExpenseModal({ expense, prefilledData, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setForm({
        category: expense.category || 'Food',
        amount: expense.amount || '',
        description: expense.description || '',
        expense_date: expense.expense_date || defaultForm.expense_date,
      });
    } else if (prefilledData) {
      setForm({
        category: prefilledData.category || 'Food',
        amount: prefilledData.amount || '',
        description: prefilledData.description || '',
        expense_date: prefilledData.expense_date || defaultForm.expense_date,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [expense, prefilledData]);

  const validate = () => {
    const e = {};
    if (!form.category || !CATEGORIES.includes(form.category)) {
      e.category = 'Select a valid category';
    }
    const amt = parseFloat(form.amount);
    if (form.amount === '' || isNaN(amt) || amt <= 0) {
      e.amount = 'Amount must be greater than ₹0';
    } else if (amt > 10000000) {
      e.amount = 'Amount exceeds maximum limit';
    }
    if (!form.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(form.expense_date)) {
      e.expense_date = 'Enter a valid date (YYYY-MM-DD)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (expense?.id) {
        await api.updateExpense(expense.id, form);
        toast.success('Expense updated successfully');
      } else {
        await api.createExpense(form);
        toast.success('Expense recorded successfully');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{expense?.id ? 'Edit Expense Record' : 'Record New Expense'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="exp-category">Expense Category *</label>
            <select
              id="exp-category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className={errors.category ? 'input-error' : ''}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="error-msg">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exp-amount">Amount (₹) *</label>
            <input
              id="exp-amount"
              type="number"
              min="0.01"
              step="any"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="e.g. 750"
              className={errors.amount ? 'input-error' : ''}
            />
            {errors.amount && <span className="error-msg">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exp-desc">Description / Merchant</label>
            <input
              id="exp-desc"
              type="text"
              maxLength={200}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Monthly Grocery Bill"
            />
          </div>

          <div className="form-group">
            <label htmlFor="exp-date">Expense Date *</label>
            <input
              id="exp-date"
              type="date"
              value={form.expense_date}
              onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
              className={errors.expense_date ? 'input-error' : ''}
            />
            {errors.expense_date && <span className="error-msg">{errors.expense_date}</span>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : expense?.id ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
