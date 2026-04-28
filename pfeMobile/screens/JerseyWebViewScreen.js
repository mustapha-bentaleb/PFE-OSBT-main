import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import JerseyNativeView from "../components/JerseyNativeView";

export default function JerseyWebViewScreen() {
  const demoProps = {
    pattern: "split",
    mainColor: "#0f172a",
    secondColor: "#0ea5e9",
    collarColor: "#ffffff",
    insideColor: "#111827",
    name: "MUSTAFA",
    number: "10",
    sponsor: "OSBT",
    sponsorColor: "#ffffff"
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Native 3D Jersey</Text>
        <Text style={styles.urlText}>Full native renderer (no WebView)</Text>
      </View>
      <View style={styles.viewerFull}>
        <JerseyNativeView {...demoProps} backgroundColor="#05070d" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a"
  },
  urlText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4
  },
  viewerFull: {
    flex: 1,
    marginTop: 6
  }
});
