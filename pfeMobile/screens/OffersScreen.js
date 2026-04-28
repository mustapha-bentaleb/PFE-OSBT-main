import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import api from "../api/client";

export default function OffersScreen() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [inRes, outRes] = await Promise.all([api.get("/offers/incoming"), api.get("/offers/outgoing")]);
        setIncoming(Array.isArray(inRes.data) ? inRes.data : []);
        setOutgoing(Array.isArray(outRes.data) ? outRes.data : []);
      } catch {
        setIncoming([]);
        setOutgoing([]);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Offers</Text>

        <Text style={styles.section}>Incoming ({incoming.length})</Text>
        {incoming.map((item) => (
          <View key={`i-${item.id}`} style={styles.card}>
            <Text style={styles.cardTitle}>Offer #{item.id}</Text>
            <Text style={styles.cardText}>Status: {item.status}</Text>
          </View>
        ))}

        <Text style={styles.section}>Outgoing ({outgoing.length})</Text>
        {outgoing.map((item) => (
          <View key={`o-${item.id}`} style={styles.card}>
            <Text style={styles.cardTitle}>Offer #{item.id}</Text>
            <Text style={styles.cardText}>Status: {item.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 10 },
  section: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginTop: 8, marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10
  },
  cardTitle: { fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  cardText: { color: "#475569" }
});
