import { useEffect, useState } from 'react';
import api, { refreshAccessToken, setAccessToken } from '../api/axiosInstance';
import { AuthContext } from './authState';

let restoreSessionPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        restoreSessionPromise ||= refreshAccessToken()
          .then(async (data) => {
            const me = await api.get('/auth/me');
            return { tokenData: data, userData: me.data.data };
          })
          .finally(() => {
            restoreSessionPromise = null;
          });

        const { tokenData, userData } = await restoreSessionPromise;
        setAccessToken(tokenData.accessToken);
        setUser(userData);
      } catch {
        setAccessToken(null);
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

