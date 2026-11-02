import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, X } from 'lucide-react';
import '../styles/alerts.css';

const alertConfig = {
  info: { icon: Info, className: 'alert-info', title: '50% Budget Utilization Notice' },
  warning: { icon: AlertTriangle, className: 'alert-warning', title: '75% Budget Warning' },
  critical: { icon: AlertCircle, className: 'alert-critical', title: '90% Critical Budget Threshold' },
  exceeded: { icon: ShieldAlert, className: 'alert-exceeded', title: '🚨 OVER BUDGET ALERT (100%+)' },
};

export default function AlertBanner({ alertLevel, message, onDismiss }) {
  if (!alertLevel) return null;
  const config = alertConfig[alertLevel] || alertConfig.info;
  const Icon = config.icon;

  return (
    <div className={`alert-banner ${config.className}`} role="alert">
      <div className="alert-icon-wrap">
        <Icon size={22} />
      </div>
      <div className="alert-content">
        <strong>{config.title}</strong>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss alert">
          <X size={18} />
        </button>
      )}
    </div>
  );
}
