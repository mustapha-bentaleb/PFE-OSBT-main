import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function PrimaryButton({ title, onPress, variant = "primary" }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" ? styles.secondaryButton : styles.primaryButton,
        pressed && styles.pressed
      ]}
    >
      <Text style={variant === "secondary" ? styles.secondaryText : styles.primaryText}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  primaryButton: {
    backgroundColor: "#2563eb"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff"
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  secondaryText: {
    color: "#0f172a",
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.8
  }
});
