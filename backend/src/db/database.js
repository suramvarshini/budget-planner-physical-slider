/**
 * Database layer using Node.js built-in `node:sqlite` module
 * Available in Node v22.5+ (we have v26.7.0) — zero npm packages required.
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs   = require('fs');
const config = require('../config');

let db = null;

function getDB() {
  if (db) return db;

  const dir = path.dirname(config.DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new DatabaseSync(config.DB_PATH);
  initSchema(db);
  return db;
}

function initSchema(database) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS budget_settings (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      month          TEXT    NOT NULL UNIQUE,
      monthly_budget REAL    NOT NULL DEFAULT 5000,
      created_at     TEXT    DEFAULT (datetime('now')),
      updated_at     TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      month        TEXT NOT NULL,
      category     TEXT NOT NULL,
      amount       REAL NOT NULL CHECK(amount > 0),
      description  TEXT DEFAULT '',
      expense_date TEXT NOT NULL,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alert_history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      month         TEXT NOT NULL,
      alert_type    TEXT NOT NULL,
      threshold_pct REAL,
      message       TEXT,
      triggered_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS device_state (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id      TEXT    NOT NULL DEFAULT 'SIM-DEVICE-001',
      adc_reading    INTEGER NOT NULL DEFAULT 409,
      monthly_budget REAL    NOT NULL DEFAULT 5000,
      is_connected   INTEGER DEFAULT 1,
      is_running     INTEGER DEFAULT 0,
      last_updated   TEXT    DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO device_state (id, device_id, adc_reading, monthly_budget, is_connected, is_running)
    VALUES (1, 'SIM-DEVICE-001', 409, 5000, 1, 0);
  `);
}

module.exports = { getDB };
