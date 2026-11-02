import React from 'react';
import { formatCurrency, formatPct } from '../utils/formatters';
import '../styles/oled.css';

export default function OLEDDisplay({ data, isSimulated = true, adcReading }) {
  const { monthlyBudget, totalExpenses, remainingBalance, utilizationPct, status, label } = data || {};
  const isOver = status === 'exceeded' || (remainingBalance !== undefined && remainingBalance < 0);

  return (
    <div className="oled-container">
      <div className="oled-bezel">
        <div className="oled-screen-header">
          <span className="oled-chip-name">SSD1306 128x64 OLED</span>
          {isSimulated && <span className="oled-tag">SIMULATED DISPLAY</span>}
        </div>
        <div className="oled-screen">
          <div className="oled-content">
            <div className="oled-row oled-header-row">
              <span className="oled-device-id">SIM-DEVICE-001</span>
              {adcReading !== undefined && <span className="oled-adc">ADC:{adcReading}</span>}
            </div>
            <div className="oled-divider">═════════════════════</div>
            <div className="oled-row">
              <span className="oled-key">BUDGET:</span>
              <span className="oled-val">{formatCurrency(monthlyBudget || 0)}</span>
            </div>
            <div className="oled-row">
              <span className="oled-key">EXPENSE:</span>
              <span className="oled-val">{formatCurrency(totalExpenses || 0)}</span>
            </div>
            <div className="oled-row">
              <span className="oled-key">{isOver ? 'OVERSPENT:' : 'BALANCE:'}</span>
              <span className={`oled-val ${isOver ? 'oled-alert' : 'oled-normal'}`}>
                {isOver ? `-${formatCurrency(Math.abs(remainingBalance || 0))}` : formatCurrency(remainingBalance || 0)}
              </span>
            </div>
            <div className="oled-row">
              <span className="oled-key">USED:</span>
              <span className="oled-val">{formatPct(utilizationPct || 0)}</span>
            </div>
            <div className="oled-divider">─────────────────────</div>
            <div className={`oled-footer-status ${isOver ? 'oled-status-danger' : 'oled-status-safe'}`}>
              {isOver ? '⚠ OVER BUDGET ⚠' : `STATUS: ${(label || 'ON TRACK').toUpperCase()}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
