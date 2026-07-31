#pragma once

#include <WiFi.h>
#include "config.h"

// Puts the radio into station mode so it can join an existing Wi-Fi network.
inline void wifi_init() {
    WiFi.mode(WIFI_STA);
    Serial.println("WiFi manager initialized");
}

// Attempts to join the configured network, polling status with millis()
// instead of a long blocking delay() so the rest of the sketch stays responsive.
inline bool wifi_connect() {
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED) {
        if (millis() - startAttempt >= WIFI_CONNECT_TIMEOUT_MS) {
            Serial.println();
            Serial.println("WiFi connection failed, will retry or fallback to AP mode");
            return false;
        }
        Serial.print(".");
        delay(500); // short poll delay, well under the overall timeout
    }

    Serial.println();
    Serial.print("WiFi connected! IP: ");
    Serial.println(WiFi.localIP().toString());
    return true;
}

// Fallback mode: turns the ESP32 itself into an access point so the buoy
// can still be reached (e.g. for configuration) when no known network is in range.
inline void wifi_start_ap() {
    WiFi.mode(WIFI_AP);

    // Build a unique SSID from the last 4 hex digits of the MAC address
    // so multiple buoys don't collide with the same AP name.
    String mac = WiFi.macAddress();
    String macSuffix = mac.substring(mac.length() - 5); // e.g. "AB:CD" -> last 4 hex chars incl. colon
    macSuffix.replace(":", "");
    String ap_ssid = String(AP_MODE_SSID_PREFIX) + macSuffix;

    WiFi.softAP(ap_ssid.c_str(), "buoy12345"); // password must be >= 8 chars for ESP32 AP mode

    Serial.print("AP mode started. SSID: ");
    Serial.print(ap_ssid);
    Serial.print(" IP: ");
    Serial.println(WiFi.softAPIP().toString());
}

inline bool wifi_is_connected() {
    return WiFi.status() == WL_CONNECTED;
}
