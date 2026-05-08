import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function apiRequest(path, options = {}) {
  const { headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const loadSession = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setCheckingSession(true);
    try {
      const data = await apiRequest('/api/auth/test');
      const sessionUser = data?.user || null;
      setUser(sessionUser);
      setIsAuthenticated(Boolean(sessionUser));
      return sessionUser;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      if (!quiet) setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await loadSession({ quiet: true });
    } catch (error) {
      setAuthError(error.message || 'Login failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      await login(email, password);
    } catch (error) {
      setAuthError(error.message || 'Registration failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Clear state anyway
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      checkingSession,
      authLoading,
      authError,
      login,
      register,
      logout,
      loadSession,
      setAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
