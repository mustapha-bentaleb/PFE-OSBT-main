import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, authError } = useAuth();

  async function handleLogin() {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }]
      });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {authError ? <Text style={styles.error}>{authError}</Text> : null}

        <PrimaryButton title={loading ? "Signing in..." : "Login"} onPress={handleLogin} />
        <PrimaryButton
          title="No account? Register"
          variant="secondary"
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  container: {
    padding: 20,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitle: {
    color: "#475569",
    marginBottom: 8
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  error: {
    color: "#b91c1c",
    fontSize: 13
  }
});
