const { getDB } = require('../db/database');
const { adcToBudget } = require('./calculationEngine');

function getDeviceState() {
  return getDB().prepare('SELECT * FROM device_state WHERE id = 1').get();
}

function updateDeviceState(updates) {
  const db = getDB();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE device_state SET
      adc_reading    = COALESCE(@adc_reading,    adc_reading),
      monthly_budget = COALESCE(@monthly_budget, monthly_budget),
      is_connected   = COALESCE(@is_connected,   is_connected),
      is_running     = COALESCE(@is_running,     is_running),
      last_updated   = @last_updated
    WHERE id = 1
  `).run({ ...updates, last_updated: now });
  return getDeviceState();
}

function simulateReading(adcReading) {
  const budget = adcToBudget(adcReading);
  return updateDeviceState({ adc_reading: adcReading, monthly_budget: budget });
}

function resetDevice() {
  getDB().prepare(`
    UPDATE device_state
    SET adc_reading = 409, monthly_budget = 5000,
        is_connected = 1, is_running = 0,
        last_updated = datetime('now')
    WHERE id = 1
  `).run();
  return getDeviceState();
}

module.exports = { getDeviceState, updateDeviceState, simulateReading, resetDevice };
