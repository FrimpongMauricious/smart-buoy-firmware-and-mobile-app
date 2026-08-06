#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

static OneWire oneWire(PIN_TEMP);
static DallasTemperature tempSensor(&oneWire);

inline void sensors_init() {
    pinMode(PIN_PH, INPUT);
    pinMode(PIN_DO, INPUT);
    pinMode(PIN_TURB, INPUT);
    pinMode(PIN_CURRENT, INPUT);

    tempSensor.begin();

    Serial.println("Sensors initialized");
}

inline float read_ph() {
    float voltage = analogRead(PIN_PH) * 5.0 / 1024.0;
    float ph = -5.70 * voltage + 21.34;
    return constrain(ph, 0.0, 14.0);
}

inline float read_do() {
    // DO sensor not installed in this build - return sentinel
    return -1.0;
}

inline float read_turbidity() {
    float voltage = analogRead(PIN_TURB) * 5.0 / 1024.0;
    float ntu;
    if (voltage < 2.5) {
        ntu = 3000;
    } else {
        ntu = -1120.4 * voltage * voltage + 5742.3 * voltage - 4353.8;
    }
    return constrain(ntu, 0.0, 3000.0);
}

inline float read_temperature() {
    tempSensor.requestTemperatures();
    float tempC = tempSensor.getTempCByIndex(0);
    if (tempC == DEVICE_DISCONNECTED_C) {
        return -999.0;
    }
    return tempC;
}

inline float read_battery_voltage() {
    float voltage = analogRead(PIN_CURRENT) * 5.0 / 1024.0 * 5.0;
    return constrain(voltage, 0.0, 15.0);
}

inline float read_battery_current() {
    float voltage = analogRead(PIN_CURRENT) * 5.0 / 1024.0;
    float current = (voltage - 2.5) / 0.185;
    return current;
}

#endif // SENSORS_H
