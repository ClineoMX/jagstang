import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Doctor, LoginCredentials } from '../types';
import { apiService } from '../services/api';

/** Decode X-Clineo-Identity token (JWT payload or JSON) to get name, family_name, gender, avatar_url */
function decodeIdentityToken(idToken: string | null): { name?: string; family_name?: string; gender?: 'male' | 'female'; avatar_url?: string } | null {
  if (!idToken || typeof idToken !== 'string') return null;
  try {
    // Try as plain JSON first
    const parsed = JSON.parse(idToken) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      return {
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        family_name: typeof parsed.family_name === 'string' ? parsed.family_name : undefined,
        gender: parsed.gender === 'male' || parsed.gender === 'female' ? parsed.gender : undefined,
        avatar_url: typeof parsed.avatar_url === 'string' ? parsed.avatar_url : undefined,
      };
    }
  } catch {
    // Not JSON, try JWT payload (middle part)
  }
  try {
    const parts = idToken.split('.');
    if (parts.length >= 2) {
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice(0, (4 - (base64.length % 4)) % 4);
      const decoded = atob(padded);
      const parsed = JSON.parse(decoded) as Record<string, unknown>;
      return {
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        family_name: typeof parsed.family_name === 'string' ? parsed.family_name : undefined,
        gender: parsed.gender === 'male' || parsed.gender === 'female' ? parsed.gender : undefined,
        avatar_url: typeof parsed.avatar_url === 'string' ? parsed.avatar_url : undefined,
      };
    }
  } catch {
    // Ignore
  }
  return null;
}

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
    const storedDoctor = localStorage.getItem('doctor');
    const storedToken = localStorage.getItem('token');
    const idToken = localStorage.getItem('id_token');

    if (storedDoctor && storedToken) {
      const doctorData = JSON.parse(storedDoctor) as Doctor;
      const identity = decodeIdentityToken(idToken);
      if (identity?.name !== undefined || identity?.family_name !== undefined || identity?.gender !== undefined || identity?.avatar_url !== undefined) {
        setDoctor({
          ...doctorData,
          firstName: identity.name ?? doctorData.firstName,
          lastName: identity.family_name ?? doctorData.lastName,
          gender: identity.gender ?? doctorData.gender,
          avatar: identity.avatar_url ?? doctorData.avatar,
        });
      } else {
        setDoctor(doctorData);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await apiService.login({
        username: credentials.email,
        password: credentials.password,
        method: 'email',
      });

      localStorage.setItem('token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      const idTokenValue = typeof response.id === 'string' ? response.id : JSON.stringify(response.id);
      localStorage.setItem('id_token', idTokenValue);

      const identity = decodeIdentityToken(idTokenValue);
      const doctorId = typeof response.id === 'string' ? response.id : credentials.email;
      const doctorData: Doctor = {
        id: doctorId,
        firstName: identity?.name ?? '',
        lastName: identity?.family_name ?? '',
        email: credentials.email,
        gender: identity?.gender,
        avatar: identity?.avatar_url,
        speciality: '',
        licenseNumber: '',
        phone: '',
      };
      setDoctor(doctorData);
      localStorage.setItem('doctor', JSON.stringify(doctorData));
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setDoctor(null);
    localStorage.removeItem('doctor');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
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
