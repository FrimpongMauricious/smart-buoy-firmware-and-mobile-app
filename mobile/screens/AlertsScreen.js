import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";

const COLORS = {
  background: "#0a1628",
  card: "#1a2940",
  yellow: "#f59e0b",
  red: "#ef4444",
  text: "#ffffff",
  subtext: "#94a3b8",
};

function formatTimestamp(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = query(
      ref(database, `buoys/${BUOY_ID}/alerts`),
      orderByChild("ts"),
      limitToLast(20)
    );
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setAlerts([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      list.reverse(); // newest first
      setAlerts(list);
    });
    return () => unsubscribe();
  }, []);

  if (alerts.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyText}>No alerts — all readings normal</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {alerts.map((alert) => {
        const isDanger = alert.severity === "danger";
        const badgeColor = isDanger ? COLORS.red : COLORS.yellow;
        return (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{isDanger ? "DANGER" : "WARNING"}</Text>
              </View>
              <Text style={styles.timestamp}>{formatTimestamp(alert.ts)}</Text>
            </View>
            <Text style={styles.message}>{alert.message}</Text>
          </View>
        );
      })}
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
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  alertCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  timestamp: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  message: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
});
