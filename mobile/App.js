import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import DashboardScreen from "./screens/DashboardScreen";
import AlertsScreen from "./screens/AlertsScreen";
import SettingsScreen from "./screens/SettingsScreen";

const BUOY_ID = "buoy-001";

const COLORS = {
  background: "#0a0f1a",
  navBackground: "#12192a",
  active: "#06b6d4",
  inactive: "#94a3b8",
  red: "#ef4444",
};

function HomeIcon({ color }) {
  return (
    <View style={styles.iconGroup}>
      <View style={[styles.homeRoof, { borderBottomColor: color }]} />
      <View style={[styles.homeBase, { borderColor: color }]} />
    </View>
  );
}

function HistoryIcon({ color }) {
  return (
    <View style={[styles.clockCircle, { borderColor: color }]}>
      <View style={[styles.clockHandMinute, { backgroundColor: color }]} />
      <View style={[styles.clockHandHour, { backgroundColor: color }]} />
    </View>
  );
}

function BellIcon({ hasAlerts }) {
  return (
    <View style={styles.iconGroup}>
      <Image source={require("./assets/images/bell_alert.png")} style={styles.navBellImage} />
      {hasAlerts && <View style={styles.bellBadge} />}
    </View>
  );
}

function GearIcon() {
  return (
    <View style={styles.iconGroup}>
      <Image source={require("./assets/images/gear_settings.png")} style={styles.navGearImage} />
    </View>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [hasAlerts, setHasAlerts] = useState(false);

  useEffect(() => {
    const alertsRef = query(ref(database, `buoys/${BUOY_ID}/alerts`), limitToLast(5));
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      setHasAlerts(!!data && Object.keys(data).length > 0);
    });
    return () => unsubscribe();
  }, []);

  const goToDashboard = () => setCurrentScreen("dashboard");

  const tabs = [
    { key: "dashboard", render: (color) => <HomeIcon color={color} /> },
    { key: "history", render: (color) => <HistoryIcon color={color} /> },
    { key: "alerts", render: () => <BellIcon hasAlerts={hasAlerts} /> },
    { key: "settings", render: () => <GearIcon /> },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>
        {(currentScreen === "dashboard" || currentScreen === "history") && (
          <DashboardScreen onOpenAlerts={() => setCurrentScreen("alerts")} hasAlerts={hasAlerts} />
        )}
        {currentScreen === "alerts" && <AlertsScreen onBack={goToDashboard} />}
        {currentScreen === "settings" && <SettingsScreen onBack={goToDashboard} />}
      </View>

      <View style={styles.navPill}>
        {tabs.map((tab) => {
          const active = currentScreen === tab.key;
          const color = active ? COLORS.active : COLORS.inactive;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navButton}
              onPress={() => setCurrentScreen(tab.key)}
            >
              {tab.render(color)}
            </TouchableOpacity>
          );
        })}
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 10,
  },
  body: {
    flex: 1,
  },
  navPill: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.navBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGroup: {
    alignItems: "center",
    justifyContent: "center",
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  homeBase: {
    width: 14,
    height: 9,
    borderWidth: 2,
    borderTopWidth: 0,
  },
  clockCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  clockHandMinute: {
    position: "absolute",
    width: 1.5,
    height: 7,
    top: 4,
    left: 10,
  },
  clockHandHour: {
    position: "absolute",
    width: 6,
    height: 1.5,
    top: 10,
    left: 11,
  },
  navBellImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  navGearImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.navBackground,
  },
});
