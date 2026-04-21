import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

export interface PatientVitals {
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  bloodType?: string | null;
  nomPercent?: number | null;
}

const MOCK_BY_PATIENT_ID: Record<string, PatientVitals> = {
  default: {
    allergies: [],
    chronicConditions: [],
    medications: [],
    bloodType: null,
    nomPercent: null,
  },
};

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);
}

export function usePatientVitals(patientId: string | undefined) {
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async () => {
    if (!patientId) {
      setVitals(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPatientVitals(patientId);
      setVitals({
        allergies: normalizeArray(data?.allergies),
        chronicConditions: normalizeArray(data?.chronic_conditions),
        medications: normalizeArray(data?.medications),
        bloodType: data?.blood_type ?? null,
        nomPercent: data?.nom_percent ?? null,
      });
    } catch (err: any) {
      if (err?.status === 404) {
        setVitals(MOCK_BY_PATIENT_ID[patientId] || MOCK_BY_PATIENT_ID.default);
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar vitals');
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void fetchVitals();
  }, [fetchVitals]);

  const data = useMemo(
    () => vitals || (patientId ? MOCK_BY_PATIENT_ID.default : null),
    [patientId, vitals]
  );

  return { vitals: data, loading, error, refetch: fetchVitals };
}

