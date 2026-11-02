import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import '../styles/slider.css';

const MIN = 0;
const MAX = 50000;

export default function BudgetSlider({ currentBudget, currentMonth, onBudgetChange }) {
  const [sliderValue, setSliderValue] = useState(currentBudget ?? 5000);
  const [inputValue, setInputValue] = useState(currentBudget ?? 5000);
  const [stepSize, setStepSize] = useState(500);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBudget !== undefined && currentBudget !== null) {
      setSliderValue(currentBudget);
      setInputValue(currentBudget);
    }
  }, [currentBudget]);

  const handleSliderChange = async (e) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    setInputValue(val);
    // Trigger immediate recalculation/save
    try {
      await api.updateBudget(val, currentMonth);
      if (onBudgetChange) onBudgetChange(val);
    } catch (err) {
      toast.error('Failed to update budget: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setInputValue(val);
    if (val !== '' && !isNaN(val) && val >= MIN && val <= MAX) {
      setSliderValue(val);
    }
  };

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    const val = Number(inputValue);
    if (isNaN(val) || val < MIN || val > MAX) {
      toast.error(`Please enter an amount between ₹0 and ₹${MAX.toLocaleString('en-IN')}`);
      return;
    }
    setSaving(true);
    try {
      await api.updateBudget(val, currentMonth);
      setSliderValue(val);
      if (onBudgetChange) onBudgetChange(val);
      toast.success(`Monthly budget updated to ${formatCurrency(val)}`);
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const pct = Math.min(100, Math.max(0, (sliderValue / MAX) * 100));

  return (
    <div className="budget-slider-card">
      <div className="slider-header">
        <div>
          <h3>Digital Budget Potentiometer Slider</h3>
          <span className="slider-desc">Simulates a physical rotary potentiometer input (0 to ₹50,000)</span>
        </div>
        <div className="step-selector">
          <label htmlFor="step-size">Step Size:</label>
          <select
            id="step-size"
            value={stepSize}
            onChange={e => setStepSize(Number(e.target.value))}
            className="step-select"
          >
            <option value={100}>₹100</option>
            <option value={250}>₹250</option>
            <option value={500}>₹500</option>
            <option value={1000}>₹1,000</option>
          </select>
        </div>
      </div>

      <div className="slider-display">
        <span className="slider-label">Current Monthly Budget ({currentMonth})</span>
        <div className="slider-amount">{formatCurrency(sliderValue)}</div>
        <div className="slider-subtext">{pct.toFixed(1)}% of maximum ₹50,000 limit</div>
      </div>

      <div className="slider-track-wrapper">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={stepSize}
          value={sliderValue}
          onChange={handleSliderChange}
          className="budget-range"
          style={{ '--pct': `${pct}%` }}
          aria-label="Digital Budget Slider"
        />
        <div className="slider-labels">
          <span>₹0 (Min)</span>
          <span>₹12,500</span>
          <span>₹25,000 (Mid)</span>
          <span>₹37,500</span>
          <span>₹50,000 (Max)</span>
        </div>
      </div>

      <form className="slider-manual" onSubmit={handleInputSubmit}>
        <label htmlFor="exact-budget-input">Direct Numeric Input:</label>
        <div className="slider-input-row">
          <span className="rupee-prefix">₹</span>
          <input
            id="exact-budget-input"
            type="number"
            min={MIN}
            max={MAX}
            step={stepSize}
            value={inputValue}
            onChange={handleInputChange}
            className="budget-input"
            placeholder="e.g. 8000"
          />
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Updating...' : 'Set Budget'}
          </button>
        </div>
      </form>
    </div>
  );
}
