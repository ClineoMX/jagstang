// User/Doctor types
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
}

// Appointment types
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

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
  | 'initial_interrogation'
  | 'evolution_note'
  | 'physical_examination'
  | 'custom';

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
  isSigned: boolean;
  signedAt?: string;
  signedBy?: string;
  signature?: string; // RSA signature
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
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
  token: string;
  doctor: Doctor;
}

// Search types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}
