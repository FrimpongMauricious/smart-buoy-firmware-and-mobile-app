import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";
const BUOY_LOCATION = "KNUST Fish Pond";
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

const COLORS = {
  background: "#0a0f1a",
  card: "#12192a",
  glow: "#0891b2",
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

function severityRank(color) {
  if (color === COLORS.red) return 2;
  if (color === COLORS.yellow) return 1;
  return 0;
}

// Temporary position-based labels: the ESP32 doesn't have NTP sync yet, so each
// reading's `ts` is millis() (device uptime), not real epoch time. Real elapsed-time
// math against Date.now() would show meaningless/misleading durations, so until NTP
// sync is added to the firmware we just label cards by their position in the list.
const POSITION_LABELS = ["Now", "-30m", "-1h", "-2h"];

function BellIcon({ hasAlerts }) {
  return (
    <View style={styles.bellIconWrap}>
      <View style={styles.headerBellShadow}>
        <Image source={require("../assets/images/bell_alert.png")} style={styles.headerBellImage} />
      </View>
      {hasAlerts && <View style={styles.bellIconBadge} />}
    </View>
  );
}

function ClockIcon() {
  return (
    <View style={styles.clockCircle}>
      <View style={styles.clockHandMinute} />
      <View style={styles.clockHandHour} />
    </View>
  );
}

export default function DashboardScreen({ onOpenAlerts, hasAlerts }) {
  const [readings, setReadings] = useState([]);
  const [status, setStatus] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  useEffect(() => {
    const readingsRef = query(ref(database, `buoys/${BUOY_ID}/readings`), limitToLast(4));
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setReadings([]);
        return;
      }
      const arr = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setReadings(arr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const statusRef = ref(database, `buoys/${BUOY_ID}/status`);
    const unsubscribe = onValue(statusRef, (snapshot) => setStatus(snapshot.val()));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;
  const recentDisplay = [...readings].reverse();
  const cardSlots = POSITION_LABELS.map((label, index) => ({
    key: recentDisplay[index]?.id ?? `placeholder-${index}`,
    item: recentDisplay[index] ?? null,
    label,
  }));

  const ph = latest?.ph;
  const dox = latest?.["do"];
  const turbidity = latest?.turbidity;
  const temp = latest?.temp;

  const isOnline = status?.last_seen != null && now - status.last_seen < ONLINE_THRESHOLD_MS;

  let healthMessage;
  if (!latest) {
    healthMessage = "Waiting for sensor data...";
  } else if (status && !isOnline) {
    healthMessage = "Buoy offline — data may be outdated";
  } else {
    const maxRank = Math.max(
      severityRank(phColor(ph)),
      severityRank(doColor(dox)),
      severityRank(turbColor(turbidity)),
      severityRank(tempColor(temp))
    );
    if (maxRank === 2) healthMessage = "Water quality alert — check pond";
    else if (maxRank === 1) healthMessage = "pH slightly out of range — monitor";
    else healthMessage = "Water conditions are healthy";
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#06b6d4"
          colors={["#06b6d4"]}
        />
      }
    >
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenAlerts}>
          <BellIcon hasAlerts={hasAlerts} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.buoyName}>Buoy-001</Text>
        <Text style={styles.buoyLocation}>{BUOY_LOCATION}</Text>
      </View>

      <View style={styles.heroWrap}>
        <View style={styles.glowOuter} />
        <View style={styles.glowInner} />
        <View style={styles.heroImageShadow}>
          <Image source={require("../assets/images/hero_droplet.png")} style={styles.heroImage} />
        </View>
      </View>

      <Text style={styles.heroTemp}>{temp != null ? `${Math.round(temp)}°C` : "--°C"}</Text>
      <Text style={styles.healthMessage}>{healthMessage}</Text>

      <View style={styles.iconStrip}>
        <View style={styles.iconStripItem}>
          <View style={styles.stripIconShadow}>
            <Image source={require("../assets/images/ph_beaker.png")} style={styles.stripIcon} />
          </View>
          <Text style={styles.iconStripLabel}>pH  {ph != null ? ph.toFixed(2) : "--"}</Text>
        </View>
        <View style={styles.iconStripItem}>
          <View style={styles.stripIconShadow}>
            <Image source={require("../assets/images/oxygen_bubbles.png")} style={styles.stripIcon} />
          </View>
          <Text style={styles.iconStripLabel}>O₂  {dox != null ? `${dox.toFixed(2)} mg/L` : "--"}</Text>
        </View>
        <View style={styles.iconStripItem}>
          <View style={styles.stripIconShadow}>
            <Image source={require("../assets/images/turbidity_droplet.png")} style={styles.stripIcon} />
          </View>
          <Text style={styles.iconStripLabel}>Turb  {turbidity != null ? turbidity.toFixed(1) : "--"}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <ClockIcon />
        <Text style={styles.sectionTitle}>Recent Readings</Text>
      </View>

      <FlatList
        horizontal
        data={cardSlots}
        keyExtractor={(slot) => slot.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentListContent}
        renderItem={({ item: slot }) => (
          <View style={[styles.recentCard, !slot.item && styles.recentCardEmpty]}>
            <View style={styles.recentCardIcon} />
            <Text style={styles.recentCardTime}>{slot.label}</Text>
            <Text style={styles.recentCardTemp}>
              {slot.item?.temp != null ? `${Math.round(slot.item.temp)}°` : "—"}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 130,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    alignItems: "center",
    marginTop: 4,
  },
  buoyName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },
  buoyLocation: {
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 2,
  },
  heroWrap: {
    height: 250,
    marginTop: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  glowOuter: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 999,
    backgroundColor: COLORS.glow,
    opacity: 0.15,
  },
  glowInner: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: COLORS.glow,
    opacity: 0.28,
  },
  heroImageShadow: {
    backgroundColor: "transparent",
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  heroImage: {
    width: 260,
    height: 260,
    resizeMode: "contain",
  },
  heroTemp: {
    color: COLORS.text,
    fontSize: 90,
    fontWeight: "800",
    textAlign: "center",
    marginTop: -10,
  },
  healthMessage: {
    color: COLORS.subtext,
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 32,
  },
  iconStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 22,
    paddingHorizontal: 16,
  },
  iconStripItem: {
    alignItems: "center",
  },
  iconStripLabel: {
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
  },
  bellIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerBellShadow: {
    backgroundColor: "transparent",
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  headerBellImage: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },
  bellIconBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  stripIconShadow: {
    marginBottom: 6,
    backgroundColor: "transparent",
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  stripIcon: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  clockCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  clockHandMinute: {
    position: "absolute",
    width: 1.5,
    height: 6,
    backgroundColor: COLORS.text,
    top: 3,
    left: "50%",
    marginLeft: -0.75,
  },
  clockHandHour: {
    position: "absolute",
    width: 5,
    height: 1.5,
    backgroundColor: COLORS.text,
    top: 9,
    left: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  recentListContent: {
    paddingHorizontal: 20,
  },
  recentCard: {
    width: 100,
    height: 140,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    marginRight: 14,
  },
  recentCardEmpty: {
    opacity: 0.4,
  },
  recentCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(8,145,178,0.18)",
  },
  recentCardTime: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "600",
  },
  recentCardTemp: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
  },
});
