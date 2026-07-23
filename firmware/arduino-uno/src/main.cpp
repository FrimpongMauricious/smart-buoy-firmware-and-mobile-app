#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "display.h"
#include "serial_comm.h"

unsigned long lastSensorRead = 0;

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

    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);
    pinMode(PIN_LED_YELLOW, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    pinMode(PIN_RELAY, OUTPUT);

    pinMode(PIN_BTN1, INPUT_PULLUP);
    pinMode(PIN_BTN2, INPUT_PULLUP);
    pinMode(PIN_BTN3, INPUT_PULLUP);
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
        Serial.println(g_battA, 2);
    }
}
