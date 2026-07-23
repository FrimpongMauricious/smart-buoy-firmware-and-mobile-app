// Phase 1 scaffold — sensor logic will be added in Phase 2

#include <Arduino.h>
#include "config.h"
#include "wifi_manager.h"
#include "firebase_client.h"
#include "serial_parser.h"

unsigned long lastLoopPrint = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 — Smart Buoy P39 ready");

    parser_init();
    wifi_init();
    firebase_init();
}

void loop() {
    unsigned long now = millis();
    if (now - lastLoopPrint >= 5000) {
        lastLoopPrint = now;
        Serial.println("ESP32 loop running");
    }
}
