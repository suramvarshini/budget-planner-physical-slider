import React, { useState } from 'react';
import { Download, FileText, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { getMonthLabel } from '../utils/formatters';
import toast from 'react-hot-toast';
import '../styles/reports.css';

export default function Reports({ currentMonth }) {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type, monthParam) => {
    setDownloading(type);
    try {
      const blob = await api.getCSV(monthParam, type === 'budget_history' ? 'budget' : 'expenses');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'budget_history'
        ? 'budget_history.csv'
        : monthParam
          ? `expenses_${monthParam}.csv`
          : 'expenses_all_time.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV export generated and downloaded successfully!');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h2>Export Reports & Data Backup</h2>
          <p className="page-subtitle">
            Generate and download standard CSV reports for offline presentation, spreadsheet audit, or college submission.
          </p>
        </div>
      </div>

      <div className="reports-grid">
        {/* Card 1: Current Month Expenses */}
        <div className="report-card">
          <div className="report-card-top">
            <div className="report-icon-wrap">
              <FileText size={26} className="report-icon" />
            </div>
            <span className="report-badge">CSV EXPORT</span>
          </div>
          <h3>Current Month Expenses</h3>
          <p>
            Download all granular expense records recorded specifically for <strong>{getMonthLabel(currentMonth)}</strong> ({currentMonth}), including timestamp, category, and description.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => handleDownload('month_expenses', currentMonth)}
            disabled={downloading === 'month_expenses'}
          >
            <Download size={16} />
            {downloading === 'month_expenses' ? 'Exporting...' : `Download ${currentMonth} CSV`}
          </button>
        </div>

        {/* Card 2: All Time Expenses */}
        <div className="report-card">
          <div className="report-card-top">
            <div className="report-icon-wrap">
              <Database size={26} className="report-icon" />
            </div>
            <span className="report-badge">COMPLETE ARCHIVE</span>
          </div>
          <h3>All-Time Expense History</h3>
          <p>
            Export every single recorded expense transaction across all past and current months in a single unified spreadsheet file.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => handleDownload('all_expenses', null)}
            disabled={downloading === 'all_expenses'}
          >
            <Download size={16} />
            {downloading === 'all_expenses' ? 'Exporting...' : 'Download Full Expense CSV'}
          </button>
        </div>

        {/* Card 3: Budget Configuration History */}
        <div className="report-card">
          <div className="report-card-top">
            <div className="report-icon-wrap">
              <ShieldCheck size={26} className="report-icon" />
            </div>
            <span className="report-badge">AUDIT TRAIL</span>
          </div>
          <h3>Monthly Budget Settings Log</h3>
          <p>
            Download the historical log of all monthly budget targets configured through the digital slider or API, along with creation and modification timestamps.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => handleDownload('budget_history', null)}
            disabled={downloading === 'budget_history'}
          >
            <Download size={16} />
            {downloading === 'budget_history' ? 'Exporting...' : 'Download Budget Settings CSV'}
          </button>
        </div>
      </div>

      {/* Persistence and Faculty Verification Note */}
      <div className="reports-info-card">
        <div className="info-title">
          <CheckCircle2 size={20} className="text-green" />
          <h4>Data Persistence & Faculty Demonstration Guarantee</h4>
        </div>
        <p>
          All budget configurations and expense entries are safely committed into SQLite database tables (<code>budget_settings</code>, <code>expenses</code>, <code>alert_history</code>, and <code>device_state</code>).
          Starting a new monthly budget does <strong>not</strong> erase previous months' history. You can restart the application at any time without losing any entered data.
        </p>
      </div>
    </div>
  );
}
