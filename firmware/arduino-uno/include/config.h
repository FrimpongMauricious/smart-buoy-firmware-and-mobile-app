#ifndef CONFIG_H
#define CONFIG_H

// ---------- Pin Definitions ----------
#define PIN_PH A1        // pH signal board Po
#define PIN_DO A3        // dissolved oxygen board OUT
#define PIN_TURB A2      // turbidity sensor OUT
#define PIN_CURRENT A0   // ACS712 current sensor OUT
#define PIN_TEMP 5       // DS18B20, needs 4.7k pull-up to 5V

#define PIN_BTN1 2
#define PIN_BTN2 3
#define PIN_BTN3 4

#define PIN_RELAY 7
#define PIN_BUZZER 8

#define PIN_LED_GREEN 9
#define PIN_LED_RED 12
#define PIN_LED_YELLOW 13

#define PIN_ESP_RX 10    // SoftwareSerial RX (to ESP32 TX)
#define PIN_ESP_TX 11    // SoftwareSerial TX (to ESP32 RX)

// ---------- LCD Config ----------
#define LCD_I2C_ADDR 0x27
#define LCD_COLS 16
#define LCD_ROWS 2

// ---------- Thresholds ----------
const float PH_MIN = 6.5;
const float PH_MAX = 8.5;
const float DO_MIN = 5.0;
const float TURB_MAX = 25.0;
const float TEMP_MIN = 24.0;
const float TEMP_MAX = 32.0;

// ---------- Timing Intervals (ms) ----------
const unsigned long SENSOR_INTERVAL = 2000;
const unsigned long SERIAL_SEND_INTERVAL = 30000;
const unsigned long LCD_CYCLE_INTERVAL = 3000;

// ---------- Serial ----------
#define ESP_BAUD 9600

#endif // CONFIG_H
