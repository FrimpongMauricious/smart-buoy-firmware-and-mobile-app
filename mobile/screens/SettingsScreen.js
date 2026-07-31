import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";
const DATABASE_URL = "https://smart-buoy-p39-default-rtdb.europe-west1.firebasedatabase.app";
const APP_VERSION = "1.0.0";

const COLORS = {
  background: "#0a1628",
  card: "#1a2940",
  accent: "#3b82f6",
  text: "#ffffff",
  subtext: "#94a3b8",
  divider: "#24354f",
};

function maskDatabaseUrl(url) {
  const withoutProtocol = url.replace("https://", "");
  const parts = withoutProtocol.split(".");
  const host = parts[0];
  const maskedHost = host.length > 6 ? `${host.slice(0, 6)}***` : `${host}***`;
  return `https://${[maskedHost, ...parts.slice(1)].join(".")}`;
}

function formatDateTime(ts) {
  if (!ts) return "Never";
  const date = new Date(ts);
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

export default function SettingsScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Buoy ID</Text>
          <Text style={styles.rowValue}>{BUOY_ID}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Database</Text>
          <Text style={styles.rowValue}>{maskDatabaseUrl(DATABASE_URL)}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>App Version</Text>
          <Text style={styles.rowValue}>{APP_VERSION}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buoy Status</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Last Seen</Text>
          <Text style={styles.rowValue}>{formatDateTime(status?.last_seen)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Battery Voltage</Text>
          <Text style={styles.rowValue}>
            {batteryV != null ? `${batteryV.toFixed(1)} V` : "--"}
          </Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Wi-Fi Status</Text>
          <Text style={styles.rowValue}>{status?.online ? "Connected" : "Disconnected"}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
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
  },
});
