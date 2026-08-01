import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";
const BUOY_LOCATION = "KNUST Fish Pond";
const FIRMWARE_VERSION = "1.0.0";
const APP_VERSION = "1.0.0";
const CREDITS = "Developed by Frimpong Mauricious — KNUST, Project 39";

const COLORS = {
  background: "#0a0f1a",
  card: "#12192a",
  text: "#ffffff",
  subtext: "#94a3b8",
  divider: "#1e2a40",
};

function formatDateTime(ts) {
  if (!ts) return "Never";
  const date = new Date(ts);
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

function BackArrowIcon() {
  return <View style={styles.backArrow} />;
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen({ onBack }) {
  const [status, setStatus] = useState(null);
  const [reading, setReading] = useState(null);

  useEffect(() => {
    const statusRef = ref(database, `buoys/${BUOY_ID}/status`);
    const unsubscribe = onValue(statusRef, (snapshot) => setStatus(snapshot.val()));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const readingsRef = query(ref(database, `buoys/${BUOY_ID}/readings`), limitToLast(1));
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latestKey = Object.keys(data)[0];
        setReading(data[latestKey]);
      } else {
        setReading(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const batteryV = reading?.battery_v;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buoy Info</Text>
          <Row label="Buoy ID" value={BUOY_ID} />
          <Row label="Location" value={BUOY_LOCATION} />
          <Row label="Firmware Version" value={FIRMWARE_VERSION} last />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <Row label="Last Seen" value={formatDateTime(status?.last_seen)} />
          <Row label="Battery Voltage" value={batteryV != null ? `${batteryV.toFixed(1)} V` : "--"} />
          <Row label="Wi-Fi Status" value={status?.online ? "Connected" : "Disconnected"} last />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Row label="App Version" value={APP_VERSION} />
          <Row label="Credits" value={CREDITS} last />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  backArrow: {
    width: 11,
    height: 11,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.text,
    transform: [{ rotate: "45deg" }],
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 130,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: COLORS.subtext,
    fontSize: 15,
  },
  rowValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
    flexShrink: 1,
    textAlign: "right",
  },
});
