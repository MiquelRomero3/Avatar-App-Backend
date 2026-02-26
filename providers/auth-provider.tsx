// app/providers/auth-provider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';

type User = any; // Pots afinar segons la resposta del teu backend

type AuthContextType = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carreguem token existent al iniciar l'app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Opcional: si vols, pots demanar el user al backend
          // const res = await axios.get('/users/me', { headers: { Authorization: `Bearer ${storedToken}` } });
          // setUser(res.data);
        }
      } catch (err) {
        console.error('Error carregant token:', err);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  // Funció de login
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/users/login', { email, password });
      const newToken = res.data.token;
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(res.data.user || null); // assegura't que el backend retorna user
    } catch (err: any) {
      console.error('Error login:', err.response?.data || err.message);
      throw err;
    }
  };

  // Funció de logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook per usar el context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
