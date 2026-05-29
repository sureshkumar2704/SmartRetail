import { createContext, useContext, useEffect, useState } from 'react';
import { demoLogin, login } from '../services/api';

type User = { id: number; name: string; email: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('smartretail_token');
    const storedUser = localStorage.getItem('smartretail_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
    }
    setIsLoading(false);
  }, []);

  async function persistAuth(nextToken: string, nextUser: User) {
    localStorage.setItem('smartretail_token', nextToken);
    localStorage.setItem('smartretail_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  async function signIn(email: string, password: string) {
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

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
