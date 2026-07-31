#pragma once
#include <Arduino.h>
#include "config.h"

inline void buttons_init() {
    pinMode(PIN_BTN1, INPUT_PULLUP);
    pinMode(PIN_BTN2, INPUT_PULLUP);
    pinMode(PIN_BTN3, INPUT_PULLUP);

    Serial.println("Buttons initialized");
}

inline int check_buttons() {
    static unsigned long lastPress = 0;
    unsigned long now = millis();

    if (now - lastPress < 250) {
        return 0;
    }

    if (digitalRead(PIN_BTN1) == LOW) {
        lastPress = now;
        return 1;
    }
    if (digitalRead(PIN_BTN2) == LOW) {
        lastPress = now;
        return 2;
    }
    if (digitalRead(PIN_BTN3) == LOW) {
        lastPress = now;
        return 3;
    }

    return 0;
}
