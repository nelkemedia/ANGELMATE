import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('am_token');
    if (!token) { setLoading(false); return; }
    api.auth.me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('am_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('am_token', data.token);
    setUser(data.user);
  }

  async function register(fields) {
    const data = await api.auth.register(fields);
    if (data?.pendingVerification) return data;
    localStorage.setItem('am_token', data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('am_token');
    setUser(null);
  }

  function updateUser(updated) {
    setUser((u) => ({ ...u, ...updated }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
