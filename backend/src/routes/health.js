const express = require('express');
const router = express.Router();
const config = require('../config');

router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    mode: config.SIMULATION_MODE ? 'simulation' : 'production',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Budget Planner API is running',
  });
});

module.exports = router;
