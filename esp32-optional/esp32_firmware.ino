/**
 * ==============================================================================
 * BUDGET PLANNER PHYSICAL SLIDER - OPTIONAL ESP32 FIRMWARE
 * Microcontroller: ESP32-WROOM-32D / ESP32 NodeMCU
 * Peripherals:
 *   - 10k Rotary Potentiometer -> GPIO 34 (ADC1_CH6, 12-bit: 0 - 4095)
 *   - SSD1306 0.96" I2C OLED (128x64) -> SDA: GPIO 21, SCL: GPIO 22
 *   - Green Status LED -> GPIO 18 (Current Limit Resistor: 220 Ohm)
 *   - Red Overspending LED -> GPIO 19 (Current Limit Resistor: 220 Ohm)
 * ==============================================================================
 * NOTE FOR COLLEGE PRESENTATION:
 * This physical firmware is an OPTIONAL hardware extension.
 * The web application provides a full software simulator so physical
 * hardware is NOT required for faculty evaluation.
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// --- Pin Definitions ---
#define POT_PIN         34      // ADC1 Channel 6
#define GREEN_LED_PIN   18      // Safe / Within Budget
#define RED_LED_PIN     19      // Alert / Over Budget

// --- OLED Parameters ---
#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1
#define SCREEN_ADDRESS  0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- Network Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.100:5000/api"; // Replace with PC IP
const char* DEVICE_ID     = "ESP32-HARDWARE-001";

// --- State Variables ---
int lastAdcValue = -1;
float calculatedBudget = 5000.0;
float currentExpenses = 0.0;
float remainingBalance = 5000.0;
float utilizationPct = 0.0;
bool isOverBudget = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 2000; // 2 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- Budget Planner Physical Slider Firmware Booting ---");

  // GPIO Pin Modes
  pinMode(POT_PIN, INPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);

  // Initial LED State: Green ON
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);

  // Initialize I2C OLED
  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Warning: SSD1306 allocation failed. Proceeding without OLED."));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 10);
    display.println("BUDGET PLANNER HW");
    display.println("Device: ESP32-001");
    display.println("Initializing WiFi...");
    display.display();
  }

  // Connect to WiFi
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nConnected! IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi not connected. Running in offline standalone simulation mode.");
  }
}

void loop() {
  // Read Potentiometer (Average 5 samples for ADC noise reduction)
  int rawAdc = 0;
  for (int i = 0; i < 5; i++) {
    rawAdc += analogRead(POT_PIN);
    delay(2);
  }
  rawAdc /= 5;

  // Linear Conversion: 0 - 4095 ADC -> INR 0 to 50,000 Budget
  calculatedBudget = (rawAdc / 4095.0) * 50000.0;

  // Only trigger sync if reading changed significantly (+/- 30 counts) or interval passed
  if (abs(rawAdc - lastAdcValue) > 30 || (millis() - lastTelemetryTime > TELEMETRY_INTERVAL_MS)) {
    lastAdcValue = rawAdc;
    lastTelemetryTime = millis();

    // Sync state with local backend API
    syncWithBackend(rawAdc, calculatedBudget);

    // Update LED hardware indicators
    updateLEDs();

    // Render on physical OLED screen
    updateOLED(rawAdc);
  }

  delay(100);
}

void syncWithBackend(int adc, float budget) {
  if (WiFi.status() != WL_CONNECTED) {
    // Offline simulation calculation fallback
    remainingBalance = budget - currentExpenses;
    utilizationPct = (budget > 0) ? (currentExpenses / budget) * 100.0 : 0.0;
    isOverBudget = (currentExpenses >= budget);
    return;
  }

  HTTPClient http;
  String endpoint = String(BACKEND_URL) + "/device/simulate";
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> reqDoc;
  reqDoc["adc_reading"] = adc;
  String reqBody;
  serializeJson(reqDoc, reqBody);

  int httpCode = http.POST(reqBody);
  if (httpCode == HTTP_CODE_OK) {
    String resp = http.getString();
    StaticJsonDocument<512> respDoc;
    deserializeJson(respDoc, resp);

    // Also pull latest dashboard total expenses
    HTTPClient dashHttp;
    dashHttp.begin(String(BACKEND_URL) + "/dashboard");
    int dashCode = dashHttp.GET();
    if (dashCode == HTTP_CODE_OK) {
      StaticJsonDocument<1024> dashDoc;
      deserializeJson(dashDoc, dashHttp.getString());
      currentExpenses = dashDoc["data"]["totalExpenses"] | 0.0;
      remainingBalance = dashDoc["data"]["remainingBalance"] | 0.0;
      utilizationPct = dashDoc["data"]["utilizationPct"] | 0.0;
      isOverBudget = dashDoc["data"]["isOverBudget"] | false;
    }
    dashHttp.end();
  } else {
    Serial.printf("HTTP Sync failed: %d\n", httpCode);
  }
  http.end();
}

void updateLEDs() {
  if (isOverBudget) {
    // Red LED ON, Green LED OFF
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, HIGH);
  } else {
    // Green LED ON, Red LED OFF
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
  }
}

void updateOLED(int adc) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Line 1: Header
  display.setCursor(0, 0);
  display.printf("ESP32 HW | ADC:%d\n", adc);
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Line 2: Budget
  display.setCursor(0, 14);
  display.printf("Budget : Rs.%.0f\n", calculatedBudget);

  // Line 3: Expenses
  display.setCursor(0, 24);
  display.printf("Spent  : Rs.%.0f\n", currentExpenses);

  // Line 4: Balance
  display.setCursor(0, 34);
  if (isOverBudget) {
    display.printf("OVER   : -Rs.%.0f\n", abs(remainingBalance));
  } else {
    display.printf("Left   : Rs.%.0f\n", remainingBalance);
  }

  // Line 5: Utilization
  display.setCursor(0, 44);
  display.printf("Used   : %.1f%%\n", utilizationPct);

  // Line 6: Status
  display.drawLine(0, 54, 128, 54, SSD1306_WHITE);
  display.setCursor(0, 56);
  if (isOverBudget) {
    display.print("STATUS: !OVER BUDGET!");
  } else {
    display.print("STATUS: WITHIN BUDGET");
  }

  display.display();
}
