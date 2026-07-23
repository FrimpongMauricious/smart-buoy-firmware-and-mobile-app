// Phase 1 scaffold — sensor logic will be added in Phase 2

#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "display.h"
#include "serial_comm.h"

unsigned long lastLoopPrint = 0;

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
    if (now - lastLoopPrint >= 2000) {
        lastLoopPrint = now;
        Serial.println("loop running");
    }
}
