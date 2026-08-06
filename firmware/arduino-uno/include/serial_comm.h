#ifndef SERIAL_COMM_H
#define SERIAL_COMM_H

#include <Arduino.h>
#include <SoftwareSerial.h>
#include "config.h"

static SoftwareSerial espSerial(PIN_ESP_RX, PIN_ESP_TX); // RX, TX

inline void serial_comm_init() {
    espSerial.begin(ESP_BAUD);
}

inline void send_readings_to_esp(float ph, float dox, float turb, float temp, float battV, float battA) {
    // Build a compact JSON line and send it to the ESP32 over SoftwareSerial.
    // DO is omitted from the JSON when dox < 0 (sentinel meaning "not installed").

    String json = "{";
    json += "\"ph\":" + String(ph, 2) + ",";
    if (dox >= 0.0) {
        json += "\"do\":" + String(dox, 2) + ",";
    }
    json += "\"turbidity\":" + String(turb, 1) + ",";
    json += "\"temp\":" + String(temp, 1) + ",";
    json += "\"battery_v\":" + String(battV, 2) + ",";
    json += "\"battery_a\":" + String(battA, 2);
    json += "}";

    espSerial.println(json);

    Serial.print("Sent to ESP32: ");
    Serial.println(json);
}

#endif // SERIAL_COMM_H
