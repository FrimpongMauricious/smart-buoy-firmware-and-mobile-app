import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

const BUOY_ID = "buoy-001";
const BUOY_LOCATION = "KNUST Fish Pond";
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

const COLORS = {
  background: "#0a0f1a",
  card: "#12192a",
  glow: "#0891b2",
  cyan: "#06b6d4",
  cyanDeep: "#0e7490",
  cyanBright: "#22d3ee",
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

function HamburgerIcon() {
  return (
    <View style={styles.hamburgerWrap}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </View>
  );
}

function CalendarIcon() {
  return (
    <View style={styles.calendarBox}>
      <View style={styles.calendarTopBar} />
      <View style={styles.calendarGridRow}>
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
      </View>
      <View style={styles.calendarGridRow}>
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
      </View>
    </View>
  );
}

function BeakerIcon() {
  return (
    <View style={styles.beakerWrap}>
      <View style={styles.beakerNeck} />
      <View style={styles.beakerBody} />
    </View>
  );
}

function BubbleIcon() {
  return (
    <View style={styles.bubbleOuter}>
      <View style={styles.bubbleInner} />
    </View>
  );
}

function WaveIcon() {
  return (
    <View style={styles.waveWrap}>
      <View style={[styles.waveDot, styles.waveDotUp]} />
      <View style={[styles.waveDot, styles.waveDotDown]} />
      <View style={[styles.waveDot, styles.waveDotUp]} />
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

export default function DashboardScreen() {
  const [readings, setReadings] = useState([]);
  const [status, setStatus] = useState(null);
  const [now, setNow] = useState(Date.now());

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View style={styles.iconButton}>
          <HamburgerIcon />
        </View>
        <View style={styles.iconButton}>
          <CalendarIcon />
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.buoyName}>Buoy-001</Text>
        <Text style={styles.buoyLocation}>{BUOY_LOCATION}</Text>
      </View>

      <View style={styles.heroWrap}>
        <View style={styles.glowOuter} />
        <View style={styles.glowInner} />
        <View style={styles.heroCircle}>
          <View style={styles.heroSheen} />
          <Text style={styles.heroEmoji}>💧</Text>
        </View>
      </View>

      <Text style={styles.heroTemp}>{temp != null ? `${Math.round(temp)}°C` : "--°C"}</Text>
      <Text style={styles.healthMessage}>{healthMessage}</Text>

      <View style={styles.iconStrip}>
        <View style={styles.iconStripItem}>
          <BeakerIcon />
          <Text style={styles.iconStripLabel}>pH  {ph != null ? ph.toFixed(2) : "--"}</Text>
        </View>
        <View style={styles.iconStripItem}>
          <BubbleIcon />
          <Text style={styles.iconStripLabel}>O₂  {dox != null ? `${dox.toFixed(2)} mg/L` : "--"}</Text>
        </View>
        <View style={styles.iconStripItem}>
          <WaveIcon />
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
    justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "center",
  },
  glowOuter: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: COLORS.glow,
    opacity: 0.15,
  },
  glowInner: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: COLORS.glow,
    opacity: 0.28,
  },
  heroCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.cyanDeep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroSheen: {
    position: "absolute",
    top: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.cyanBright,
    opacity: 0.45,
  },
  heroEmoji: {
    fontSize: 120,
  },
  heroTemp: {
    color: COLORS.text,
    fontSize: 90,
    fontWeight: "800",
    textAlign: "center",
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
    marginTop: 32,
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
  hamburgerWrap: {
    width: 20,
    height: 14,
    justifyContent: "space-between",
  },
  hamburgerLine: {
    height: 2,
    width: 20,
    borderRadius: 1,
    backgroundColor: COLORS.text,
  },
  calendarBox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: COLORS.subtext,
    borderRadius: 6,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: COLORS.subtext,
  },
  calendarGridRow: {
    flexDirection: "row",
    marginVertical: 1.5,
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.subtext,
    marginHorizontal: 2,
  },
  beakerWrap: {
    alignItems: "center",
  },
  beakerNeck: {
    width: 8,
    height: 5,
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    borderBottomWidth: 0,
  },
  beakerBody: {
    width: 24,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "rgba(6,182,212,0.2)",
  },
  bubbleOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
  },
  waveWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
  },
  waveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.cyan,
    marginHorizontal: 3,
  },
  waveDotUp: {
    marginBottom: 8,
  },
  waveDotDown: {
    marginTop: 8,
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
    marginTop: 36,
    marginBottom: 14,
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
