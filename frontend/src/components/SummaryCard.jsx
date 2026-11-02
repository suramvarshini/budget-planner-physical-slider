import React from 'react';
import '../styles/cards.css';

export default function SummaryCard({ title, value, subtitle, icon: Icon, colorClass, loading }) {
  return (
    <div className={`summary-card ${colorClass || ''}`}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        {Icon && <div className="card-icon"><Icon size={20} /></div>}
      </div>
      {loading ? (
        <div className="card-loading">
          <div className="skeleton skeleton-value" />
          <div className="skeleton skeleton-subtitle" />
        </div>
      ) : (
        <>
          <div className="card-value">{value}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </>
      )}
    </div>
  );
}
