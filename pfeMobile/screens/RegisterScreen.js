import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { register, authError } = useAuth();

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    setLocalError("");
    setLoading(true);
    const result = await register({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password
    });
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Register to access your dashboard</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Confirm password"
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {localError ? <Text style={styles.error}>{localError}</Text> : null}
        {authError ? <Text style={styles.error}>{authError}</Text> : null}

        <PrimaryButton title={loading ? "Creating account..." : "Register"} onPress={handleRegister} />
        <PrimaryButton
          title="Already have an account?"
          variant="secondary"
          onPress={() => navigation.navigate("Login")}
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
