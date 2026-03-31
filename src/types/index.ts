// User/Doctor types
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Role comes from identity token (e.g. "DOCTOR", "WELLNESS") */
  role?: string;
  gender?: 'male' | 'female';
  speciality?: string;
  licenseNumber?: string;
  phone?: string;
  avatar?: string;
}

// Patient types
export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  lastNameMaternal?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodType?: BloodType;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Legal/Fiscal data
  curp?: string;
  rfc?: string;
  socialSecurityNumber?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  // System fields
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
  avatar?: string;
  /** Habilita pestañas Expediente/Archivos/Consentimientos y botón Nueva Nota */
  isRecurrent?: boolean;
}

// Appointment types
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ApiAppointment {
  id: string;
  patient_id: string;
  starts_at: string;
  ends_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

// Medical Note types
export type NoteType =
  | 'interrogation'
  | 'exploration'
  | 'evolution'
  | 'document'
  | 'custom'
  | 'psychology-interrogation'
  | 'psychology-evolution';

export interface NoteTemplate {
  id: string;
  name: string;
  type: NoteType;
  content: string; // Markdown template
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  doctorId?: string; // null for system templates
}

export type NoteStatus = 'draft' | 'signed';

export interface MedicalNote {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  title: string;
  type: NoteType;
  content: string; // Markdown content
  templateId?: string;
  template?: NoteTemplate;
  status: NoteStatus;
  isSigned: boolean; // Deprecated: use status instead, but keep for backward compatibility
  signedAt?: string;
  signedBy?: string;
  signature?: string; // RSA signature
  hash?: string; // Hash for comparing versions
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteCompletenessAnalysis {
  completeness_score: number;
  missing_fields?: string[];
  reasoning: Record<string, string>;
}

// Attachment types
export type AttachmentType =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'dicom'
  | 'hl7'
  | 'xml'
  | 'other';

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: AttachmentType;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  patientId?: string;
  noteId?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string; // JWT access token
  refresh: string; // JWT refresh token
  id: string; // User ID
  doctor?: Doctor; // Doctor info (may need to be fetched separately)
}

export interface PasswordResetRequest {
  username: string; // Email
}

export interface PasswordResetConfirm {
  username: string; // Email
  code: string; // Verification code
  password: string; // New password
}

export interface AccountConfirm {
  username: string; // Email
  code: string; // Verification code
}

// Search types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

// Consent types
export type ConsentStatus = 'granted' | 'revoked';

export interface ConsentType {
  id: string;
  name: string;
  description: string;
  fullText: string; // Markdown content explaining the consent in detail
  isRequired: boolean;
  category: string;
  version: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientConsent {
  id: string;
  patientId: string;
  consentTypeId: string;
  consentType?: ConsentType;
  status: ConsentStatus;
  grantedAt?: string;
  revokedAt?: string;
  signature?: string; // Patient's autograph signature (base64 image or signature data)
  signedBy: string; // Patient name
  version: string; // Version of consent they agreed to
  createdAt: string;
  updatedAt: string;
}

// Contact types
export type ContactType = 'provider' | 'colleague' | 'supplier' | 'other';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  alias?: string;
  email?: string;
  phone?: string;
  type: ContactType;
  company?: string;
  position?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// PDF Form templates (formularios llenables)
export interface FieldPosition {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TemplateFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'signature';

export interface TemplateField {
  id: string;
  name: string;
  type: TemplateFieldType;
  required: boolean;
  position?: FieldPosition | null;
  /** Solo en campos por defecto de la API */
  tag?: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  pdfFileName: string | null;
  fields: TemplateField[];
}
