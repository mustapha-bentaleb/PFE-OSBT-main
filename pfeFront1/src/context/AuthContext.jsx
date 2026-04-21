import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const next = readStoredUser();
    if (next) setUser(next);
    else setUser(null);
    setLoading(false);
  }, []);

  // 🔐 LOGIN
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      flushSync(() => {
        setUser(userData);
      });

      toast.success('Login successful!');

      // 🔥 redirect correct
      if (userData?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

      return { success: true, user: userData };

    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data };
    }
  };

  // 📝 REGISTER
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...newUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      flushSync(() => {
        setUser(newUser);
      });

      toast.success('Registration successful!');

      navigate('/dashboard');

      return { success: true, user: newUser };

    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data };
    }
  };

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    toast.success('Logged out successfully');

    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};