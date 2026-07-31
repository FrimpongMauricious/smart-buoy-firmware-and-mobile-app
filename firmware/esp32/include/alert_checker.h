#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "config.h"

// Returns an empty string if all readings are within safe range.
// Otherwise returns a semicolon-separated description of what's out of range.
String check_thresholds(JsonDocument& reading) {
  String alerts = "";

  if (reading["ph"].is<float>()) {
    float ph = reading["ph"];
    if (ph < PH_MIN || ph > PH_MAX) {
      alerts += "pH out of range: " + String(ph, 2) + "; ";
    }
  }
  if (reading["do"].is<float>()) {
    float dox = reading["do"];
    if (dox < DO_MIN) {
      alerts += "DO low: " + String(dox, 2) + " mg/L; ";
    }
  }
  if (reading["turbidity"].is<float>()) {
    float turb = reading["turbidity"];
    if (turb > TURB_MAX) {
      alerts += "Turbidity high: " + String(turb, 1) + " NTU; ";
    }
  }
  if (reading["temp"].is<float>()) {
    float temp = reading["temp"];
    if (temp < TEMP_MIN || temp > TEMP_MAX) {
      alerts += "Temp out of range: " + String(temp, 1) + " C; ";
    }
  }
  return alerts;
}
