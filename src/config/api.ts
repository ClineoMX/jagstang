/**
 * API Configuration
 */

// URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

// URL base de la API de autenticación (puede ser diferente)
export const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost';

// API Key (si es requerida) - trim para evitar espacios/nuevas líneas del .env
export const API_KEY = (import.meta.env.VITE_API_KEY || '').trim();

// Endpoints disponibles
export const API_ENDPOINTS = {
  // Autenticación (disponibles en puerto 8000)
  AUTH_LOGIN: '/auth/login/',
  AUTH_OTP: '/auth/otp/',
  AUTH_PASSWORD: '/auth/password/',
  
  // Pacientes (disponibles)
  PATIENTS_LIST: '/patients/',
  PATIENTS_CREATE: '/patients/',
  PATIENTS_GET: (id: string) => `/patients/${id}/`,
  PATIENTS_PROFILE: (id: string) => `/patients/${id}/profile/`,
  PATIENTS_UPDATE_PROFILE: (id: string) => `/patients/${id}/profile/`,
  
  // Notas (disponibles)
  NOTES_LIST: (patientId: string) => `/${patientId}/notes/`,
  NOTES_CREATE: (patientId: string) => `/${patientId}/notes/`,
  NOTES_GET: (patientId: string, noteId: string) => `/${patientId}/notes/${noteId}/`,
  NOTES_SIGN: (patientId: string, noteId: string) => `/${patientId}/notes/${noteId}/sign/`,
  NOTES_ATTACH: (patientId: string, noteId: string) => `/${patientId}/notes/${noteId}/attach/`,
  
  // Archivos (disponibles)
  ASSETS_UPLOAD: (patientId: string) => `/${patientId}/assets/`,
  
  // Citas (no disponibles aún - ver api.md)
  APPOINTMENTS_LIST: '/appointments/',
  APPOINTMENTS_CREATE: '/appointments/',
  APPOINTMENTS_GET: (id: string) => `/appointments/${id}/`,
  APPOINTMENTS_UPDATE: (id: string) => `/appointments/${id}/`,
  APPOINTMENTS_CONFIRM: (id: string) => `/appointments/${id}/confirm/`,
  APPOINTMENTS_CANCEL: (id: string) => `/appointments/${id}/cancel/`,
  
  // Consentimientos (no disponibles aún - ver api.md)
  CONSENT_TYPES_LIST: '/consent-types/',
  CONSENT_TYPES_GET: (id: string) => `/consent-types/${id}/`,
  PATIENT_CONSENTS_LIST: (patientId: string) => `/patients/${patientId}/consents/`,
  PATIENT_CONSENTS_CREATE: (patientId: string) => `/patients/${patientId}/consents/`,
  PATIENT_CONSENTS_REVOKE: (patientId: string, consentId: string) => 
    `/patients/${patientId}/consents/${consentId}/revoke/`,
  
  // Contactos (no disponibles aún - ver api.md)
  CONTACTS_LIST: '/contacts/',
  CONTACTS_CREATE: '/contacts/',
  CONTACTS_GET: (id: string) => `/contacts/${id}/`,
  CONTACTS_UPDATE: (id: string) => `/contacts/${id}/`,
  CONTACTS_DELETE: (id: string) => `/contacts/${id}/`,
};

