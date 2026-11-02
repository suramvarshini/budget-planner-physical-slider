import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatCurrency, formatPct, getMonthLabel, getStatusClass } from '../utils/formatters';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';
import '../styles/history.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.getHistory();
        setHistory(res.data);
      } catch (err) {
        toast.error('Failed to load history: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const sortedMonths = [...history].reverse(); // chronological for chart
  const chartLabels = sortedMonths.map(h => getMonthLabel(h.month));
  const budgetData = sortedMonths.map(h => h.monthlyBudget);
  const expenseData = sortedMonths.map(h => h.totalExpenses);

  const historyChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Allocated Budget (₹)',
        data: budgetData,
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderRadius: 4,
      },
      {
        label: 'Actual Expenses (₹)',
        data: expenseData,
        backgroundColor: 'rgba(249, 115, 22, 0.75)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h2>Monthly Budget & Spending History</h2>
          <p className="page-subtitle">
            Longitudinal records across all tracked months &bull; Historical data is preserved across budget updates
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading historical records...</div>
      ) : history.length === 0 ? (
        <div className="empty-state">No historical records available yet. Add expenses to begin tracking.</div>
      ) : (
        <>
          {/* Trend Chart */}
          <div className="chart-card history-chart-card">
            <h3>Monthly Budget vs Actual Expenses Trend</h3>
            <div className="chart-wrapper">
              <Bar data={historyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Historical Table */}
          <div className="history-table-wrapper">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Billing Month</th>
                  <th className="th-right">Allocated Budget</th>
                  <th className="th-right">Total Expenses</th>
                  <th className="th-right">Balance / Overspent</th>
                  <th className="th-center">Utilization</th>
                  <th className="th-center">Evaluation Status</th>
                  <th className="th-center">Records</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.month}>
                    <td className="month-name-cell">
                      <strong>{getMonthLabel(h.month)}</strong>
                      <span className="month-code">({h.month})</span>
                    </td>
                    <td className="amount-cell th-right">{formatCurrency(h.monthlyBudget)}</td>
                    <td className="amount-cell th-right">{formatCurrency(h.totalExpenses)}</td>
                    <td className={`amount-cell th-right ${h.isOverBudget ? 'text-red' : 'text-green'}`}>
                      {h.remainingBalance < 0
                        ? `-${formatCurrency(Math.abs(h.remainingBalance))}`
                        : formatCurrency(h.remainingBalance)}
                    </td>
                    <td className="th-center">
                      <span className="utilization-badge">{formatPct(h.utilizationPct)}</span>
                    </td>
                    <td className="th-center">
                      <span className={`status-pill ${getStatusClass(h.status)}`}>
                        {h.label}
                      </span>
                    </td>
                    <td className="th-center">{h.expenseCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
