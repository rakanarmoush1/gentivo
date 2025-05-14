import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

interface User {
  uid: string;
  email: string | null;
  role?: 'admin' | 'salon';
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        // Get additional user data from Firestore if needed
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userDoc.data().role || 'salon',
            });
          } else {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: 'salon', // Default role
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
          });
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
      setInitialAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Don't set loading to false here - onAuthStateChanged will handle it
      // Wait for auth state to update and the effect to run
      return new Promise<void>((resolve) => {
        // Wait for auth state to update if it hasn't already
        if (!initialAuthChecked) {
          const checkUser = setInterval(() => {
            if (auth.currentUser) {
              clearInterval(checkUser);
              resolve();
            }
          }, 100);
          
          // Fallback in case something goes wrong
          setTimeout(() => {
            clearInterval(checkUser);
            resolve();
          }, 3000);
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function logout() {
    try {
      setLoading(true);
      await signOut(auth);
      // Don't set loading to false here - onAuthStateChanged will handle it
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
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