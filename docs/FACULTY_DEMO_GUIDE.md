# Step-by-Step Faculty Demonstration Workflow

This guide provides an exact, bullet-proof walkthrough for demonstrating the **Budget Planner Physical Slider** project to your college evaluators and faculty.

---

## Step 1: Verification of Operating Mode
1. Open the web application at `http://localhost:5173`.
2. Point out the top-right header: **"Backend Online"** with a green WiFi indicator.
3. Point out the left sidebar badge: **"SIMULATION MODE • SIM-DEVICE-001"**.
4. Explain to faculty:
   > *"The project is designed to demonstrate an embedded IoT system. Because our lab environment does not assume physical hardware availability, the software provides a full 12-bit ADC device simulation without needing an actual ESP32 or breadboard."*

---

## Step 2: Digital Potentiometer & Real-Time Calculation
1. On the **Dashboard**, locate the **Digital Budget Potentiometer Slider**.
2. Notice the default budget (₹8,000 for October 2026 with seeded sample data).
3. Slide the digital control to the left towards **₹4,000**:
   - Show how the budget immediately drops below current expenses (₹6,680).
   - Point out that the **Remaining Balance** turns red and shows `-₹2,680` with the label `Overspent by ₹2,680`.
   - Point out the **Alert Banner**: `🚨 OVER BUDGET ALERT (100%+)`.
   - Point out the **Hardware Simulation Monitor**:
     - **Green Status LED** turns **OFF**.
     - **Red Overspending LED** turns **ON** and pulses.
     - **SSD1306 OLED Screen** highlights `!!! OVER BUDGET !!!` in red.
4. Now slide the budget up to **₹15,000**:
   - Notice the status immediately returns to **On Track (Green)**.
   - Remaining balance becomes positive `+₹8,320`.
   - Red LED turns OFF; Green LED illuminates.

---

## Step 3: Expense Management & Product Price Lookup
1. Click **Expenses** in the sidebar.
2. Show the existing 8 expense records for October 2026.
3. Click **"Price Reference Lookup"**:
   - Search for *"Internet"* or *"Broadband"*.
   - Point out the `ESTIMATE` badge and unit price.
   - Click **"Propose Expense"**: Explain that it pre-fills the form as a draft without saving blindly.
4. Click **"Save Expense"**:
   - The new item is saved into SQLite.
   - Return to the Dashboard to show that total expenses and charts updated immediately.
5. Click **Edit** or **Delete** on an expense to demonstrate full REST CRUD capability.

---

## Step 4: Device Simulation Bench (Virtual Hardware)
1. Navigate to the **"Device Sim"** tab in the sidebar.
2. Walk the faculty through the simulated ESP32 bench:
   - **ESP32-WROOM-32D** chip information and simulated connection status.
   - **GPIO 34 ADC value**: 0 to 4095.
   - **Calculated Analog Voltage**: $0\text{V}$ to $3.3\text{V}$.
   - **Rotary Potentiometer Dial**: Move the slider and show the virtual knob rotating with live angle calculation.
3. Click **"Start Auto Sweep"**:
   - Watch the simulated potentiometer sweep through ADC values automatically, triggering live threshold crossings and LED toggles.
4. Click **"Pause Auto Sweep"** and **"Reset Default State"** to restore.

---

## Step 5: Data Persistence & Historical Reports
1. Navigate to **"History"**:
   - Show the bar chart comparing September 2026 and October 2026.
   - Explain that changing a month's budget does not delete historical records.
2. Navigate to **"Reports"**:
   - Click **"Download Current Month CSV"**: Open the downloaded file in Excel to show actual transaction data.
   - Click **"Download Budget Settings CSV"**: Demonstrate configuration audit trail.
3. Stop the backend server and start it again:
   - Refresh the page to prove data was persisted to SQLite disk storage.
