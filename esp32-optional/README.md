# Optional ESP32 Hardware Integration Guide

> [!NOTE]
> Physical hardware is an **optional extension**. The core project includes a complete software simulator on the **"Device Simulation"** tab, fulfilling faculty requirements without buying any components.

---

## 1. Hardware Bill of Materials (BOM)

| Component | Specification | Approximate Cost |
| :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32D / NodeMCU-32S | ₹350 - ₹450 |
| **Potentiometer** | 10kΩ Linear Rotary or Slide Potentiometer | ₹25 - ₹40 |
| **Display** | 0.96 inch I2C SSD1306 OLED (128×64) | ₹180 - ₹250 |
| **Green LED** | 5mm Standard Through-Hole LED | ₹2 |
| **Red LED** | 5mm Standard Through-Hole LED | ₹2 |
| **Resistors** | 2× 220Ω (Current Limiting for LEDs) | ₹2 |
| **Breadboard & Wires**| Half-size Breadboard + Male-to-Male Jumpers | ₹100 |

---

## 2. Pin Wiring Diagram

```
ESP32 Pin         Peripheral Pin        Notes
--------------------------------------------------------------
3.3V       -----> Potentiometer Pin 1   VCC Reference
GND        -----> Potentiometer Pin 3   Ground Reference
GPIO 34    -----> Potentiometer Pin 2   Analog Wiper (ADC1_CH6)

3.3V       -----> OLED VCC              3.3V Power
GND        -----> OLED GND              Ground
GPIO 21    -----> OLED SDA              I2C Data
GPIO 22    -----> OLED SCL              I2C Clock

GPIO 18    -----> 220Ω -> Green LED (+) Safe Status Indicator
GND        -----> Green LED (-)         Cathode to Ground

GPIO 19    -----> 220Ω -> Red LED (+)   Overspending Indicator
GND        -----> Red LED (-)           Cathode to Ground
```

---

## 3. Flashing Instructions (Arduino IDE)

1. Install [Arduino IDE](https://www.arduino.cc/en/software).
2. Add ESP32 Board URL in **File > Preferences**:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install **esp32** board definitions via **Tools > Board > Boards Manager**.
4. Install Required Libraries via **Tools > Manage Libraries**:
   - `Adafruit SSD1306`
   - `Adafruit GFX Library`
   - `ArduinoJson` (v6 or v7)
5. Open `esp32_firmware.ino`.
6. Update `WIFI_SSID`, `WIFI_PASSWORD`, and `BACKEND_URL` with your computer's local IP address.
7. Select Board **ESP32 Dev Module**, select your COM port, and click **Upload**.
