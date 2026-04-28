import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import TShirtCard from "../components/TShirtCard";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [tshirts, setTshirts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTShirts = useCallback(async () => {
    try {
      const response = await api.get("/tshirts/all");
      setTshirts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setTshirts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchAllTShirts();
  }, [fetchAllTShirts, user]);

  const myCount = user
    ? tshirts.filter((item) => item?.owner?.username === user.username).length
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            {user ? `${user.username} • ${user.email}` : "Quick access to core actions"}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>All T-Shirts</Text>
            <Text style={styles.statValue}>{tshirts.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>My T-Shirts</Text>
            <Text style={styles.statValue}>{myCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Account Type</Text>
            <Text style={styles.statValue}>{user?.isAdmin ? "Administrator" : "Standard User"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All T-Shirts</Text>
        {!user ? <Text style={styles.emptyText}>Please login first.</Text> : null}
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : !user ? null : tshirts.length === 0 ? (
          <Text style={styles.emptyText}>No T-Shirts available.</Text>
        ) : (
          tshirts.map((tshirt) => <TShirtCard key={tshirt.id} tshirt={tshirt} />)
        )}

        <PrimaryButton title="Go to profile" onPress={() => navigation.navigate("Profile")} />
        <PrimaryButton title="Messages" variant="secondary" onPress={() => navigation.navigate("Messages")} />
        <PrimaryButton title="Offers" variant="secondary" onPress={() => navigation.navigate("Offers")} />
        {user?.isAdmin ? (
          <PrimaryButton title="Admin panel" variant="secondary" onPress={() => navigation.navigate("Admin")} />
        ) : null}
        <PrimaryButton title="Open 3D Jersey" onPress={() => navigation.navigate("Jersey")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9"
  },
  container: {
    padding: 20,
    gap: 8
  },
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff"
  },
  subtitle: {
    color: "#cbd5e1",
    marginBottom: 4
  },
  statsGrid: {
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12
  },
  statValue: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10
  },
  emptyText: {
    color: "#64748b",
    marginBottom: 12
  }
});
