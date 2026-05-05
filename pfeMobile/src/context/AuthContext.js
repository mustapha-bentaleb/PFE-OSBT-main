import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { STORAGE_KEYS } from '../constants/storage';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

async function readStoredSession() {
  try {
    const [userRaw, token] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.user),
      AsyncStorage.getItem(STORAGE_KEYS.token),
    ]);

    if (!userRaw || !token) return null;

    return {
      user: JSON.parse(userRaw),
      token,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const session = await readStoredSession();
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = useCallback(async (token, nextUser) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.token, token),
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser)),
    ]);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.token),
      AsyncStorage.removeItem(STORAGE_KEYS.user),
    ]);
    setUser(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, ...userData } = response.data;
    await persistSession(token, userData);
    return userData;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { token, ...userData } = response.data;
    await persistSession(token, userData);
    return userData;
  }, [persistSession]);

  const updateUser = useCallback(async (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout: clearSession,
    updateUser,
  }), [user, loading, login, register, clearSession, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
