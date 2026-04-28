import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) loadUsers();
  }, [user?.isAdmin]);

  const toggleBan = async (id) => {
    await api.put(`/admin/users/${id}/status`);
    loadUsers();
  };

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Admin</Text>
          <Text style={styles.empty}>You are not authorized for this section.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Admin Panel</Text>
        {users.map((u) => (
          <View key={u.id} style={styles.card}>
            <Text style={styles.cardTitle}>{u.username}</Text>
            <Text style={styles.cardText}>{u.email}</Text>
            <Text style={styles.cardText}>Status: {u.ban ? "Banned" : "Active"}</Text>
            <PrimaryButton title={u.ban ? "Unban" : "Ban"} onPress={() => toggleBan(u.id)} />
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
  cardText: { color: "#475569", marginBottom: 4 }
});
