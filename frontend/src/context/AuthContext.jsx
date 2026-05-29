import { createContext, useContext, useEffect, useState } from 'react';
import { demoLogin, login } from '../services/api.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('smartretail_token');
    const storedUser = localStorage.getItem('smartretail_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  async function persistAuth(nextToken, nextUser) {
    localStorage.setItem('smartretail_token', nextToken);
    localStorage.setItem('smartretail_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  async function signIn(email, password) {
    const response = await login(email, password);
    await persistAuth(response.token, response.user);
  }

  async function signInDemo() {
    const response = await demoLogin();
    await persistAuth(response.token, response.user);
  }

  function signOut() {
    localStorage.removeItem('smartretail_token');
    localStorage.removeItem('smartretail_user');
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, token, isLoading, signIn, signInDemo, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}