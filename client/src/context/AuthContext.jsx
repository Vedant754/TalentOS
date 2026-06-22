    // src/context/AuthContext.jsx
    import { createContext, useState, useContext, useEffect } from 'react';
    import api, { setAccessToken } from '../api/axiosInstance';

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // { id, email, role, employee: {...} }
    const [loading, setLoading] = useState(true);  // true while we check existing session on load

    // On app load, try to silently restore a session via the refresh cookie
    // This is WHY the refresh flow exists — without it, every page refresh = forced re-login
    useEffect(() => {
        const restoreSession = async () => {
        try {
            const { data } = await api.post('/auth/refresh'); // cookie sent automatically
            setAccessToken(data.accessToken);
            setUser(data.user);
            // Fetch full profile (designation, department) for the dashboard
            const me = await api.get('/auth/me');
            setUser(me.data.data);
        } catch {
            setUser(null); // no valid refresh cookie — user must log in
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

    export const useAuth = () => useContext(AuthContext);