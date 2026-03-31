/**
 * API Service for Mustang API
 * Handles all HTTP requests to the backend API
 */

import { API_BASE_URL, AUTH_API_BASE_URL, API_KEY } from '../config/api';

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

    // API requiere: X-Clineo-Api-Key, X-Clineo-Identity (token), Authorization: Bearer login.access
    if (API_KEY) {
      headers['X-Clineo-Api-Key'] = API_KEY;
    }

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const idFromLogin = localStorage.getItem('id_token');
    if (idFromLogin) {
      headers['X-Clineo-Identity'] = idFromLogin;
    }

    return headers;
  }

  private getPublicHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['X-Clineo-Api-Key'] = API_KEY;
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
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('id_token');
          localStorage.removeItem('doctor');
          window.location.href = '/login';
        }
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
    }>(`/patients/${query ? `?${query}` : ''}`);
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
      phone?: string;
    }>(`/patients/${patientId}/`);
  }

  /**
   * Create a new patient
   */
  async createPatient(data: {
    name: string;
    lastname: string;
    lastname_m?: string;
    phone?: string;
  }) {
    return this.request<{
      id: string;
      name: string;
      lastname: string;
      lastname_m?: string;
      phone: string;
    }>('/patients/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get patient profile (api.md: GET /patients/<patient_id>/profile/)
   * Incluye phone, is_recurrent y avatar_url (si null/vacío se muestran iniciales).
   */
  async getPatientProfile(patientId: string) {
    return this.request<{
      phone?: string;
      phone_number?: string;
      is_recurrent?: boolean;
      avatar_url?: string | null;
    }>(`/patients/${patientId}/profile/`);
  }

  /**
   * Update patient profile (PATCH /patients/<patient_id>/profile/)
   */
  async updatePatientProfile(patientId: string, data: { phone?: string }) {
    return this.request(`/patients/${patientId}/profile/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ PATIENT IDENTITY ============

  async getPatientIdentity(patientId: string) {
    return this.request<{
      birthdate?: string;
      gender?: string;
      birthplace_state?: string;
      birthplace_country?: string;
      birthplace_city?: string;
      residence_state?: string;
      residence_country?: string;
      residence_city?: string;
      occupation?: string;
      education?: string;
      marital_status?: string;
      religion?: string;
      nationality?: string;
      education_level?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      emergency_contact_relationship?: string;
    }>(`/patients/${patientId}/identity-sheet/`);
  }

  async createPatientIdentity(
    patientId: string,
    data: Record<string, string>
  ) {
    return this.request<void>(`/patients/${patientId}/identity-sheet/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatientIdentity(
    patientId: string,
    data: Record<string, string>
  ) {
    return this.request<void>(`/patients/${patientId}/identity-sheet/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ CONTACTS ============

  /**
   * List contacts for the current doctor
   * GET /doctor/contacts/
   */
  async listContacts(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<{
      results: Array<{
        id: string;
        name: string;
        lastname: string;
        alias: string | null;
        type: string;
        email: string | null;
        phone: string | null;
        organization: string | null;
        role: string | null;
      }>;
      count: number;
      page: number;
      size: number;
    }>(`/doctor/contacts/${query ? `?${query}` : ''}`);
  }

  /**
   * Create a new contact
   * POST /doctor/contacts/
   */
  async createContact(data: {
    name: string;
    lastname: string;
    alias?: string;
    type: string;
    email?: string;
    phone?: string;
    organization?: string;
    role?: string;
  }) {
    return this.request<void>('/doctor/contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing contact
   * api.md muestra PUT /doctor/contacts/ sin ID,
   * pero seguimos el patrón REST usando /doctor/contacts/<id>/.
   */
  async updateContact(
    contactId: string,
    data: {
      name: string;
      lastname: string;
      alias?: string;
      type: string;
      email?: string;
      phone?: string;
      organization?: string;
      role?: string;
    }
  ) {
    return this.request<void>(`/doctor/contacts/${contactId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Archive (soft delete) a contact
   * DELETE /doctor/contacts/<contact_id>
   */
  async archiveContact(contactId: string) {
    return this.request<void>(`/doctor/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Restore an archived contact
   * POST /doctor/contacts/<contact_id>/restore/
   */
  async restoreContact(contactId: string) {
    return this.request<void>(`/doctor/contacts/${contactId}/restore/`, {
      method: 'POST',
      body: JSON.stringify(null),
    });
  }

  /**
   * Get a single contact by ID
   * GET /doctor/contacts/<contact_id>/
   */
  async getContact(contactId: string) {
    return this.request<{
      id: string;
      name: string;
      lastname: string;
      alias: string | null;
      type: string;
      email: string | null;
      phone: string | null;
      organization: string | null;
      role: string | null;
    }>(`/doctor/contacts/${contactId}/`);
  }

  // ============ APPOINTMENTS ============

  /**
   * List appointments for the current doctor
   * GET /doctor/appointments/
   */
  async listAppointments(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<{
      results: Array<{
        id: string;
        patient_id: string;
        starts_at: string;
        ends_at: string;
        status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
      }>;
      count: number;
      page: number;
      size: number;
    }>(`/doctor/appointments/${query ? `?${query}` : ''}`);
  }

  /**
   * Create a new appointment
   * POST /doctor/appointments/
   */
  async createAppointment(data: {
    patient: string;
    starts_at: string;
    duration: string;
  }) {
    return this.request<void>('/doctor/appointments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a single appointment by ID
   * GET /doctor/appointments/<id>/
   */
  async getAppointment(id: string) {
    return this.request<{
      id: string;
      patient_id: string;
      starts_at: string;
      ends_at: string;
      status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    }>(`/doctor/appointments/${id}/`);
  }

  /**
   * Update appointment status
   * PATCH /doctor/appointments/<id>/status/
   */
  async updateAppointmentStatus(
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  ) {
    return this.request<void>(`/doctor/appointments/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Delete an appointment
   * DELETE /doctor/appointments/<id>/
   */
  async deleteAppointment(id: string) {
    return this.request<void>(`/doctor/appointments/${id}/`, {
      method: 'DELETE',
    });
  }

  // ============ MEDICAL NOTES ============

  /**
   * Get count of notes for the current month
   * GET /doctor/notes/count/
   */
  async getDoctorNotesCount() {
    return this.request<{ count: number }>('/doctor/notes/count/');
  }

  /**
   * Get doctor notes (recent, this month)
   * GET /doctor/notes/recent/
   */
  async getDoctorNotesRecent(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return this.request<{
      results: Array<{
        id: string;
        title: string;
        status: string;
        patient_id: string;
        patient_name: string;
        patient_lastname: string;
        created_at?: string;
        updated_at?: string;
        accessed_at?: string;
      }>;
      count: number;
      page: number;
      size: number;
    }>(`/doctor/notes/recent/${query ? `?${query}` : ''}`);
  }

  /**
   * GET /doctor/fields/
   * Lista de campos creados por el doctor (para formularios).
   */
  async getDoctorFields(params?: { page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page != null) queryParams.append('page', params.page.toString());
    if (params?.size != null) queryParams.append('size', params.size.toString());
    const query = queryParams.toString();
    return this.request<{
      results: Array<{
        id: string;
        name: string;
        type: string;
        required: boolean;
      }>;
      count: number;
      page: number;
      size: number;
    }>(`/doctor/fields/${query ? `?${query}` : ''}`);
  }

  /**
   * POST /doctor/fields/
   * Crear campo del doctor. Payload: { name, type, required }.
   */
  async createDoctorField(body: { name: string; type: string; required: boolean }) {
    return this.request<{
      id: string;
      name: string;
      type: string;
      required: boolean;
    }>('/doctor/fields/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH /doctor/fields/<id>/
   * Actualizar campo. Mismo payload que POST.
   */
  async updateDoctorField(
    fieldId: string,
    body: { name: string; type: string; required: boolean }
  ) {
    return this.request<{
      id: string;
      name: string;
      type: string;
      required: boolean;
    }>(`/doctor/fields/${fieldId}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE /doctor/fields/<id>/
   */
  async deleteDoctorField(fieldId: string) {
    return this.request<void>(`/doctor/fields/${fieldId}/`, {
      method: 'DELETE',
    });
  }

  /**
   * POST /doctor/forms/
   * multipart/form-data: files (PDF), name, fields (JSON string)
   */
  async createDoctorForm(pdfFile: File, name: string, fields: unknown[]) {
    const formData = new FormData();
    formData.append('files', pdfFile);
    formData.append('name', name);
    formData.append('fields', JSON.stringify(fields));
    return this.request<{ id: string; name: string }>('/doctor/forms/', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * DELETE /doctor/forms/<form_id>/
   */
  async deleteDoctorForm(formId: string) {
    return this.request<void>(`/doctor/forms/${formId}/`, {
      method: 'DELETE',
    });
  }

  /**
   * GET /doctor/forms/
   * Lista de formularios guardados del doctor.
   */
  async listDoctorForms(params?: { page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page != null) queryParams.append('page', params.page.toString());
    if (params?.size != null) queryParams.append('size', params.size.toString());
    const query = queryParams.toString();
    return this.request<{
      results: Array<{ id: string; name: string }>;
      count: number;
      page: number;
      size: number;
    }>(`/doctor/forms/${query ? `?${query}` : ''}`);
  }

  /**
   * GET /doctor/forms/<formId>/
   * Detalle de un formulario guardado.
   */
  async getDoctorForm(formId: string) {
    return this.request<{
      id: string;
      name: string;
      key: string;
      fields: Array<{
        id: string;
        position?: { x: number; y: number; page: number; width: number; height: number };
      }>;
    }>(`/doctor/forms/${formId}/`);
  }

  /**
   * GET /doctor/assets/<assetId>/
   * Descarga un asset (PDF) como blob.
   */
  async getDoctorAsset(assetId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/doctor/assets/${assetId}/`;
    const response = await fetch(url, { headers: this.getAuthHeaders() });
    if (!response.ok) {
      throw { message: 'Error al descargar el asset', status: response.status } as ApiError;
    }
    return response.blob();
  }

  /**
   * GET /doctor/templates/
   * Lista de templates (notas/plantillas) del doctor.
   */
  async listDoctorTemplates(params?: { page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page != null) queryParams.append('page', params.page.toString());
    if (params?.size != null) queryParams.append('size', params.size.toString());
    const query = queryParams.toString();
    return this.request<{
      results: Array<{ id: string; name: string; content: string }>;
      count: number;
      page: number;
      size: number;
    }>(`/doctor/templates/${query ? `?${query}` : ''}`);
  }

  /**
   * GET /doctor/compliance/
   */
  async getDoctorCompliance() {
    return this.request<{
      doctor_id: string;
      overall_score: number;
      patient_count: number;
      alert_breakdown: { critical: number; ok: number; warning: number };
      worst_metric: string;
      patients: Array<{
        patient_id: string;
        overall_score: number;
        alert_level: 'ok' | 'warning' | 'critical';
        metrics: Record<
          string,
          {
            name: string;
            score: number;
            detail: string;
            items: number;
            passing: number;
          }
        >;
        computed_at: string;
      }>;
    }>('/doctor/compliance/');
  }

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
        title?: string;
        content?: string;
        type?: string;
        note_type?: string;
        status?: string;
        is_signed?: boolean;
        signed_at?: string;
        signed_by?: string;
        created_at: string;
        updated_at?: string;
      }>;
    }>(`/patients/${patientId}/notes/${query ? `?${query}` : ''}`);
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
    }>(`/patients/${patientId}/notes/${noteId}/`);
  }

  /**
   * Create a new medical note (draft)
   */
  async createNote(
    patientId: string,
    data: { content: string; note_type: string; title?: string; files?: File[] }
  ) {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('note_type', data.note_type);
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.files?.length) {
      data.files.forEach((file) => formData.append('files', file));
    }
    return this.request<{
      id: string;
      created_at: string;
      note_type: string;
      status: string;
      title?: string;
    }>(`/patients/${patientId}/notes/`, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Update a medical note (multipart/form-data)
   */
  async updateNote(
    patientId: string,
    noteId: string,
    data: {
      title?: string;
      content?: string;
      type?: string;
      files?: File[];
    }
  ) {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.type !== undefined) formData.append('note_type', data.type);
    if (data.files?.length) {
      data.files.forEach((file) => formData.append('files', file));
    }
    return this.request<{
      id: string;
      title: string;
      content: string;
      type: string;
      is_signed: boolean;
      created_at: string;
      updated_at: string;
    }>(`/patients/${patientId}/notes/${noteId}/`, {
      method: 'PATCH',
      body: formData,
    });
  }

  /**
   * Sign a medical note
   */
  async signNote(patientId: string, noteId: string, save_anyway = false) {
    const path = `/patients/${patientId}/notes/${noteId}/sign/`;
    const url = save_anyway ? `${path}?save_anyway=true` : path;
    return this.request(url, {
      method: 'PATCH',
    });
  }

  /**
   * Get note analysis
   */
  async getNoteAnalysis(patientId: string, noteId: string) {
    return this.request<{
      completeness_score: number;
      missing_fields: string[];
      reasoning: Record<string, string>;
    }>(`/patients/${patientId}/notes/${noteId}/analysis/`);
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

    return this.request(`/patients/${patientId}/notes/${noteId}/attach/`, {
      method: 'PATCH',
      body: formData,
    });
  }

  // ============ ASSETS/FILES ============

  /**
   * List assets for a patient
   */
  async listPatientAssets(
    patientId: string,
    params?: { page?: number; limit?: number }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();

    return this.request<{
      results: Array<{
        id: string;
        mime_type: string;
        key: string;
        file_size: number;
        original_filename: string;
        hash: string;
      }>;
      count: number;
      page: number;
      size: number;
    }>(`/patients/${patientId}/assets/${query ? `?${query}` : ''}`);
  }

  /**
   * Upload files/assets for a patient
   * Max 30MB per file
   */
  async uploadPatientAssets(patientId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.request<unknown>(`/patients/${patientId}/assets/`, {
      method: 'POST',
      body: formData,
    });
  }

  // ============ PATIENT CONSENTS ============

  /**
   * List consents for a patient (GET /patients/<patient_id>/consents/)
   */
  async listPatientConsents(
    patientId: string,
    params?: { page?: number; limit?: number }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page != null) queryParams.append('page', params.page.toString());
    if (params?.limit != null) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return this.request<{
      results: Array<{
        id: string;
        patient_id: string;
        user_id: string;
        consent_type: string;
        is_granted: boolean;
        is_revoked: boolean;
        expires_at: string | null;
        granted_at: string | null;
        revoked_at: string | null;
      }>;
      count: number;
      page: number;
      size: number;
    }>(`/patients/${patientId}/consents/${query ? `?${query}` : ''}`);
  }

  // ============ AUTHENTICATION ============

  private async authRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${AUTH_API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getPublicHeaders(),
          ...options.headers,
        },
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

  async login(credentials: { username: string; password: string; method: string }) {
    return this.authRequest<{ access: string; refresh: string; id: string }>(
      '/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  async requestOtp(username: string) {
    return this.authRequest<void>('/auth/otp/', {
      method: 'POST',
      body: JSON.stringify({ username, method: 'email' }),
    });
  }

  async changePassword(data: { code: string; username: string; password: string }) {
    return this.authRequest<void>('/auth/password/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

