import React from 'react';
import '../styles/led.css';

export default function LEDIndicator({ isOn, color, label, sublabel }) {
  return (
    <div className={`led-wrapper ${isOn ? 'active' : 'inactive'}`}>
      <div className="led-housing">
        <div className={`led-bulb led-${color} ${isOn ? 'led-on' : 'led-off'}`}>
          <div className="led-glow" />
          <div className="led-reflection" />
        </div>
      </div>
      <div className="led-text">
        <span className="led-label">{label}</span>
        {sublabel && <span className="led-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}
