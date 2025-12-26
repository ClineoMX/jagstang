import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Doctor, LoginCredentials } from '../types';
import { mockDoctor } from '../data/mockData';
import { USE_API } from '../config/api';
import { apiService } from '../services/api';

interface AuthContextType {
  doctor: Doctor | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const storedDoctor = localStorage.getItem('doctor');
    const storedToken = localStorage.getItem('token');
    
    if (storedDoctor && storedToken) {
      setDoctor(JSON.parse(storedDoctor));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (USE_API) {
        // Usar el endpoint de autenticación real
        const response = await apiService.login({
          username: credentials.email,
          password: credentials.password,
        });

        // Guardar tokens
        localStorage.setItem('token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user_id', response.id);

        // TODO: Obtener información del doctor usando el ID
        // Por ahora, usar mock doctor hasta que haya endpoint para obtener perfil
        // En producción, deberías hacer una llamada adicional para obtener el perfil del doctor
        setDoctor({
          ...mockDoctor,
          id: response.id,
        });
        localStorage.setItem('doctor', JSON.stringify({
          ...mockDoctor,
          id: response.id,
        }));
      } else {
        // Mock authentication
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (credentials.email && credentials.password) {
          setDoctor(mockDoctor);
          localStorage.setItem('doctor', JSON.stringify(mockDoctor));
          localStorage.setItem('token', 'mock-jwt-token');
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error: any) {
      // Re-throw con mensaje más claro
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Limpiar tokens y datos del usuario
    setDoctor(null);
    localStorage.removeItem('doctor');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    
    // TODO: Si hay endpoint de logout, llamarlo aquí
    // if (USE_API) {
    //   await apiService.logout();
    // }
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        isAuthenticated: !!doctor,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
