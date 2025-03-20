import React, { createContext, useContext, useState } from 'react';

import { handleGoogleLogin } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Student' | 'Super Admin';
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return auth;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      return new Promise((resolve, reject) => {
        const client = window.google?.accounts?.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (response: { access_token: string }) => {
            try {
              const authResponse = await handleGoogleLogin(response.access_token);
              setUser(authResponse.user);
              resolve();
            } catch (err) {
              setError('Authentication failed');
              reject(err);
            } finally {
              setIsLoading(false);
            }
          },
        });

        client?.requestAccessToken();
      });
    } catch (err) {
      setError('Authentication failed');
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    error,
    signInWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;