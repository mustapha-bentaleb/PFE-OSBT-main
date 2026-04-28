import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import api from "../api/client";

export default function MessagesScreen() {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/conversations");
        setConversations(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to load conversations.");
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Messages</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {conversations.length === 0 ? (
          <Text style={styles.empty}>No conversations yet.</Text>
        ) : (
          conversations.map((item, idx) => (
            <View key={item.conversationId || idx} style={styles.card}>
              <Text style={styles.cardTitle}>{item.otherUser?.username || "User"}</Text>
              <Text style={styles.cardText}>{item.lastMessageBody || "No messages yet."}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 10 },
  error: { color: "#b91c1c", marginBottom: 10 },
  empty: { color: "#64748b" },
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
