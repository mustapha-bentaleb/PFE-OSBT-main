import { Platform } from "react-native";
import Constants from "expo-constants";

function extractHostFromExpo() {
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoClient?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(":")[0];
}

export function getApiBaseCandidates() {
  const host = extractHostFromExpo();
  return [
    host ? `http://${host}:8080/api` : null,
    "http://localhost:8080/api",
    Platform.OS === "android" ? "http://10.0.2.2:8080/api" : null,
    "http://127.0.0.1:8080/api"
  ].filter(Boolean);
}

export function getJerseyUrlCandidates() {
  const host = extractHostFromExpo();
  return [
    host ? `http://${host}:5173` : null,
    "http://localhost:5173",
    Platform.OS === "android" ? "http://10.0.2.2:5173" : null,
    "http://127.0.0.1:5173"
  ].filter(Boolean);
}
