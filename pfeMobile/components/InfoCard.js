import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoCard({ title, description }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6
  },
  description: {
    color: "#475569",
    lineHeight: 20
  }
});
