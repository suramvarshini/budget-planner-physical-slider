import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cpu, Play, Pause, RotateCcw, Sliders, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { formatCurrency, formatPct } from '../utils/formatters';
import OLEDDisplay from '../components/OLEDDisplay';
import LEDIndicator from '../components/LEDIndicator';
import toast from 'react-hot-toast';
import '../styles/simulator.css';

export default function DeviceSimulator({ currentMonth, onRefresh }) {
  const [deviceState, setDeviceState] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [adcValue, setAdcValue] = useState(409);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const autoSimInterval = useRef(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const [devRes, dashRes] = await Promise.all([
        api.getDeviceStatus(),
        api.getDashboard(currentMonth),
      ]);
      setDeviceState(devRes.data);
      setDashData(dashRes.data);
      setAdcValue(devRes.data.adc_reading);
      setIsRunning(Boolean(devRes.data.is_running));
    } catch (err) {
      toast.error('Failed to load simulator state: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Handle ADC Potentiometer Slider Change
  const handleAdcChange = async (e) => {
    const adc = parseInt(e.target.value, 10);
    setAdcValue(adc);
    try {
      const res = await api.simulate(adc);
      setDeviceState(res.data);
      const updatedDash = await api.getDashboard(currentMonth);
      setDashData(updatedDash.data);
      onRefresh();

      if (updatedDash.data.isOverBudget) {
        toast.error(`⚠ Alert: Budget exceeded by ${formatCurrency(updatedDash.data.overspentAmount)}!`);
      }
    } catch (err) {
      toast.error('Simulation update error: ' + err.message);
    }
  };

  // Automated Potentiometer Sweep simulation
  useEffect(() => {
    if (isRunning) {
      let direction = 50;
      autoSimInterval.current = setInterval(async () => {
        setAdcValue(prev => {
          let next = prev + direction;
          if (next >= 4095) { next = 4095; direction = -80; }
          if (next <= 0) { next = 0; direction = 80; }
          api.simulate(next).then(res => {
            setDeviceState(res.data);
            api.getDashboard(currentMonth).then(d => {
              setDashData(d.data);
              onRefresh();
            });
          }).catch(() => {});
          return next;
        });
      }, 1000);
    } else {
      if (autoSimInterval.current) clearInterval(autoSimInterval.current);
    }
    return () => {
      if (autoSimInterval.current) clearInterval(autoSimInterval.current);
    };
  }, [isRunning, currentMonth, onRefresh]);

  const handleToggleRunning = async () => {
    try {
      const res = await api.toggleRunning();
      setIsRunning(Boolean(res.data.is_running));
      toast(res.data.is_running ? '▶ Potentiometer sweep simulation started' : '⏸ Simulation paused (Manual mode)');
    } catch (err) {
      toast.error('Error toggling run state: ' + err.message);
    }
  };

  const handleReset = async () => {
    try {
      const res = await api.resetDevice();
      setDeviceState(res.data);
      setAdcValue(res.data.adc_reading);
      setIsRunning(false);
      const dashRes = await api.getDashboard(currentMonth);
      setDashData(dashRes.data);
      onRefresh();
      toast.success('Simulated device reset to default configuration');
    } catch (err) {
      toast.error('Reset error: ' + err.message);
    }
  };

  const budgetCalculated = deviceState?.monthly_budget ?? Math.round((adcValue / 4095) * 50000);
  const adcPct = ((adcValue / 4095) * 100).toFixed(1);
  const simulatedVolts = ((adcValue / 4095) * 3.3).toFixed(2);
  const potAngle = (adcValue / 4095) * 270 - 135;

  return (
    <div className="simulator-page">
      <div className="sim-header">
        <div className="sim-title-wrap">
          <Cpu size={26} className="sim-icon" />
          <div>
            <h2>Device Simulation (Virtual Hardware Bench)</h2>
            <p className="sim-desc">
              Demonstrates ESP32 microcontroller, 12-bit ADC rotary potentiometer, status LEDs, and SSD1306 OLED without physical hardware.
            </p>
          </div>
        </div>
        <div className="sim-badges">
          <span className="sim-mode-pill">🔵 SOFTWARE SIMULATION MODE</span>
          <span className="sim-status-pill">
            <CheckCircle2 size={14} /> Virtual Hardware Linked
          </span>
        </div>
      </div>

      <div className="sim-main-grid">
        {/* Left Column: Device Breadboard / Enclosure Representation */}
        <div className="device-enclosure-card">
          <div className="enclosure-header">
            <div className="mcu-chip">
              <span className="mcu-brand">ESP32-WROOM-32D</span>
              <span className="mcu-id">DEVICE ID: SIM-DEVICE-001</span>
            </div>
            <div className="connection-tag connected">
              <span className="pulse-dot" /> SIMULATED LINK ACTIVE
            </div>
          </div>

          {/* Telemetry Display Grid */}
          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="t-label">ADC Channel</span>
              <span className="t-val">GPIO 34 (ADC1_CH6)</span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Raw ADC (12-bit)</span>
              <span className="t-val highlight-adc">{adcValue} / 4095</span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Analog Voltage</span>
              <span className="t-val">{simulatedVolts} V (0–3.3V)</span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Mapped Budget</span>
              <span className="t-val highlight-budget">{formatCurrency(budgetCalculated)}</span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Current Expenses</span>
              <span className="t-val">{formatCurrency(dashData?.totalExpenses || 0)}</span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Remaining Balance</span>
              <span className={`t-val ${dashData?.isOverBudget ? 'val-danger' : 'val-safe'}`}>
                {dashData ? (dashData.remainingBalance < 0 ? `-${formatCurrency(Math.abs(dashData.remainingBalance))}` : formatCurrency(dashData.remainingBalance)) : '—'}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Budget Utilization</span>
              <span className="t-val">{formatPct(dashData?.utilizationPct || 0)}</span>
            </div>
            <div className="telemetry-item">
              <span className="t-label">Operating State</span>
              <span className="t-val highlight-mode">{isRunning ? 'AUTO SWEEP' : 'MANUAL CONTROL'}</span>
            </div>
          </div>

          {/* Physical Dual LEDs Simulation */}
          <div className="leds-enclosure">
            <h4>Simulated Breadboard Status LEDs</h4>
            <div className="leds-display-row">
              <LEDIndicator
                isOn={dashData?.greenLED}
                color="green"
                label="GPIO 18: Green LED"
                sublabel={dashData?.greenLED ? 'HIGH (Safe / Within Budget)' : 'LOW (Off)'}
              />
              <LEDIndicator
                isOn={dashData?.redLED}
                color="red"
                label="GPIO 19: Red LED"
                sublabel={dashData?.redLED ? 'HIGH (ALERT: Over Budget)' : 'LOW (Off)'}
              />
            </div>
            <p className="leds-logic-note">
              <strong>Firmware Logic:</strong> When total expenses &ge; monthly budget, GPIO 19 is pulled HIGH (Red ON) and GPIO 18 is pulled LOW (Green OFF).
            </p>
          </div>

          {/* Simulated SSD1306 OLED Display */}
          <div className="oled-enclosure">
            <h4>Simulated I2C OLED Display (0x3C)</h4>
            <OLEDDisplay data={dashData} isSimulated adcReading={adcValue} />
          </div>
        </div>

        {/* Right Column: Interactive Controls */}
        <div className="sim-controls-card">
          <div className="controls-header">
            <Sliders size={20} />
            <h3>Interactive Potentiometer Control</h3>
          </div>

          <p className="ctrl-instruction">
            Drag the slider below to simulate twisting a physical 10k&Omega; rotary potentiometer connected to the ESP32 analog pin.
          </p>

          {/* Graphical Rotary Knob Simulation */}
          <div className="rotary-knob-container">
            <div className="knob-assembly">
              <div className="knob-outer-ring">
                <div
                  className="knob-dial"
                  style={{ transform: `rotate(${potAngle}deg)` }}
                >
                  <div className="knob-marker" />
                </div>
              </div>
            </div>
            <div className="knob-readout">
              <div className="knob-metric">
                <span className="km-label">ROTATION</span>
                <span className="km-val">{adcPct}%</span>
              </div>
              <div className="knob-metric">
                <span className="km-label">ADC VALUE</span>
                <span className="km-val">{adcValue}</span>
              </div>
              <div className="knob-metric">
                <span className="km-label">OUTPUT BUDGET</span>
                <span className="km-val km-highlight">{formatCurrency(budgetCalculated)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Range Input */}
          <div className="adc-slider-control">
            <div className="slider-meta">
              <label htmlFor="adc-range">Simulated Analog Reading: <strong>{adcValue}</strong> (0 &ndash; 4095)</label>
              <span className="volts-tag">{simulatedVolts} V</span>
            </div>
            <input
              id="adc-range"
              type="range"
              min="0"
              max="4095"
              step="1"
              value={adcValue}
              onChange={handleAdcChange}
              className="adc-range-input"
              style={{ '--pct': `${adcPct}%` }}
            />
            <div className="adc-range-legend">
              <span>0 (0V &rarr; ₹0)</span>
              <span>1024 (0.8V)</span>
              <span>2048 (1.65V &rarr; ₹25K)</span>
              <span>3072 (2.47V)</span>
              <span>4095 (3.3V &rarr; ₹50K)</span>
            </div>
          </div>

          {/* Simulation Controls: Run / Pause / Reset */}
          <div className="sim-action-buttons">
            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleToggleRunning}
            >
              {isRunning ? <><Pause size={16} /> Pause Auto Sweep</> : <><Play size={16} /> Start Auto Sweep</>}
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} /> Reset Default State
            </button>
          </div>

          {/* Formula Explainer Card */}
          <div className="formula-card">
            <h4>📐 ESP32 Firmware Conversion Formula</h4>
            <code>
              Monthly Budget = (ADC_Reading / 4095.0) &times; 50000.0<br />
              Remaining Balance = Monthly Budget &minus; Total Expenses<br />
              Utilization (%) = (Total Expenses / Monthly Budget) &times; 100
            </code>
            <p className="formula-sub">
              Formula is implemented cleanly both in the backend calculation engine and inside the optional ESP32 C++ firmware sketch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
