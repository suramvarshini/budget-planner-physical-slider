import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, TrendingDown, PiggyBank, Percent, ListOrdered, ShieldAlert, Plus, Cpu, FileDown } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import SummaryCard from '../components/SummaryCard';
import BudgetSlider from '../components/BudgetSlider';
import AlertBanner from '../components/AlertBanner';
import LEDIndicator from '../components/LEDIndicator';
import OLEDDisplay from '../components/OLEDDisplay';
import ExpenseModal from '../components/ExpenseModal';
import { api } from '../api/client';
import { formatCurrency, formatPct, getStatusClass, CATEGORY_COLORS } from '../utils/formatters';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard({ currentMonth, refreshTrigger, onRefresh, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(currentMonth);
      setData(res.data);
      setAlertDismissed(false);
    } catch (err) {
      toast.error('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleBudgetChange = () => {
    onRefresh();
  };

  // 1. Doughnut chart: Expenses by Category
  const categoryLabels = data ? Object.keys(data.byCategory).filter(k => data.byCategory[k] > 0) : [];
  const categoryValues = data ? categoryLabels.map(k => data.byCategory[k]) : [];
  const categoryColors = categoryLabels.map(k => CATEGORY_COLORS[k] || '#6b7280');

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryValues,
      backgroundColor: categoryColors,
      borderColor: '#1e293b',
      borderWidth: 2,
    }],
  };

  // 2. Bar chart: Daily Spending
  const dateLabels = data ? Object.keys(data.byDate).sort() : [];
  const dailyValues = dateLabels.map(d => data.byDate[d]);

  const dailyChartData = {
    labels: dateLabels.map(d => d.slice(8)), // Show just DD
    datasets: [{
      label: 'Daily Spending (₹)',
      data: dailyValues,
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 4,
    }],
  };

  // 3. Comparison chart: Budget vs Expenses
  const comparisonChartData = {
    labels: ['Monthly Budget', 'Total Expenses'],
    datasets: [{
      label: 'Amount (₹)',
      data: [data?.monthlyBudget || 0, data?.totalExpenses || 0],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        data?.isOverBudget ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)'
      ],
      borderRadius: 6,
    }],
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

  const statusClass = getStatusClass(data?.status);

  return (
    <div className="dashboard-page">
      {/* Alert Banner if utilization crosses 50%, 75%, 90%, 100% */}
      {data?.alertLevel && !alertDismissed && (
        <AlertBanner
          alertLevel={data.alertLevel.level}
          message={data.alertLevel.message}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* Summary Cards */}
      <div className="cards-grid">
        <SummaryCard
          title="Monthly Budget"
          value={formatCurrency(data?.monthlyBudget)}
          subtitle={`Budget for ${currentMonth}`}
          icon={Wallet}
          loading={loading}
          colorClass="card-blue"
        />
        <SummaryCard
          title="Estimated Expenses"
          value={formatCurrency(data?.totalExpenses)}
          subtitle={`${data?.expenseCount || 0} recorded items`}
          icon={TrendingDown}
          loading={loading}
          colorClass="card-orange"
        />
        <SummaryCard
          title="Remaining Balance"
          value={data ? (data.remainingBalance < 0 ? `-${formatCurrency(Math.abs(data.remainingBalance))}` : formatCurrency(data.remainingBalance)) : '—'}
          subtitle={data?.isOverBudget ? `⚠ Overspent by ${formatCurrency(data.overspentAmount)}` : 'Available to spend'}
          icon={PiggyBank}
          loading={loading}
          colorClass={data?.isOverBudget ? 'card-red' : 'card-green'}
        />
        <SummaryCard
          title="Budget Utilization"
          value={formatPct(data?.utilizationPct)}
          subtitle={data?.label || 'Calculating...'}
          icon={Percent}
          loading={loading}
          colorClass={statusClass}
        />
      </div>

      {/* Digital Potentiometer Slider */}
      <BudgetSlider
        currentBudget={data?.monthlyBudget}
        currentMonth={currentMonth}
        onBudgetChange={handleBudgetChange}
      />

      {/* Hardware Simulation Indicators & OLED Display */}
      <div className="hardware-preview-section">
        <div className="hw-preview-header">
          <h3>Hardware Simulation Monitor</h3>
          <span className="hw-subtext">Virtual ESP32 • Potentiometer • Dual LED Status • SSD1306 OLED</span>
        </div>
        <div className="hw-preview-grid">
          <div className="hw-leds-panel">
            <h4>LED Status Indicators</h4>
            <div className="leds-row">
              <LEDIndicator
                isOn={data?.greenLED}
                color="green"
                label="Green Status LED"
                sublabel={data?.greenLED ? 'Active (Within Budget)' : 'Inactive'}
              />
              <LEDIndicator
                isOn={data?.redLED}
                color="red"
                label="Red Overspending LED"
                sublabel={data?.redLED ? 'ACTIVE (OVER BUDGET)' : 'Inactive'}
              />
            </div>
            <div className="status-summary-box">
              <span className="status-label">Engine Evaluation:</span>
              <span className={`status-badge ${statusClass}`}>{data?.label || 'Good'}</span>
            </div>
          </div>
          <div className="hw-oled-panel">
            <OLEDDisplay data={data} isSimulated adcReading={Math.round(((data?.monthlyBudget || 0) / 50000) * 4095)} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <div className="chart-wrapper">
            {categoryLabels.length > 0 ? (
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                }}
              />
            ) : (
              <div className="chart-empty">No expenses recorded for this month</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Daily Spending Trend</h3>
          <div className="chart-wrapper">
            {dateLabels.length > 0 ? (
              <Bar data={dailyChartData} options={chartOptions} />
            ) : (
              <div className="chart-empty">No daily expense data</div>
            )}
          </div>
        </div>

        <div className="chart-card chart-card-wide">
          <h3>Budget vs Total Expenses Comparison</h3>
          <div className="chart-wrapper">
            <Bar data={comparisonChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="quick-actions-bar">
        <button className="btn btn-primary" onClick={() => setIsAddExpenseOpen(true)}>
          <Plus size={16} /> Add Expense
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('simulator')}>
          <Cpu size={16} /> Open Full Device Simulator
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('expenses')}>
          <ListOrdered size={16} /> Manage All Expenses
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('reports')}>
          <FileDown size={16} /> Export CSV Report
        </button>
      </div>

      {isAddExpenseOpen && (
        <ExpenseModal
          onClose={() => setIsAddExpenseOpen(false)}
          onSaved={() => onRefresh()}
        />
      )}
    </div>
  );
}
