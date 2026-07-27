import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { auth } from '../services/firebase';
import { logOut as authLogOut, signIn as authSignIn, signUp as authSignUp } from '../services/auth';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => ReturnType<typeof authSignIn>;
  signUp: (email: string, password: string) => ReturnType<typeof authSignUp>;
  logOut: () => ReturnType<typeof authLogOut>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: authSignIn,
        signUp: authSignUp,
        logOut: authLogOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
