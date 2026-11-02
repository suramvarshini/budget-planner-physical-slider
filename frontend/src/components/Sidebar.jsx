import React from 'react';
import { LayoutDashboard, ReceiptText, Cpu, History, FileDown, ShoppingBag, Zap } from 'lucide-react';
import '../styles/sidebar.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'simulator', label: 'Device Sim', icon: Cpu },
  { id: 'history', label: 'History', icon: History },
  { id: 'reports', label: 'Reports', icon: FileDown },
];

export default function Sidebar({ activePage, onNavigate, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand">
        <Zap size={22} className="brand-icon" />
        {isOpen && <span className="brand-text">Budget Slider</span>}
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            title={!isOpen ? label : undefined}
          >
            <Icon size={20} />
            {isOpen && <span>{label}</span>}
          </button>
        ))}
      </nav>
      {isOpen && (
        <div className="sidebar-footer">
          <div className="sim-badge">SIMULATION MODE</div>
          <div className="sim-device">SIM-DEVICE-001</div>
          <div className="sim-subtext">No ESP32 Required</div>
        </div>
      )}
    </aside>
  );
}
