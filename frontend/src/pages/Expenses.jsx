import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Filter, ShoppingBag } from 'lucide-react';
import { api } from '../api/client';
import { formatCurrency, formatDate, CATEGORIES } from '../utils/formatters';
import ExpenseModal from '../components/ExpenseModal';
import ProductEstimatorModal from '../components/ProductEstimatorModal';
import toast from 'react-hot-toast';
import '../styles/expenses.css';

export default function Expenses({ currentMonth, onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getExpenses(currentMonth, filterCategory);
      setExpenses(res.data);
    } catch (err) {
      toast.error('Failed to load expenses: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, filterCategory]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleDelete = async (id, desc) => {
    if (!window.confirm(`Are you sure you want to delete expense "${desc || 'Record'}"?`)) return;
    try {
      await api.deleteExpense(id);
      toast.success('Expense deleted');
      loadExpenses();
      onRefresh();
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setPrefilledData(null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setPrefilledData(null);
    setIsModalOpen(true);
  };

  const handleProposedExpense = (data) => {
    setEditingExpense(null);
    setPrefilledData(data);
    setIsModalOpen(true);
  };

  const handleSaved = () => {
    loadExpenses();
    onRefresh();
  };

  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h2>Expense Management</h2>
          <p className="page-subtitle">
            Month: <strong>{currentMonth}</strong> • {expenses.length} Records • Total Spent: <strong>{formatCurrency(totalAmount)}</strong>
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setIsEstimatorOpen(true)}>
            <ShoppingBag size={16} /> Price Reference Lookup
          </button>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <Filter size={16} className="filter-icon" />
          <label htmlFor="category-filter">Category Filter:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories ({expenses.length})</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <span className="filter-summary">
          Showing {expenses.length} expense{expenses.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Expense Records Table */}
      {loading ? (
        <div className="loading-state">Loading expense records...</div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <p>No expenses found for <strong>{currentMonth}</strong> {filterCategory !== 'all' ? `in category "${filterCategory}"` : ''}.</p>
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={handleAddNew}>
              <Plus size={16} /> Add First Expense
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEstimatorOpen(true)}>
              <ShoppingBag size={16} /> Estimate with Reference Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="th-right">Amount</th>
                <th className="th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td className="date-cell">{formatDate(exp.expense_date)}</td>
                  <td>
                    <span className="category-badge" data-category={exp.category}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="desc-cell">{exp.description || '—'}</td>
                  <td className="amount-cell th-right">{formatCurrency(exp.amount)}</td>
                  <td className="th-center">
                    <div className="action-btns">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(exp)}
                        title="Edit expense"
                        aria-label="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(exp.id, exp.description)}
                        title="Delete expense"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">
                  <strong>Total Expenses</strong>
                </td>
                <td className="amount-cell th-right">
                  <strong>{formatCurrency(totalAmount)}</strong>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}
          prefilledData={prefilledData}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {isEstimatorOpen && (
        <ProductEstimatorModal
          onClose={() => setIsEstimatorOpen(false)}
          onSelectProposedExpense={handleProposedExpense}
        />
      )}
    </div>
  );
}
