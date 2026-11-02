-- ==============================================================================
-- BUDGET PLANNER PHYSICAL SLIDER - DATABASE SCHEMA
-- Compatible with SQLite (local development) and portable to Amazon DynamoDB / PostgreSQL
-- ==============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. Monthly Budget Configuration Table
-- Persists the user's configured monthly budget limit in Indian Rupees (₹)
CREATE TABLE IF NOT EXISTS budget_settings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  month          TEXT    NOT NULL UNIQUE,           -- Format: YYYY-MM (e.g. '2026-10')
  monthly_budget REAL    NOT NULL DEFAULT 5000,     -- Value between 0 and 50000 INR
  created_at     TEXT    DEFAULT (datetime('now')),
  updated_at     TEXT    DEFAULT (datetime('now'))
);

-- Index for rapid monthly lookups
CREATE INDEX IF NOT EXISTS idx_budget_settings_month ON budget_settings(month);

-- 2. Granular Expense Records Table
-- Stores all recorded expense transactions for each month
CREATE TABLE IF NOT EXISTS expenses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  month        TEXT    NOT NULL,                    -- Format: YYYY-MM
  category     TEXT    NOT NULL,                    -- 'Food','Transport','Shopping','Bills','Education','Healthcare','Entertainment','Other'
  amount       REAL    NOT NULL CHECK(amount > 0),  -- Must be positive number in INR
  description  TEXT    DEFAULT '',                  -- Description or merchant name
  expense_date TEXT    NOT NULL,                    -- ISO Date: YYYY-MM-DD
  created_at   TEXT    DEFAULT (datetime('now')),
  updated_at   TEXT    DEFAULT (datetime('now'))
);

-- Indexes for month and category filtering
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- 3. Budget Alerts History Table
-- Logs threshold crossing events (50%, 75%, 90%, 100%+ Exceeded)
CREATE TABLE IF NOT EXISTS alert_history (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  month         TEXT    NOT NULL,                   -- Format: YYYY-MM
  alert_type    TEXT    NOT NULL,                   -- 'info', 'warning', 'critical', 'exceeded'
  threshold_pct REAL,                               -- Percentage threshold crossed
  message       TEXT,                               -- Alert description
  triggered_at  TEXT    DEFAULT (datetime('now'))
);

-- 4. Simulated Hardware Device State Table
-- Tracks the virtual ESP32 device, potentiometer ADC reading (0-4095), and connection status
CREATE TABLE IF NOT EXISTS device_state (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id      TEXT    NOT NULL DEFAULT 'SIM-DEVICE-001',
  adc_reading    INTEGER NOT NULL DEFAULT 409,      -- 12-bit ADC value (0 - 4095)
  monthly_budget REAL    NOT NULL DEFAULT 5000,     -- Calculated INR budget
  is_connected   INTEGER DEFAULT 1,                 -- 1 = Connected (Simulated), 0 = Disconnected
  is_running     INTEGER DEFAULT 0,                 -- 1 = Auto Sweep Mode, 0 = Manual Mode
  last_updated   TEXT    DEFAULT (datetime('now'))
);

-- Seed initial device state row
INSERT OR IGNORE INTO device_state (id, device_id, adc_reading, monthly_budget, is_connected, is_running)
VALUES (1, 'SIM-DEVICE-001', 409, 5000, 1, 0);
