#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "display.h"
#include "serial_comm.h"
#include "alerts.h"
#include "buttons.h"

unsigned long lastSensorRead = 0;
unsigned long lastLcdCycle = 0;
unsigned long lastSerialSend = 0;

bool g_backlightOn = true;

float g_ph = 0.0;
float g_do = 0.0;
float g_turb = 0.0;
float g_temp = 0.0;
float g_battV = 0.0;
float g_battA = 0.0;

void setup() {
    Serial.begin(9600);
    Serial.println("Arduino Uno R3 — Smart Buoy P39 ready");

    sensors_init();
    display_init();
    serial_comm_init();
    alerts_init();
    buttons_init();
}

void loop() {
    unsigned long now = millis();

    if (now - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = now;

        g_ph = read_ph();
        g_do = read_do();
        g_turb = read_turbidity();
        g_temp = read_temperature();
        g_battV = read_battery_voltage();
        g_battA = read_battery_current();

        AlertLevel level = check_alert_level(g_ph, g_do, g_turb, g_temp);
        update_alerts(level);

        const char* levelStr = "NORMAL";
        if (level == ALERT_WARNING) levelStr = "WARNING";
        else if (level == ALERT_DANGER) levelStr = "DANGER";

        Serial.print("pH=");
        Serial.print(g_ph, 2);
        Serial.print(" DO=");
        Serial.print(g_do, 2);
        Serial.print(" Turb=");
        Serial.print(g_turb, 1);
        Serial.print(" Temp=");
        Serial.print(g_temp, 1);
        Serial.print(" BatV=");
        Serial.print(g_battV, 1);
        Serial.print(" BatA=");
        Serial.print(g_battA, 2);
        Serial.print(" Alert=");
        Serial.println(levelStr);
    }

    if (now - lastLcdCycle >= LCD_CYCLE_INTERVAL) {
        lastLcdCycle = now;
        display_readings(g_ph, g_do, g_turb, g_temp);
    }

    if (now - lastSerialSend >= SERIAL_SEND_INTERVAL) {
        lastSerialSend = now;
        // TODO Phase 4: send_readings_to_esp(g_ph, g_do, g_turb, g_temp, g_battV, g_battA);
    }

    int btn = check_buttons();
    if (btn == 1) {
        display_next_screen(g_ph, g_do, g_turb, g_temp);
    } else if (btn == 2) {
        display_prev_screen(g_ph, g_do, g_turb, g_temp);
    } else if (btn == 3) {
        g_backlightOn = !g_backlightOn;
        if (g_backlightOn) {
            lcd.backlight();
        } else {
            lcd.noBacklight();
        }
    }
}
