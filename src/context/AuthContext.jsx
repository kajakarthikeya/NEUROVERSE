import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChangedSafe,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedSafe((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email, password) {
    const nextUser = await signInWithEmail(email, password);
    setUser(nextUser);
    return nextUser;
  }

  async function signup(email, password) {
    const nextUser = await signUpWithEmail(email, password);
    setUser(nextUser);
    return nextUser;
  }

  async function loginWithGoogle() {
    const nextUser = await signInWithGoogle();
    setUser(nextUser);
    return nextUser;
  }

  async function logout() {
    await signOutUser();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      loginWithGoogle,
      logout,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
