import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Patient, Attachment, AttachmentType } from '../types';
import {
  getClinicDataSnapshot,
  loadPatients,
  refreshPatients,
  subscribeClinicData,
} from '../lib/clinicDataStore';
import { isSentinelDate, normalizeGender } from '../utils/patientTableMapper';

function mimeToFileType(mime: string): AttachmentType {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word') || mime === 'application/msword') return 'word';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'excel';
  if (mime.includes('powerpoint') || mime.includes('presentation'))
    return 'powerpoint';
  if (mime.includes('dicom')) return 'dicom';
  if (mime.includes('hl7')) return 'hl7';
  if (mime.includes('xml')) return 'xml';
  return 'other';
}

function useClinicDataTick() {
  const [, setTick] = useState(0);
  useEffect(() => subscribeClinicData(() => setTick((n) => n + 1)), []);
}

export const usePatients = () => {
  useClinicDataTick();

  useEffect(() => {
    void loadPatients();
  }, []);

  const snap = getClinicDataSnapshot();

  const refetch = useCallback(() => refreshPatients(), []);

  return {
    patients: snap.patients,
    count: snap.patientsCount,
    loading: snap.patientsLoading,
    error: snap.patientsError,
    refetch,
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

      const identityBirth = (identityData as { birthdate?: string })?.birthdate;
      const identityGender = (identityData as { gender?: string })?.gender;
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
          typeof (patientData as { slug?: string }).slug === 'string' &&
          (patientData as { slug?: string }).slug?.trim()
            ? (patientData as { slug: string }).slug.trim().replace(/^#/, '')
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
