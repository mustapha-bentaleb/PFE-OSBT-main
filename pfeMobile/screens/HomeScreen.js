import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>OSBT Mobile</Text>
          <Text style={styles.subtitle}>
            {user ? `Welcome ${user.username}` : "Native app for your OSBT platform"}
          </Text>
        </View>

        <InfoCard
          title="3D Jersey Customizer"
          description="Native mobile 3D jersey renderer powered by Expo GL and Three.js."
        />
        <InfoCard
          title="Authentication"
          description="Use Login/Register screens to connect users to your backend APIs."
        />

        <View style={styles.actions}>
          {!user ? (
            <>
              <PrimaryButton title="Login" onPress={() => navigation.navigate("Login")} />
              <PrimaryButton
                title="Create account"
                variant="secondary"
                onPress={() => navigation.navigate("Register")}
              />
            </>
          ) : null}
          <PrimaryButton title="Open 3D Jersey" onPress={() => navigation.navigate("Jersey")} />
        </View>
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
    gap: 10
  },
  hero: {
    backgroundColor: "#1d4ed8",
    borderRadius: 18,
    padding: 18,
    marginBottom: 8
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff"
  },
  subtitle: {
    fontSize: 15,
    color: "#dbeafe",
    marginTop: 6,
    marginBottom: 4
  },
  actions: {
    gap: 10,
    marginTop: 8
  }
});
