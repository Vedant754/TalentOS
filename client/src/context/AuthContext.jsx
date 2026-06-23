import { useEffect, useState } from 'react';
import api, { setAccessToken } from '../api/axiosInstance';
import { AuthContext } from './authState';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        setUser(data.user);
        const me = await api.get('/auth/me');
        setUser(me.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    const me = await api.get('/auth/me');
    setUser(me.data.data);
    return me.data.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
