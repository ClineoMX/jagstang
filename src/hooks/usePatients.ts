import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Patient, Attachment, AttachmentType, BloodType, Gender } from '../types';

const BLOOD_VALUES: readonly BloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

function normalizeBloodType(raw: string | null | undefined): BloodType | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  return (BLOOD_VALUES as readonly string[]).includes(t) ? (t as BloodType) : undefined;
}

function normalizeGender(raw: string | null | undefined): Gender | undefined {
  if (!raw?.trim()) return undefined;
  const g = raw.trim().toLowerCase();
  if (['male', 'm', 'masculino', 'hombre'].includes(g)) return 'male';
  if (['female', 'f', 'femenino', 'mujer'].includes(g)) return 'female';
  if (['other', 'otro', 'o'].includes(g)) return 'other';
  if (['prefer_not_to_say', 'prefiere no decir', 'prefiero no decir'].includes(g)) {
    return 'prefer_not_to_say';
  }
  return undefined;
}

/** API uses zero / sentinel dates for “missing” values. */
function isSentinelDate(iso: string | null | undefined): boolean {
  if (!iso?.trim()) return true;
  const y = iso.trim().slice(0, 4);
  return y === '0000' || y === '0001';
}

function mapTableRowToPatient(
  row: {
    id: string;
    slug?: string | null;
    name: string;
    lastname: string;
    lastname_m: string | null;
    phone?: string;
    birth_date?: string;
    gender?: string;
    blood_type?: string;
    is_recurrent: boolean;
    last_visit?: string;
    email?: string;
  },
  nowIso: string
): Patient {
  const phone = row.phone?.trim() ? row.phone.trim() : undefined;
  const email = row.email?.trim() ? row.email.trim() : undefined;
  const dateOfBirth =
    row.birth_date && !isSentinelDate(row.birth_date) ? row.birth_date : undefined;
  const lastVisit =
    row.last_visit && !isSentinelDate(row.last_visit) ? row.last_visit : undefined;
  const g = normalizeGender(row.gender);
  const bt = normalizeBloodType(row.blood_type);
  const slug =
    row.slug && row.slug.trim()
      ? row.slug.trim().replace(/^#/, '')
      : undefined;

  return {
    id: row.id,
    slug,
    firstName: row.name,
    lastName: row.lastname,
    lastNameMaternal: row.lastname_m?.trim() ? row.lastname_m : undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
    isRecurrent: row.is_recurrent,
    ...(phone && { phone }),
    ...(email && { email }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(g && { gender: g }),
    ...(bt && { bloodType: bt }),
    ...(lastVisit && { lastVisit }),
  };
}

function mimeToFileType(mime: string): AttachmentType {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word') || mime === 'application/msword') return 'word';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'excel';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'powerpoint';
  if (mime.includes('dicom')) return 'dicom';
  if (mime.includes('hl7')) return 'hl7';
  if (mime.includes('xml')) return 'xml';
  return 'other';
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (signal?: AbortSignal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.listPatientsTable({ size: 500 });
      if (signal?.aborted) return;
      const nowIso = new Date().toISOString();
      setPatients(response.results.map((row) => mapTableRowToPatient(row, nowIso)));
      setCount(response.count);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPatients(controller.signal);
    return () => controller.abort();
  }, [fetchPatients]);

  return {
    patients,
    count,
    loading,
    error,
    refetch: () => fetchPatients(),
  };
};

export const usePatient = (patientId: string | undefined) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatient = useCallback(async (signal?: AbortSignal) => {
    if (!patientId) {
      setPatient(null);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [patientData, identityData] = await Promise.all([
        apiService.getPatient(patientId),
        apiService.getPatientIdentity(patientId).catch(() => null),
      ]);
      if (signal?.aborted) return;

      const identityBirth = (identityData as any)?.birthdate;
      const identityGender = (identityData as any)?.gender;
      const dateOfBirth =
        typeof identityBirth === 'string' && !isSentinelDate(identityBirth)
          ? identityBirth
          : undefined;
      const gender = normalizeGender(
        typeof identityGender === 'string' ? identityGender : undefined
      );
      const transformedPatient: Patient = {
        id: patientData.id,
        slug:
          typeof (patientData as any)?.slug === 'string' && (patientData as any).slug.trim()
            ? (patientData as any).slug.trim().replace(/^#/, '')
            : undefined,
        firstName: patientData.name,
        lastName: patientData.lastname,
        lastNameMaternal: patientData.lastname_m ?? undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRecurrent: patientData.is_recurrent,
        ...(patientData.phone != null && { phone: patientData.phone }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
      };

      setPatient(transformedPatient);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Error al cargar paciente');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [patientId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadPatient(controller.signal);
    return () => controller.abort();
  }, [loadPatient]);

  return { patient, loading, error, refetch: () => loadPatient() };
};

export const usePatientAssets = (patientId: string | undefined) => {
  const [assets, setAssets] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(
    async (signal?: AbortSignal) => {
      if (!patientId) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.listPatientAssets(patientId);
        if (signal?.aborted) return;
        const transformed: Attachment[] = response.results.map((a) => ({
          id: a.id,
          fileName: a.original_filename,
          fileSize: a.file_size,
          fileType: mimeToFileType(a.mime_type),
          mimeType: a.mime_type,
          url: '',
          uploadedAt: '',
          uploadedBy: '',
          patientId,
        }));
        setAssets(transformed);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar archivos');
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [patientId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAssets(controller.signal);
    return () => controller.abort();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: () => fetchAssets() };
};
