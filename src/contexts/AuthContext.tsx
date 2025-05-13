import { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'salon' | 'customer';
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // This is a mock implementation. In a real app, you would integrate with Firebase Auth
  async function login(email: string, password: string) {
    setLoading(true);
    
    try {
      // Mock login with predefined admin user
      if (email === 'admin@gentivo.ai' && password === 'password') {
        setCurrentUser({
          id: '1',
          email: 'admin@gentivo.ai',
          name: 'Admin User',
          role: 'admin'
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}