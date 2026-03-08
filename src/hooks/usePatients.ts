import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Patient, Attachment, AttachmentType } from '../types';

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
      const response = await apiService.listPatients({ limit: 500 });
      if (signal?.aborted) return;
        const transformedPatients: Patient[] = response.results.map((p) => ({
        id: p.id,
        firstName: p.name,
        lastName: p.lastname,
        lastNameMaternal: p.lastname_m ?? undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRecurrent: p.is_recurrent,
      }));
      setPatients(transformedPatients);
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

  return { patients, count, loading, error, refetch: () => fetchPatients() };
};

export const usePatient = (patientId: string | undefined) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientData, profileData] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientProfile(patientId).catch(() => null),
        ]);
        if (controller.signal.aborted) return;

        const profilePhone =
          (profileData as any)?.phone ?? (profileData as any)?.phone_number;
        const transformedPatient: Patient = {
          id: patientData.id,
          firstName: patientData.name,
          lastName: patientData.lastname,
          lastNameMaternal: patientData.lastname_m ?? undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isRecurrent: patientData.is_recurrent,
          ...(patientData.phone != null && { phone: patientData.phone }),
          ...(profilePhone != null && profilePhone !== '' && { phone: profilePhone }),
        };

        setPatient(transformedPatient);
        setProfile(
          profileData
            ? { ...profileData, phone: profileData.phone ?? (profileData as any).phone_number }
            : profileData
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar paciente');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPatient();
    return () => controller.abort();
  }, [patientId]);

  return { patient, profile, loading, error };
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
