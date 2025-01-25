import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, initializeSession } = useAuthStore();

  useEffect(() => {
    console.log('AuthProvider: Initializing session');
    initializeSession();
  }, []);

  const value = {
    user,
    loading,
    signOut
  };

  console.log('AuthProvider: Current state', { user, loading });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
