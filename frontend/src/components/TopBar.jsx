import React, { useEffect, useState } from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import { api } from '../api/client';
import '../styles/topbar.css';

export default function TopBar({ onToggleSidebar, currentMonth, onMonthChange }) {
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await api.health();
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };
    check();
    const t = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className="topbar-title">
          <h1>Budget Planner Physical Slider</h1>
          <span className="topbar-subtitle">Interactive Smart Simulation Dashboard</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="month-selector">
          <label htmlFor="month-select">Month:</label>
          <input
            id="month-select"
            type="month"
            value={currentMonth}
            onChange={e => onMonthChange(e.target.value)}
            className="month-input"
          />
        </div>
        <div className={`backend-status ${backendOnline === null ? 'checking' : backendOnline ? 'online' : 'offline'}`}>
          {backendOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{backendOnline === null ? 'Connecting...' : backendOnline ? 'Backend Online' : 'Backend Offline'}</span>
        </div>
      </div>
    </header>
  );
}
