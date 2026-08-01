import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";

const COLORS = {
  background: "#0a0f1a",
  card: "#12192a",
  yellow: "#f59e0b",
  red: "#ef4444",
  green: "#10b981",
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

function BackArrowIcon() {
  return <View style={styles.backArrow} />;
}

export default function AlertsScreen({ onBack }) {
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

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Alerts</Text>
        <View style={styles.iconButton} />
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyGlow} />
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyCheck}>✓</Text>
          </View>
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptySubtitle}>No alerts in the last 24 hours</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {alerts.map((alert) => {
            const isDanger = alert.severity === "danger";
            const badgeColor = isDanger ? COLORS.red : COLORS.yellow;
            return (
              <View key={alert.id} style={[styles.alertCard, { borderLeftColor: badgeColor }]}>
                <View style={styles.alertTopRow}>
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>{isDanger ? "DANGER" : "WARNING"}</Text>
                  </View>
                </View>
                <Text style={styles.message}>{alert.message}</Text>
                <Text style={styles.timestamp}>{formatTimestamp(alert.ts)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    paddingTop: 8,
    paddingBottom: 130,
  },
  alertCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 14,
  },
  alertTopRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  message: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  timestamp: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    opacity: 0.15,
  },
  emptyCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCheck: {
    fontSize: 46,
    color: "#ffffff",
    fontWeight: "700",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 22,
  },
  emptySubtitle: {
    color: COLORS.subtext,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
