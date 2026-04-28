import React from "react";
import { StyleSheet, Text, View } from "react-native";
import JerseyModel from "./JerseyModel.web";

export default function TShirtCard({ tshirt }) {
  const ownerName = tshirt?.owner?.username || "Unknown";
  const likesCount = tshirt?.likesCount ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.modelWrap}>
        <JerseyModel {...tshirt} />
      </View>

      <Text style={styles.owner}>@{ownerName}</Text>
      <Text style={styles.title}>{tshirt?.name || tshirt?.number || "T-Shirt"}</Text>
      <Text style={styles.meta}>Likes: {likesCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  modelWrap: {
    height: 260,
    width: "100%"
  },
  owner: {
    color: "#94a3b8",
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 12
  },
  title: {
    color: "#f8fafc",
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingTop: 4
  },
  meta: {
    color: "#cbd5e1",
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4
  }
});
