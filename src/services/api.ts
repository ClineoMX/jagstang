/**
 * API Service for Mustang API
 * Handles all HTTP requests to the backend API
 */

import { AUTH_API_BASE_URL } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Bearer token if available (access token from auth API)
    const token = localStorage.getItem('token'); // This is the access token from login
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add API Key if available
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    let headers: HeadersInit = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      const headersObj = headers as Record<string, string>;
      delete headersObj['Content-Type'];
      headers = headersObj;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));
        throw {
          message: errorData.message || errorData.detail || 'An error occurred',
          status: response.status,
          errors: errorData.errors,
        } as ApiError;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return {} as T;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: 'Network error or server unavailable',
        status: 0,
      } as ApiError;
    }
  }

  // ============ PATIENTS ============

  /**
   * List all patients with pagination
   */
  async listPatients(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<{
      page: number;
      size: number;
      count: number;
      results: Array<{
        id: string;
        name: string;
        lastname: string;
        lastname_m: string | null;
        is_recurrent: boolean;
        grant_type: string;
      }>;
    }>(`/?${query}`);
  }

  /**
   * Get a specific patient by ID
   */
  async getPatient(patientId: string) {
    return this.request<{
      id: string;
      name: string;
      lastname: string;
      lastname_m: string | null;
      is_recurrent: boolean;
      grant_type: string;
    }>(`/${patientId}/`);
  }

  /**
   * Create a new patient
   */
  async createPatient(data: {
    name: string;
    lastname: string;
    lastname_m?: string;
    phone: string;
  }) {
    return this.request<{
      id: string;
      name: string;
      lastname: string;
      lastname_m?: string;
      phone: string;
    }>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get patient profile (full details with decrypted data)
   */
  async getPatientProfile(patientId: string) {
    return this.request<{
      gender?: string;
      birthdate?: string;
      ssn?: string;
      citizen_id?: string;
      tax_id?: string;
      email?: string;
      phone: string;
      address?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      blood_type?: string;
      insurance_provider?: string;
      insurance_number?: string;
    }>(`/${patientId}/profile/`);
  }

  /**
   * Update patient profile
   */
  async updatePatientProfile(
    patientId: string,
    data: Partial<{
      gender: string;
      birthdate: string;
      ssn: string;
      citizen_id: string;
      tax_id: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      blood_type: string;
      insurance_provider: string;
      insurance_number: string;
    }>
  ) {
    return this.request(`/${patientId}/profile/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ MEDICAL NOTES ============

  /**
   * List all notes for a patient
   */
  async listNotes(patientId: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<{
      page: number;
      size: number;
      count: number;
      results: Array<{
        id: string;
        title: string;
        content: string;
        type: string;
        is_signed: boolean;
        signed_at?: string;
        signed_by?: string;
        created_at: string;
        updated_at: string;
      }>;
    }>(`/${patientId}/notes/${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific note by ID
   */
  async getNote(patientId: string, noteId: string) {
    return this.request<{
      id: string;
      title: string;
      content: string;
      type: string;
      is_signed: boolean;
      signed_at?: string;
      signed_by?: string;
      created_at: string;
      updated_at: string;
    }>(`/${patientId}/notes/${noteId}/`);
  }

  /**
   * Create a new medical note
   */
  async createNote(
    patientId: string,
    data: {
      title: string;
      content: string;
      type: string;
    }
  ) {
    return this.request<{
      id: string;
      title: string;
      content: string;
      type: string;
      is_signed: boolean;
      created_at: string;
      updated_at: string;
    }>(`/${patientId}/notes/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a medical note
   */
  async updateNote(
    patientId: string,
    noteId: string,
    data: {
      title?: string;
      content?: string;
      type?: string;
    }
  ) {
    return this.request<{
      id: string;
      title: string;
      content: string;
      type: string;
      is_signed: boolean;
      created_at: string;
      updated_at: string;
    }>(`/${patientId}/notes/${noteId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Sign a medical note
   */
  async signNote(patientId: string, noteId: string) {
    return this.request(`/${patientId}/notes/${noteId}/sign/`, {
      method: 'PATCH',
    });
  }

  /**
   * Get note completeness analysis
   */
  async getNoteCompleteness(patientId: string, noteId: string) {
    return this.request<{
      completeness_score: number;
      reasoning: {
        has_diagnostic_impression?: string;
        has_disease_evolution?: string;
        has_physical_exam?: string;
        has_treatment_plan?: string;
        has_vital_signs?: string;
        [key: string]: string | undefined;
      };
    }>(`/${patientId}/notes/${noteId}/completeness/`);
  }

  /**
   * Attach files to a note
   */
  async attachFilesToNote(
    patientId: string,
    noteId: string,
    files: File[]
  ) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.request(`/${patientId}/notes/${noteId}/attach/`, {
      method: 'PATCH',
      body: formData,
    });
  }

  // ============ ASSETS/FILES ============

  /**
   * Upload files/assets for a patient
   */
  async uploadAsset(patientId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{
      id: string;
      file_name: string;
      file_size: number;
      file_type: string;
      mime_type: string;
      url: string;
      uploaded_at: string;
    }>(`/${patientId}/assets/`, {
      method: 'POST',
      body: formData,
    });
  }

  // ============ AUTHENTICATION ============

  /**
   * Login - Authenticate user and get tokens
   * Uses AUTH_API_BASE_URL (port 8000) instead of regular API
   */
  async login(credentials: { username: string; password: string }) {
    const url = `${AUTH_API_BASE_URL}/auth/login`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API Key if available
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText,
        }));
        throw {
          message: errorData.error || errorData.message || 'Login failed',
          status: response.status,
        } as ApiError;
      }

      return await response.json() as {
        access: string;
        id: string;
        refresh: string;
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: 'Network error or server unavailable',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(username: string) {
    const url = `${AUTH_API_BASE_URL}/auth/reset-password`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText,
        }));
        throw {
          message: errorData.error || errorData.message || 'Request failed',
          status: response.status,
        } as ApiError;
      }

      return await response.json() as { message: string };
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: 'Network error or server unavailable',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * Confirm password reset with verification code
   */
  async confirmPasswordReset(data: {
    username: string;
    code: string;
    password: string;
  }) {
    const url = `${AUTH_API_BASE_URL}/auth/confirm-password`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText,
        }));
        throw {
          message: errorData.error || errorData.message || 'Password reset failed',
          status: response.status,
        } as ApiError;
      }

      return await response.json() as { message: string };
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: 'Network error or server unavailable',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * Confirm account registration with verification code
   */
  async confirmAccount(data: { username: string; code: string }) {
    const url = `${AUTH_API_BASE_URL}/auth/confirm-account`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText,
        }));
        throw {
          message: errorData.error || errorData.message || 'Account confirmation failed',
          status: response.status,
        } as ApiError;
      }

      return await response.json() as { message: string };
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: 'Network error or server unavailable',
        status: 0,
      } as ApiError;
    }
  }
}

export const apiService = new ApiService();
export default apiService;

