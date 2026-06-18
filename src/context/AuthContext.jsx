import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

// Session expires after 1 hour of INACTIVITY
const SESSION_TIMEOUT_MS = 1 * 60 * 60 * 1000;

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const lastActive = localStorage.getItem('lastActive');

    if (storedUser) {
      if (lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed < SESSION_TIMEOUT_MS) {
          setUser(JSON.parse(storedUser));
          // Update last active time on every page load
          localStorage.setItem('lastActive', Date.now().toString());
        } else {
          // Inactive for more than 1 hour — expire session
          localStorage.removeItem('user');
          localStorage.removeItem('lastActive');
          localStorage.removeItem('loginTime');
        }
      } else {
        // No lastActive timestamp — user logged in before this feature existed
        // Keep them logged in and set the timestamp now
        setUser(JSON.parse(storedUser));
        localStorage.setItem('lastActive', Date.now().toString());
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await client.post(`/auth/login`, { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('lastActive', Date.now().toString());
    }
    return res.data;
  };

  const signup = async (fullName, email, password, phone) => {
    const res = await client.post(`/auth/signup`, { 
      full_name: fullName, 
      email, 
      password, 
      phone 
    });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActive');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
