# REST API Specification

The Express backend provides clean, rate-limited REST endpoints returning standard JSON formats.

Base URL: `http://localhost:5000/api`

---

## 1. System Health
### `GET /api/health`
Returns the operational health and simulation mode of the server.
```json
{
  "success": true,
  "status": "online",
  "mode": "simulation",
  "timestamp": "2026-10-27T14:45:00.000Z",
  "version": "1.0.0",
  "message": "Budget Planner API is running"
}
```

---

## 2. Dashboard Summary
### `GET /api/dashboard?month=YYYY-MM`
Returns derived financial metrics, active LED states, alerts, and category aggregations.
- **Query Parameter**: `month` (e.g., `2026-10`, defaults to current ISO month).
- **Response**:
```json
{
  "success": true,
  "data": {
    "month": "2026-10",
    "monthlyBudget": 8000,
    "totalExpenses": 6680,
    "remainingBalance": 1320,
    "utilizationPct": 83.5,
    "expenseCount": 8,
    "status": "warning",
    "color": "yellow",
    "label": "Warning",
    "greenLED": true,
    "redLED": false,
    "alertLevel": { "level": "warning", "message": "Warning: 75%+ of budget used." },
    "isOverBudget": false,
    "overspentAmount": 0,
    "byCategory": { "Food": 1880, "Transport": 450, "Bills": 800, "Education": 1500, "Shopping": 1200, "Healthcare": 500, "Entertainment": 350, "Other": 0 },
    "byDate": { "2026-10-01": 1200, "2026-10-02": 450, ... }
  }
}
```

---

## 3. Budget Configuration
### `GET /api/budget?month=YYYY-MM`
Retrieve the saved budget target for a specific month.

### `PUT /api/budget`
Update or create the monthly budget.
- **Request Body**:
```json
{
  "month": "2026-10",
  "monthly_budget": 9500
}
```
- **Validation**: `monthly_budget` must be between ₹0 and ₹50,000.

---

## 4. Expenses Management
### `GET /api/expenses?month=YYYY-MM&category=Food`
Retrieve expense records with optional category filtering.

### `POST /api/expenses`
Create a new expense record.
- **Request Body**:
```json
{
  "category": "Food",
  "amount": 750.50,
  "description": "Weekly grocery staples",
  "expense_date": "2026-10-22"
}
```

### `PUT /api/expenses/:id`
Update an existing expense record by ID.

### `DELETE /api/expenses/:id`
Delete an expense record by ID.

---

## 5. Device Simulation
### `GET /api/device/status`
Returns the simulated ESP32 device status, ADC reading, and connection flags.

### `POST /api/device/simulate`
Simulates moving the physical potentiometer.
- **Request Body**: `{ "adc_reading": 2048 }` (Range: 0 - 4095)

### `POST /api/device/reset`
Resets the simulator to default settings (ADC = 409 -> ₹5,000).

### `POST /api/device/toggle-running`
Toggles between manual potentiometer control and automated sweep simulation.

---

## 6. Reports & Product Lookup
### `GET /api/history`
Returns monthly summaries for all months with historical records.

### `GET /api/reports/csv?month=YYYY-MM&type=expenses|budget`
Returns an RFC-compliant `.csv` download stream.

### `GET /api/products/search?q=query&category=Food`
Returns curated reference demo prices for the expense planning module.
