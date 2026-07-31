#pragma once

#include <Arduino.h>
#include "config.h"

// Uses the ESP32's hardware UART2 to talk to the Arduino Uno.
// Default pins: RX2 = GPIO16, TX2 = GPIO17.
// Wiring: Arduino D10 (SoftwareSerial TX) -> ESP32 GPIO16 (RX2)
//         Arduino D11 (SoftwareSerial RX) -> ESP32 GPIO17 (TX2)

inline void parser_init() {
    Serial2.begin(SERIAL_BAUD, SERIAL_8N1, 16, 17);
    Serial.println("Serial parser initialized on UART2 (RX=16, TX=17)");
}

inline bool parser_available() {
    // Simplest approach: any buffered byte is treated as "available".
    // parser_read_json() blocks (briefly) on readStringUntil('\n') to get a full line.
    return Serial2.available() > 0;
}

inline String parser_read_json() {
    String line = Serial2.readStringUntil('\n');
    line.trim();
    return line;
}
