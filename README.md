# Smart Water-Quality Monitoring Buoy — Project 39 (Group 39)

This project is a smart water-quality monitoring buoy for fish farmers. An Arduino Uno reads pH, dissolved oxygen (DO), turbidity, and temperature sensors and displays the readings on an LCD. An ESP32 receives the sensor data over serial and sends it over Wi-Fi to Firebase. A React Native mobile app then shows a live dashboard of the water-quality readings to fish farmers, allowing them to monitor pond conditions remotely in real time.

## Folder Structure

```
smart-buoy/
├── firmware/
│   ├── arduino-uno/       # Arduino Uno R3 firmware (sensors + LCD)
│   │   ├── include/       # Headers: config.h, sensors.h, display.h, serial_comm.h
│   │   ├── lib/
│   │   ├── src/           # main.cpp
│   │   └── platformio.ini
│   └── esp32/              # ESP32 firmware (Wi-Fi + Firebase)
│       ├── include/       # Headers: config.h, wifi_manager.h, firebase_client.h, serial_parser.h
│       ├── lib/
│       ├── src/           # main.cpp
│       └── platformio.ini
├── cloud/
│   └── functions/         # Firebase cloud functions
├── mobile/                 # React Native dashboard app
└── README.md
```

## Build Instructions

1. Install the **PlatformIO IDE** extension in VS Code.
2. Open the `firmware/arduino-uno` folder (or `firmware/esp32` for the ESP32 board) in VS Code.
3. Click **PlatformIO: Build** in the PlatformIO toolbar.
4. Click **PlatformIO: Upload** to flash the firmware to the connected board.
