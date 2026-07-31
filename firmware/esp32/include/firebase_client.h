#pragma once

#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "config.h"

inline void firebase_init() {
    // No handshake/session needed for the REST API — each send is a standalone HTTPS request.
    Serial.println("Firebase client ready (REST API mode)");
}

// Validates the incoming line as JSON, then pushes it to Firebase Realtime Database
// via the REST API: POST appends a new timestamped reading, PUT overwrites the
// buoy's "last seen" status.
inline bool firebase_send_reading(const char* json) {
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, json);
    if (err) {
        Serial.print("firebase_send_reading: invalid JSON, skipping (");
        Serial.print(err.c_str());
        Serial.println(")");
        return false;
    }

    WiFiClientSecure client;
    client.setInsecure(); // skip certificate validation - simplest option for a student project

    HTTPClient http;
    bool success = false;

    // POST the reading so Firebase auto-generates a new timestamped child key.
    String url = "https://" + String(FIREBASE_HOST) + "/buoys/" + String(BUOY_ID) + "/readings.json?auth=" + String(FIREBASE_AUTH);
    if (http.begin(client, url)) {
        http.addHeader("Content-Type", "application/json");
        int code = http.POST(json);
        Serial.print("Firebase readings POST response code: ");
        Serial.println(code);
        success = (code == 200 || code == 204);
        http.end();
    }

    // PUT a small status blob so the dashboard can show the buoy is online.
    String statusUrl = "https://" + String(FIREBASE_HOST) + "/buoys/" + String(BUOY_ID) + "/status.json?auth=" + String(FIREBASE_AUTH);
    String statusJson = "{\"last_seen\":" + String(millis()) + ",\"online\":true}";
    if (http.begin(client, statusUrl)) {
        http.addHeader("Content-Type", "application/json");
        int statusCode = http.PUT(statusJson);
        Serial.print("Firebase status PUT response code: ");
        Serial.println(statusCode);
        http.end();
    }

    return success;
}

// Pushes a single alert message onto /buoys/{buoy_id}/alerts so the mobile app can show history.
inline bool firebase_send_alert(const char* buoy_id, const String& alert_message) {
    String url = "https://" + String(FIREBASE_HOST) + "/buoys/" + String(buoy_id) + "/alerts.json?auth=" + String(FIREBASE_AUTH);

    StaticJsonDocument<256> doc;
    doc["message"] = alert_message;
    doc["severity"] = "warning";
    doc["ts"] = millis(); // real timestamp will come once NTP sync is added later

    String payload;
    serializeJson(doc, payload);

    HTTPClient http;
    WiFiClientSecure client;
    client.setInsecure();
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    http.end();

    Serial.print("Alert POST response code: ");
    Serial.println(code);
    return (code == 200 || code == 204);
}
