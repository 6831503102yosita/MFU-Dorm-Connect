import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mfu_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(res => { setUser(res.data.user); applyUserLang(res.data.user); })
      .catch(() => {
  localStorage.removeItem('mfu_token');
  localStorage.removeItem('mfu_user');
  setUser(null);
})
      .finally(() => setLoading(false));
  }, []);

  function applyUserLang(u) {
    if (u?.language && u.language !== i18n.language) {
      i18n.changeLanguage(u.language);
      localStorage.setItem('mfu_lang', u.language);
    }
  }

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('mfu_token', res.data.token);
    setUser(res.data.user);
    applyUserLang(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('mfu_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
  localStorage.removeItem('mfu_token');
  localStorage.removeItem('mfu_user');
  setUser(null);
}, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    applyUserLang(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
