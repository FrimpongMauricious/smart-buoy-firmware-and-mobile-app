import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import DashboardScreen from "./screens/DashboardScreen";
import AlertsScreen from "./screens/AlertsScreen";
import SettingsScreen from "./screens/SettingsScreen";

const BUOY_ID = "buoy-001";
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

const COLORS = {
  background: "#0a1628",
  card: "#1a2940",
  accent: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  text: "#ffffff",
  subtext: "#94a3b8",
};

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "alerts", label: "Alerts" },
  { key: "settings", label: "Settings" },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [lastSeen, setLastSeen] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const statusRef = ref(database, `buoys/${BUOY_ID}/status`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setLastSeen(data?.last_seen ?? null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = lastSeen != null && now - lastSeen < ONLINE_THRESHOLD_MS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Water Buoy</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.dot, { backgroundColor: isOnline ? COLORS.green : COLORS.red }]} />
          <Text style={styles.statusLabel}>{isOnline ? "Online" : "Offline"}</Text>
        </View>
      </View>

      <View style={styles.screenContainer}>
        {currentScreen === "dashboard" && <DashboardScreen />}
        {currentScreen === "alerts" && <AlertsScreen />}
        {currentScreen === "settings" && <SettingsScreen />}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = currentScreen === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => setCurrentScreen(tab.key)}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2f4a",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusLabel: {
    color: COLORS.subtext,
    fontSize: 13,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#1e2f4a",
    backgroundColor: COLORS.card,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabLabel: {
    color: COLORS.subtext,
    fontSize: 14,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
});
