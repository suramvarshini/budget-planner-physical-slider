import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import DeviceSimulator from './pages/DeviceSimulator';
import History from './pages/History';
import Reports from './pages/Reports';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(t => t + 1);

  const pages = {
    dashboard: (
      <Dashboard
        currentMonth={currentMonth}
        refreshTrigger={refreshTrigger}
        onRefresh={triggerRefresh}
        onNavigate={setActivePage}
      />
    ),
    expenses: (
      <Expenses
        currentMonth={currentMonth}
        onRefresh={triggerRefresh}
      />
    ),
    simulator: (
      <DeviceSimulator
        currentMonth={currentMonth}
        onRefresh={triggerRefresh}
      />
    ),
    history: (
      <History />
    ),
    reports: (
      <Reports
        currentMonth={currentMonth}
      />
    ),
  };

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
      />
      <div className="main-content">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
        <main className="page-content">
          {pages[activePage] || pages.dashboard}
        </main>
      </div>
    </div>
  );
}
