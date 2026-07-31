import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";

const COLORS = {
  background: "#0a1628",
  card: "#1a2940",
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
  text: "#ffffff",
  subtext: "#94a3b8",
};

function phColor(v) {
  if (v == null) return COLORS.card;
  if (v < 6.0 || v > 9.0) return COLORS.red;
  if (v < 6.5 || v > 8.5) return COLORS.yellow;
  return COLORS.green;
}

function doColor(v) {
  if (v == null) return COLORS.card;
  if (v < 3.0) return COLORS.red;
  if (v < 5.0) return COLORS.yellow;
  return COLORS.green;
}

function turbColor(v) {
  if (v == null) return COLORS.card;
  if (v > 50) return COLORS.red;
  if (v > 25) return COLORS.yellow;
  return COLORS.green;
}

function tempColor(v) {
  if (v == null) return COLORS.card;
  if (v < 20 || v > 35) return COLORS.red;
  if (v < 24 || v > 32) return COLORS.yellow;
  return COLORS.green;
}

export default function DashboardScreen() {
  const [reading, setReading] = useState(null);
  const [status, setStatus] = useState(null);
  const [now, setNow] = useState(Date.now());

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

  useEffect(() => {
    const statusRef = ref(database, `buoys/${BUOY_ID}/status`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      setStatus(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ph = reading?.ph;
  const dox = reading?.["do"];
  const turbidity = reading?.turbidity;
  const temp = reading?.temp;

  const secondsAgo =
    reading?.ts != null ? Math.max(0, Math.floor((now - reading.ts) / 1000)) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: phColor(ph) }]}>
          <Text style={styles.cardLabel}>pH</Text>
          <Text style={styles.cardValue}>{ph != null ? ph.toFixed(2) : "--"}</Text>
          <Text style={styles.cardUnit}>pH</Text>
        </View>

        <View style={[styles.card, { backgroundColor: doColor(dox) }]}>
          <Text style={styles.cardLabel}>Dissolved O₂</Text>
          <Text style={styles.cardValue}>{dox != null ? dox.toFixed(2) : "--"}</Text>
          <Text style={styles.cardUnit}>mg/L</Text>
        </View>

        <View style={[styles.card, { backgroundColor: turbColor(turbidity) }]}>
          <Text style={styles.cardLabel}>Turbidity</Text>
          <Text style={styles.cardValue}>{turbidity != null ? turbidity.toFixed(1) : "--"}</Text>
          <Text style={styles.cardUnit}>NTU</Text>
        </View>

        <View style={[styles.card, { backgroundColor: tempColor(temp) }]}>
          <Text style={styles.cardLabel}>Temperature</Text>
          <Text style={styles.cardValue}>{temp != null ? temp.toFixed(1) : "--"}</Text>
          <Text style={styles.cardUnit}>°C</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.updatedText}>
          {secondsAgo != null ? `Last updated: ${secondsAgo}s ago` : "Waiting for data..."}
        </Text>
        <Text style={styles.statusText}>
          Buoy status: {status?.online ? "Online" : "Offline"}
        </Text>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
  },
  cardValue: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
  },
  cardUnit: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.85,
  },
  footer: {
    marginTop: 8,
    alignItems: "center",
  },
  updatedText: {
    color: COLORS.subtext,
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    color: COLORS.subtext,
    fontSize: 14,
  },
});
