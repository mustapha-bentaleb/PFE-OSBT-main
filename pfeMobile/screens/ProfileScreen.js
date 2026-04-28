import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import TShirtCard from "../components/TShirtCard";

export default function ProfileScreen({ navigation }) {
  const { user, updateUser, logout } = useAuth();
  const [myTshirts, setMyTshirts] = useState([]);
  const [redeemCode, setRedeemCode] = useState("");
  const [message, setMessage] = useState("");

  const loadProfileData = useCallback(async () => {
    try {
      const [balanceResponse, tshirtsResponse] = await Promise.all([
        api.get("/wallet/balance"),
        api.get("/tshirts/my")
      ]);
      if (balanceResponse?.data?.balance != null) {
        updateUser({ balance: balanceResponse.data.balance });
      }
      setMyTshirts(Array.isArray(tshirtsResponse.data) ? tshirtsResponse.data : []);
    } catch (error) {
      setMessage("Could not load profile data.");
    }
  }, [updateUser]);

  useEffect(() => {
    if (!user) return;
    loadProfileData();
  }, [loadProfileData, user]);

  const redeem = async () => {
    if (redeemCode.trim().length !== 4) return;
    try {
      const { data } = await api.post("/wallet/redeem", { code: redeemCode.trim() });
      if (data?.balance != null) {
        updateUser({ balance: data.balance });
      }
      setRedeemCode("");
      setMessage(data?.message || "Balance updated.");
    } catch (error) {
      setMessage(typeof error?.response?.data === "string" ? error.response.data : "Invalid code.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.name}>{user?.username || "Guest"}</Text>
          <Text style={styles.email}>{user?.email || "-"}</Text>
          <Text style={styles.info}>
            Balance: {user?.balance != null ? Number(user.balance).toFixed(2) : "0.00"} MAD
          </Text>

          <View style={styles.redeemRow}>
            <TextInput
              value={redeemCode}
              onChangeText={(value) => setRedeemCode(value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Redeem code (4 digits)"
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
            />
            <PrimaryButton title="Redeem" onPress={redeem} />
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <PrimaryButton title="Customize jersey" onPress={() => navigation.navigate("Jersey")} />
          <PrimaryButton title="My offers" variant="secondary" onPress={() => navigation.navigate("Offers")} />
          <PrimaryButton title="My messages" variant="secondary" onPress={() => navigation.navigate("Messages")} />
          <PrimaryButton title="Logout" variant="secondary" onPress={handleLogout} />
        </View>

        <Text style={styles.sectionTitle}>My T-Shirts</Text>
        {myTshirts.length === 0 ? (
          <Text style={styles.emptyText}>No T-Shirts yet.</Text>
        ) : (
          myTshirts.map((tshirt) => <TShirtCard key={tshirt.id} tshirt={tshirt} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scroll: {
    padding: 20
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 8
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },
  name: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 18,
    color: "#1e293b"
  },
  email: {
    color: "#64748b",
    marginBottom: 14
  },
  info: {
    color: "#475569",
    marginBottom: 16,
    lineHeight: 20
  },
  redeemRow: {
    gap: 10,
    marginBottom: 10
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  message: {
    color: "#1d4ed8",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 20,
    color: "#0f172a",
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 10
  },
  emptyText: {
    color: "#64748b"
  }
});
