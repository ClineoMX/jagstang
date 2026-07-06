/**
 * API Configuration
 */

// URL base de la API
export const API_BASE_URL = 'http://localhost';

// URL base de la API de autenticación (puede ser diferente)
export const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'http://localhost';

// API Key (si es requerida) - trim para evitar espacios/nuevas líneas del .env
export const API_KEY = (import.meta.env.VITE_API_KEY || '').trim();

// Endpoints disponibles
export const API_ENDPOINTS = {
  // Autenticación (disponibles en puerto 8000)
  AUTH_LOGIN: '/auth/login/',
  AUTH_OTP: '/auth/otp/',
  AUTH_PASSWORD: '/auth/password/',

  // Pacientes (disponibles) — vista unificada en v2.0
  PATIENTS_LIST: '/patients/',
  PATIENTS_CREATE: '/patients/',
  PATIENTS_GET: (id: string) => `/patients/${id}/`,
  PATIENTS_IDENTITY: (id: string) => `/patients/${id}/identity/`,
  PATIENTS_CLINICAL_SUMMARY: (id: string) =>
    `/patients/${id}/clinical-summary/`,
  // Signos vitales (toma actual). El último valor se lee de `vital` en la vista
  // unificada del paciente; `PUT` sobreescribe la toma actual.
  PATIENTS_VITALS: (id: string) => `/patients/${id}/vitals/`,

  // Notas (v2.0: JSON body; sub-recurso usa {resource_id})
  NOTES_LIST: (patientId: string) => `/patients/${patientId}/notes/`,
  NOTES_CREATE: (patientId: string) => `/patients/${patientId}/notes/`,
  NOTES_GET: (patientId: string, resourceId: string) =>
    `/patients/${patientId}/notes/${resourceId}/`,
  NOTES_SIGN: (patientId: string, resourceId: string) =>
    `/patients/${patientId}/notes/${resourceId}/sign/`,
  NOTES_SUMMARY: (patientId: string) => `/patients/${patientId}/notes/summary/`,

  // Archivos (v2.0: PUT para crear; item usa {resource_id})
  ASSETS_UPLOAD: (patientId: string) => `/patients/${patientId}/assets/`,
  ASSETS_GET: (patientId: string, resourceId: string) =>
    `/patients/${patientId}/assets/${resourceId}/`,

  // Eventos / tiempo real (SSE) — v2.0 ({client} = patient_id)
  EVENTS_STREAM: (client: string) => `/patients/${client}/events/`,

  // Citas (no disponibles aún - ver api.md)
  APPOINTMENTS_LIST: '/appointments/',
  APPOINTMENTS_CREATE: '/appointments/',
  APPOINTMENTS_GET: (id: string) => `/appointments/${id}/`,
  APPOINTMENTS_UPDATE: (id: string) => `/appointments/${id}/`,
  APPOINTMENTS_CONFIRM: (id: string) => `/appointments/${id}/confirm/`,
  APPOINTMENTS_CANCEL: (id: string) => `/appointments/${id}/cancel/`,

  // Contactos (no disponibles aún - ver api.md)
  CONTACTS_LIST: '/contacts/',
  CONTACTS_CREATE: '/contacts/',
  CONTACTS_GET: (id: string) => `/contacts/${id}/`,
  CONTACTS_UPDATE: (id: string) => `/contacts/${id}/`,
  CONTACTS_DELETE: (id: string) => `/contacts/${id}/`,

  // Panel admin (rol ADMIN únicamente)
  ADMIN_DASHBOARD: '/admin/dashboard/',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  ADMIN_AUDIT_LOG_EXPORT: '/admin/audit-log/export/',
  ADMIN_USERS: '/admin/users/',
};
