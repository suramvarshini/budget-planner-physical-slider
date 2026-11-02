# Budget Planner Physical Slider
### Smart Budget Monitoring and Simulation System with Potentiometer, Dual LED & OLED Emulation

An interactive financial simulation dashboard and embedded device emulator designed for college presentations, IoT capstone evaluations, and personal budget planning.

> [!IMPORTANT]
> **Faculty Evaluation Guarantee**: This project includes a **100% functional software-only simulation mode**. It runs entirely locally on any standard computer **without** requiring physical ESP32 hardware, breadboard wiring, an AWS account, or paid cloud subscriptions. Physical hardware and AWS cloud features are designed as optional drop-in extensions.

---

## 1. Key Features

- 🎚️ **Digital Potentiometer Slider**: Interactive slider mapping 12-bit ADC range ($0 - 4095$) linearly to monthly budgets from **₹0 to ₹50,000** with live calculation updates.
- 💡 **Dual Status LED Simulation**:
  - **Green LED (GPIO 18)**: Active while total expenses are within budget ($< 100\%$).
  - **Red LED (GPIO 19)**: Pulses dynamically when budget is exceeded ($\ge 100\%$).
- 📟 **SSD1306 I2C OLED Screen Preview**: Pixel-perfect retro monochrome digital display mirroring simulated MCU telemetry, budget, spent, balance, and alert states.
- 📊 **Dynamic Charts (Chart.js)**:
  - Spending Breakdown by Category (Doughnut)
  - Daily Expense Trends (Bar chart)
  - Budget vs. Actual Spending Comparison
- 💸 **Full Expense Management**: Add, edit, delete, categorize (Food, Transport, Bills, Shopping, Healthcare, Education, Entertainment, Other), with strict input validation.
- 🛒 **Reference Price Lookup (Expense Estimator)**: Curated catalog of standard living and student expenses to propose future spending drafts.
- 🚨 **Multi-Tier Budget Threshold Alerts**: Real-time notifications at **50%** (Info), **75%** (Warning), **90%** (Critical), and **100%+** (Exceeded).
- 💾 **Reliable Local Persistence**: Persistent SQLite database preserving records across application restarts; new monthly budgets never erase previous months' history.
- 📥 **CSV Data Export**: One-click spreadsheet export for monthly or all-time expenses and budget audit logs.
- 🧪 **Comprehensive Automated Testing**: 43 automated unit and integration tests passing across backend and frontend.

---

## 2. Technology Stack

- **Frontend**: React 19, Vite 8, Chart.js, react-chartjs-2, Lucide React, react-hot-toast.
- **Backend**: Node.js v22+ / v26, Express.js, Rate Limiting, Input Validation.
- **Database**: Native SQLite (`node:sqlite`) with Write-Ahead Logging (`WAL`).
- **Testing**: Node.js built-in test runner (backend) & Vitest with JSDOM (frontend).
- **Optional Extensions**: Arduino C++ firmware for ESP32 & AWS IoT Core / Lambda / DynamoDB / SNS templates.

---

## 3. Project Directory Structure

```text
budget-planner/
├── backend/
│   ├── src/
│   │   ├── server.js               # Express application entry
│   │   ├── config.js               # Central configuration module
│   │   ├── db/
│   │   │   ├── database.js         # SQLite database initialization
│   │   │   └── seed.js             # Sample data seeder
│   │   ├── routes/
│   │   │   ├── health.js           # Server health & mode
│   │   │   ├── dashboard.js        # Main dashboard metrics
│   │   │   ├── budget.js           # Monthly budget targets
│   │   │   ├── expenses.js         # Expense CRUD endpoints
│   │   │   ├── device.js           # Simulator device state & controls
│   │   │   ├── history.js          # Multi-month trend summaries
│   │   │   ├── reports.js          # RFC-compliant CSV generation
│   │   │   └── products.js         # Reference price lookup
│   │   ├── middleware/             # Validation, rate limiting, error handling
│   │   └── services/               # Calculation engine & simulator logic
│   ├── tests/                      # Calculation & API integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                    # Central API client
│   │   ├── components/             # BudgetSlider, LEDIndicator, OLEDDisplay, etc.
│   │   ├── pages/                  # Dashboard, Expenses, Simulator, History, Reports
│   │   ├── styles/                 # Dark-mode CSS design system
│   │   ├── utils/                  # Currency (₹) & date formatters
│   │   └── __tests__/              # Vitest test suite
│   ├── vite.config.js              # Proxy & test configuration
│   └── package.json
├── database/
│   └── schema.sql                  # Documented SQL schema
├── esp32-optional/
│   ├── esp32_firmware.ino          # Arduino C++ sketch for physical ESP32
│   └── README.md                   # Wiring & BOM guide
├── aws/
│   ├── mqtt_telemetry_schema.json  # AWS IoT Core JSON schema
│   ├── lambda_budget_processor.js  # Serverless telemetry handler
│   ├── dynamodb_schema.json        # Cloud database specification
│   ├── sns_alert_policy.json       # Notification policy
│   └── ec2_deployment_guide.md     # Production Ubuntu deployment guide
├── docs/
│   ├── ARCHITECTURE.md             # Architecture diagrams & formulas
│   ├── FACULTY_DEMO_GUIDE.md       # Step-by-step viva demo script
│   └── API_SPECIFICATION.md        # Full REST API documentation
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Quick Start & Installation

### Prerequisites
- **Node.js**: v22.5.0 or higher (Tested on Node.js v26.7.0).
- **Web Browser**: Chrome, Edge, Firefox, or Safari.

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "c:\Users\suram\Favorites\Downloads\cloud-budgetplanner physical slider"
```

### Step 2: Configure Environment
Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

### Step 3: Seed the Database
Initialize and seed the local SQLite database with realistic sample expense records:
```powershell
cd backend
node src/db/seed.js
cd ..
```

---

## 5. Running the Application

Open two terminal windows:

### Terminal 1 — Start Backend Server
```powershell
cd backend
npm start
```
*Backend runs at: `http://localhost:5000`*  
*Health Check: `http://localhost:5000/api/health`*

### Terminal 2 — Start Frontend Dashboard
```powershell
cd frontend
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

Open **`http://localhost:5173`** in your browser.

---

## 6. Running the Automated Tests

### Backend Unit & Integration Tests (31 Tests)
```powershell
cd backend
npm test
```
*Covers calculations, zero-division safety, 12-bit ADC mapping, alert rules, and all REST CRUD endpoints.*

### Frontend Unit Tests (12 Tests)
```powershell
cd frontend
npm test
```
*Covers currency formatting (₹), percentage calculations, status color mapping, and UI formula validation.*

### Production Build Verification
```powershell
cd frontend
npm run build
```
*Builds production bundles without syntax or bundling errors.*

---

## 7. Faculty Demonstration Workflow

For an interactive review session with evaluators:
1. **Show Health & Simulation Status**: Point to the top bar (`Backend Online`) and sidebar indicator (`SIMULATION MODE`).
2. **Move the Budget Slider**: Change the budget from ₹8,000 to ₹4,000. Point out the instantaneous update:
   - Balance turns red (Overspent).
   - Red LED lights up.
   - OLED screen alerts `!!! OVER BUDGET !!!`.
3. **Add an Expense via Estimator**: Go to **Expenses > Price Reference Lookup**, choose *"Broadband Internet"*, and save the proposed expense.
4. **Open the Device Simulation Bench**: Go to **Device Sim**, adjust the virtual potentiometer, observe the rotary knob rotating, and start the **Auto Sweep** mode.
5. **Demonstrate Persistence**: Stop and restart the backend server. Refresh the browser to prove all entries remain intact in SQLite.
6. **Export CSV**: Go to **Reports** and download the monthly CSV report to inspect in Excel.

*(See [`docs/FACULTY_DEMO_GUIDE.md`](docs/FACULTY_DEMO_GUIDE.md) for the complete script.)*

---

## 8. Optional Extensions (Hardware & Cloud)

- **Physical ESP32 Firmware**: Complete sketch available in [`esp32-optional/esp32_firmware.ino`](esp32-optional/esp32_firmware.ino).
- **AWS Cloud Setup**: IoT Core telemetry schemas, DynamoDB specs, Lambda functions, and EC2 instructions are prepared in [`aws/`](aws/).
