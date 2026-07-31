// Phase 3 — Wi-Fi + serial bridge + Firebase Realtime Database push

#include <Arduino.h>
#include "config.h"
#include "wifi_manager.h"
#include "firebase_client.h"
#include "serial_parser.h"
#include "alert_checker.h"

unsigned long lastWifiRetry = 0;
const unsigned long WIFI_RETRY_INTERVAL_MS = 30000;

void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 — Smart Buoy P39 ready");

    parser_init();
    wifi_init();

    if (!wifi_connect()) {
        // No known network reachable within the timeout — fall back to AP mode
        // so the buoy is still reachable, and keep retrying station mode in loop().
        wifi_start_ap();
    }

    firebase_init();
}

void loop() {
    unsigned long now = millis();

    // Forward any complete reading from the Arduino straight to Firebase.
    if (parser_available()) {
        String json = parser_read_json();
        if (json.length() > 0 && wifi_is_connected()) {
            bool ok = firebase_send_reading(json.c_str());
            Serial.println(ok ? "Reading sent to Firebase" : "Failed to send reading to Firebase");

            // Check the same reading against safe thresholds and raise an alert if needed.
            JsonDocument reading;
            DeserializationError err = deserializeJson(reading, json);
            if (!err) {
                String alertMsg = check_thresholds(reading);
                if (alertMsg.length() > 0 && wifi_is_connected()) {
                    firebase_send_alert(BUOY_ID, alertMsg);
                    Serial.print("ALERT: ");
                    Serial.println(alertMsg);
                } else if (alertMsg.length() == 0) {
                    Serial.println("All readings normal");
                }
            }
        }
    }

    // Periodically try to recover a dropped Wi-Fi connection without blocking the loop.
    if (!wifi_is_connected() && (now - lastWifiRetry >= WIFI_RETRY_INTERVAL_MS)) {
        lastWifiRetry = now;
        Serial.println("WiFi not connected, retrying...");
        wifi_connect();
    }
}
