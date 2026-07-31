#pragma once
#include <Arduino.h>
#include "config.h"

enum AlertLevel { ALERT_NORMAL, ALERT_WARNING, ALERT_DANGER };

inline void alerts_init() {
    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);
    pinMode(PIN_LED_YELLOW, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    pinMode(PIN_RELAY, OUTPUT);

    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_RELAY, LOW);

    Serial.println("Alerts initialized");
}

inline AlertLevel check_alert_level(float ph, float dox, float turb, float temp) {
    if (ph < 6.0 || ph > 9.0 ||
        dox < 3.0 ||
        turb > 50.0 ||
        temp < 20.0 || temp > 35.0) {
        return ALERT_DANGER;
    }

    if (ph < PH_MIN || ph > PH_MAX ||
        dox < DO_MIN ||
        turb > TURB_MAX ||
        temp < TEMP_MIN || temp > TEMP_MAX) {
        return ALERT_WARNING;
    }

    return ALERT_NORMAL;
}

inline void update_alerts(AlertLevel level) {
    switch (level) {
        case ALERT_NORMAL:
            digitalWrite(PIN_LED_GREEN, HIGH);
            digitalWrite(PIN_LED_YELLOW, LOW);
            digitalWrite(PIN_LED_RED, LOW);
            digitalWrite(PIN_BUZZER, LOW);
            digitalWrite(PIN_RELAY, LOW);
            break;

        case ALERT_WARNING:
            digitalWrite(PIN_LED_GREEN, LOW);
            digitalWrite(PIN_LED_YELLOW, HIGH);
            digitalWrite(PIN_LED_RED, LOW);
            digitalWrite(PIN_BUZZER, LOW);
            digitalWrite(PIN_RELAY, LOW);
            break;

        case ALERT_DANGER:
            digitalWrite(PIN_LED_GREEN, LOW);
            digitalWrite(PIN_LED_YELLOW, LOW);
            digitalWrite(PIN_LED_RED, HIGH);
            digitalWrite(PIN_BUZZER, HIGH);
            digitalWrite(PIN_RELAY, HIGH);
            break;
    }
}
