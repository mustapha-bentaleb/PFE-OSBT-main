import React from "react";
import { StyleSheet, Text, View } from "react-native";
import JerseyNativeView from "./JerseyNativeView";

function ColorSwatch({ label, color }) {
  const normalized = typeof color === "string" && color.startsWith("#") ? color : "#94a3b8";
  return (
    <View style={styles.swatchItem}>
      <View style={[styles.swatchDot, { backgroundColor: normalized }]} />
      <Text style={styles.swatchText}>{label}</Text>
    </View>
  );
}

function InfoChip({ text }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

export default function TShirtCard({ tshirt }) {
  const ownerName = tshirt?.owner?.username || "Unknown";
  const likesCount = tshirt?.likesCount ?? 0;
  const title = tshirt?.name || (tshirt?.number ? `#${tshirt.number}` : "T-Shirt");
  const avatarColor = tshirt?.owner?.profileAvatarColor || "#6366f1";
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const pattern = tshirt?.pattern || "plain";
  const sponsor = tshirt?.sponsor || "N/A";
  const brand = tshirt?.brand || "N/A";

  return (
    <View style={styles.card}>
      <View style={styles.viewerWrap}>
        <JerseyNativeView
          backgroundColor="#111111"
          mainColor={tshirt?.mainColor}
          secondColor={tshirt?.secondColor}
          collarColor={tshirt?.collarColor}
          insideColor={tshirt?.insideColor}
          pattern={tshirt?.pattern}
          number={tshirt?.number}
          name={tshirt?.name}
          name_number_color={tshirt?.name_number_color}
          sponsor={tshirt?.sponsor}
          sponsorColor={tshirt?.sponsorColor}
          logo={tshirt?.logo}
        />
      </View>

      <View style={styles.headerRow}>
        <View style={styles.ownerRow}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{ownerInitial}</Text>
          </View>
          <View>
            <Text style={styles.ownerName}>{ownerName}</Text>
            <Text style={styles.ownerSub}>Owner</Text>
          </View>
        </View>
        <InfoChip text={`❤ ${likesCount}`} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.colorsRow}>
        <ColorSwatch label="Main" color={tshirt?.mainColor} />
        <ColorSwatch label="Second" color={tshirt?.secondColor} />
        <ColorSwatch label="Collar" color={tshirt?.collarColor} />
      </View>

      <View style={styles.metaGrid}>
        <Text style={styles.metaLine}>Pattern: {pattern}</Text>
        <Text style={styles.metaLine}>Number: {tshirt?.number || "-"}</Text>
        <Text style={styles.metaLine}>Sponsor: {sponsor}</Text>
        <Text style={styles.metaLine}>Brand: {brand}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 10
  },
  viewerWrap: {
    width: "100%",
    height: 230,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0b0f1a"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "800"
  },
  ownerName: {
    color: "#0f172a",
    fontWeight: "700"
  },
  ownerSub: {
    color: "#64748b",
    fontSize: 12
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#eef2ff"
  },
  chipText: {
    color: "#3730a3",
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a"
  },
  colorsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  swatchItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1"
  },
  swatchText: {
    color: "#334155",
    fontSize: 12
  },
  metaGrid: {
    gap: 4
  },
  metaLine: {
    color: "#475569",
    fontSize: 13
  }
});
