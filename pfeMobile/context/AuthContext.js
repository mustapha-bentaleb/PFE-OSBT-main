import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { autoDetectApiBaseUrl } from "../api/client";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        await autoDetectApiBaseUrl();
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (error) {
        setAuthError("Unable to load session.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (username, password) => {
    setAuthError("");
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token, ...userData } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : "Login failed. Check credentials.";
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (payload) => {
    setAuthError("");
    try {
      const response = await api.post("/auth/register", payload);
      const { token, ...userData } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : "Registration failed.";
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const updateUser = async (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      AsyncStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, authError, login, register, updateUser, logout }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
