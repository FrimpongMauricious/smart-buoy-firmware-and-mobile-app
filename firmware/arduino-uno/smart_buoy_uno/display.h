#ifndef DISPLAY_H
#define DISPLAY_H

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "config.h"

static LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLS, LCD_ROWS);
static int g_screenIndex = 0;

inline void display_init() {
    lcd.init();
    lcd.backlight();

    lcd.setCursor(0, 0);
    lcd.print("Smart Buoy P39");
    lcd.setCursor(0, 1);
    lcd.print("Initializing...");
    delay(1500);
    lcd.clear();

    Serial.println("LCD initialized");
}

inline void display_render(int screen, float ph, float dox, float turb, float temp) {
    char buf1[8];
    char buf2[8];

    lcd.clear();

    switch (screen) {
        case 0:
            dtostrf(ph, 4, 2, buf1);
            dtostrf(dox, 4, 2, buf2);
            lcd.setCursor(0, 0);
            lcd.print("pH: ");
            lcd.print(buf1);
            lcd.setCursor(0, 1);
            lcd.print("DO: ");
            lcd.print(buf2);
            lcd.print(" mg/L");
            break;

        case 1:
            dtostrf(turb, 4, 0, buf1);
            dtostrf(temp, 4, 1, buf2);
            lcd.setCursor(0, 0);
            lcd.print("Turb: ");
            lcd.print(buf1);
            lcd.print(" NTU");
            lcd.setCursor(0, 1);
            lcd.print("Temp: ");
            lcd.print(buf2);
            lcd.print(" C");
            break;

        case 2:
        default: {
            bool alert = (ph < PH_MIN || ph > PH_MAX ||
                          dox < DO_MIN ||
                          turb > TURB_MAX ||
                          temp < TEMP_MIN || temp > TEMP_MAX);
            lcd.setCursor(0, 0);
            lcd.print("Smart Buoy P39");
            lcd.setCursor(0, 1);
            lcd.print(alert ? "!! ALERT !!" : "All systems OK");
            break;
        }
    }
}

inline void display_readings(float ph, float dox, float turb, float temp) {
    display_render(g_screenIndex, ph, dox, turb, temp);
    g_screenIndex = (g_screenIndex + 1) % 3;
}

inline void display_next_screen(float ph, float dox, float turb, float temp) {
    g_screenIndex = (g_screenIndex + 1) % 3;
    display_render(g_screenIndex, ph, dox, turb, temp);
}

inline void display_prev_screen(float ph, float dox, float turb, float temp) {
    g_screenIndex = (g_screenIndex + 2) % 3;
    display_render(g_screenIndex, ph, dox, turb, temp);
}

inline void display_status(const char* msg) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("STATUS:");
    lcd.setCursor(0, 1);
    lcd.print(msg);
}

#endif // DISPLAY_H
