const express = require('express');
const router = express.Router();
const { getDeviceState, updateDeviceState, simulateReading, resetDevice } = require('../services/deviceSimulator');
const { validateAdcReading } = require('../middleware/validate');
const { getDB } = require('../db/database');

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }

// GET /api/device/status
router.get('/status', (req, res, next) => {
  try {
    const state = getDeviceState();
    res.json({ success: true, data: { ...state, deviceId: state.device_id, isSimulated: true, mode: 'SIMULATION MODE' } });
  } catch (err) { next(err); }
});

// POST /api/device/simulate
router.post('/simulate', validateAdcReading, (req, res, next) => {
  try {
    const db = getDB();
    const state = simulateReading(parseInt(req.body.adc_reading));
    const month = getCurrentMonth();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO budget_settings (month, monthly_budget, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(month) DO UPDATE SET monthly_budget = excluded.monthly_budget, updated_at = excluded.updated_at
    `).run(month, state.monthly_budget, now);
    res.json({ success: true, data: { ...state, isSimulated: true }, message: 'Simulation updated' });
  } catch (err) { next(err); }
});

// POST /api/device/reset
router.post('/reset', (req, res, next) => {
  try {
    const state = resetDevice();
    res.json({ success: true, data: { ...state, isSimulated: true }, message: 'Device reset to defaults' });
  } catch (err) { next(err); }
});

// POST /api/device/toggle-running
router.post('/toggle-running', (req, res, next) => {
  try {
    const current = getDeviceState();
    const state = updateDeviceState({ is_running: current.is_running ? 0 : 1 });
    res.json({ success: true, data: state });
  } catch (err) { next(err); }
});

module.exports = router;
