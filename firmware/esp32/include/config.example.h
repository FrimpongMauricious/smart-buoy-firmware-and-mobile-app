#pragma once

#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"

#define FIREBASE_HOST "YOUR_PROJECT.firebaseio.com"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET"

#define BUOY_ID "buoy-001"

#define SERIAL_BAUD 9600      // matches Arduino's SoftwareSerial to ESP32
#define WIFI_BAUD 115200

#define WIFI_CONNECT_TIMEOUT_MS 15000
#define FIREBASE_SEND_INTERVAL_MS 30000
#define AP_MODE_SSID_PREFIX "SmartBuoy-"
#define AP_MODE_IP_LAST_OCTET 1   // AP mode IP will be 192.168.4.1
