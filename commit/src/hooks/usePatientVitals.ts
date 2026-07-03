import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

/** One named clinical line (allergy, medication, chronic condition). */
export interface VitalsLine {
  name: string;
  createdAt: string;
  /** True when line is an AI suggestion derived from the chart. */
  suggested?: boolean;
}

export interface PatientVitals {
  allergies: VitalsLine[];
  chronicConditions: VitalsLine[];
  medications: VitalsLine[];
  bloodType: string | null;
}

const EMPTY_VITALS: PatientVitals = {
  allergies: [],
  chronicConditions: [],
  medications: [],
  bloodType: null,
};

/** Normalize free-text vitals lines for API (allergies, medications, chronic_conditions). */
export function normalizeVitalsListText(value: string): string {
  return value.trim().toUpperCase();
}

function parseVitalsLine(
  raw: unknown,
  fallbackCreatedAt: string
): VitalsLine | null {
  if (typeof raw === 'string') {
    const name = normalizeVitalsListText(raw);
    if (!name) return null;
    return { name, createdAt: fallbackCreatedAt };
  }
  if (raw && typeof raw === 'object' && 'name' in raw) {
    const o = raw as Record<string, unknown>;
    const name = normalizeVitalsListText(String(o.name));
    if (!name) return null;
    const createdRaw = o.created_at;
    const created =
      typeof createdRaw === 'string' && createdRaw.trim() !== ''
        ? createdRaw
        : fallbackCreatedAt;
    const suggested =
      typeof o.suggested === 'boolean' ? o.suggested : undefined;
    return { name, createdAt: created, ...(suggested ? { suggested } : {}) };
  }
  return null;
}

function parseLines(
  raw: unknown,
  fallbackCreatedAt: string
): VitalsLine[] {
  if (!Array.isArray(raw)) return [];
  const out: VitalsLine[] = [];
  for (const item of raw) {
    const line = parseVitalsLine(item, fallbackCreatedAt);
    if (line) out.push(line);
  }
  return out;
}

function mapApiToPatientVitals(data: {
  blood_type?: string | null;
  allergies?: unknown;
  medications?: unknown;
  chronic_conditions?: unknown;
}): PatientVitals {
  const now = new Date().toISOString();
  return {
    bloodType:
      data.blood_type != null && String(data.blood_type).trim() !== ''
        ? String(data.blood_type).trim()
        : null,
    allergies: parseLines(data.allergies, now),
    medications: parseLines(data.medications, now),
    chronicConditions: parseLines(data.chronic_conditions, now),
  };
}

function toUpsertPayload(v: PatientVitals) {
  const now = new Date().toISOString();
  const line = (e: VitalsLine) => ({
    name: normalizeVitalsListText(e.name),
    created_at: e.createdAt?.trim() ? e.createdAt : now,
    // Always send `suggested` so the backend can preserve it on PUT.
    suggested: !!e.suggested,
  });
  return {
    blood_type: v.bloodType != null && v.bloodType.trim() !== '' ? v.bloodType.trim() : null,
    allergies: v.allergies.map(line),
    medications: v.medications.map(line),
    chronic_conditions: v.chronicConditions.map(line),
  };
}

export function usePatientVitals(patientId: string | undefined) {
  const [remote, setRemote] = useState<PatientVitals | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!patientId) {
        setRemote(null);
        return;
      }
      if (!opts?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await apiService.getPatientVitals(patientId);
        setRemote(mapApiToPatientVitals(data));
      } catch (err: any) {
        if (err?.status === 404) {
          setRemote({ ...EMPTY_VITALS });
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar vitals');
        }
      } finally {
        if (!opts?.silent) {
          setLoading(false);
        }
      }
    },
    [patientId]
  );

  useEffect(() => {
    void fetchVitals();
  }, [fetchVitals]);

  const vitals = useMemo(() => {
    if (!patientId) return null;
    return remote ?? EMPTY_VITALS;
  }, [patientId, remote]);

  const persistVitals = useCallback(
    async (next: PatientVitals) => {
      if (!patientId) return;
      setSaving(true);
      setError(null);
      try {
        await apiService.upsertPatientVitals(patientId, toUpsertPayload(next));
        await fetchVitals({ silent: true });
      } catch (err: any) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'No se pudo guardar el resumen clínico';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [patientId, fetchVitals]
  );

  const snapshot = useCallback((): PatientVitals => {
    return remote ?? EMPTY_VITALS;
  }, [remote]);

  const addAllergy = useCallback(
    async (line: string) => {
      const name = normalizeVitalsListText(line);
      if (!name || !patientId) return;
      const b = snapshot();
      await persistVitals({
        ...b,
        allergies: [...b.allergies, { name, createdAt: new Date().toISOString() }],
      });
    },
    [patientId, snapshot, persistVitals]
  );

  const removeAllergy = useCallback(
    async (index: number) => {
      if (!patientId) return;
      const b = snapshot();
      await persistVitals({
        ...b,
        allergies: b.allergies.filter((_, i) => i !== index),
      });
    },
    [patientId, snapshot, persistVitals]
  );

  const addChronicCondition = useCallback(
    async (line: string) => {
      const name = normalizeVitalsListText(line);
      if (!name || !patientId) return;
      const b = snapshot();
      await persistVitals({
        ...b,
        chronicConditions: [
          ...b.chronicConditions,
          { name, createdAt: new Date().toISOString() },
        ],
      });
    },
    [patientId, snapshot, persistVitals]
  );

  const removeChronicCondition = useCallback(
    async (index: number) => {
      if (!patientId) return;
      const b = snapshot();
      await persistVitals({
        ...b,
        chronicConditions: b.chronicConditions.filter((_, i) => i !== index),
      });
    },
    [patientId, snapshot, persistVitals]
  );

  const addMedication = useCallback(
    async (line: string) => {
      const name = normalizeVitalsListText(line);
      if (!name || !patientId) return;
      const b = snapshot();
      await persistVitals({
        ...b,
        medications: [...b.medications, { name, createdAt: new Date().toISOString() }],
      });
    },
    [patientId, snapshot, persistVitals]
  );

  const removeMedication = useCallback(
    async (index: number) => {
      if (!patientId) return;
      const b = snapshot();
      await persistVitals({
        ...b,
        medications: b.medications.filter((_, i) => i !== index),
      });
    },
    [patientId, snapshot, persistVitals]
  );

  const setBloodType = useCallback(
    async (bloodType: string | null) => {
      if (!patientId) return;
      const b = snapshot();
      const next =
        bloodType != null && bloodType.trim() !== '' ? bloodType.trim() : null;
      await persistVitals({ ...b, bloodType: next });
    },
    [patientId, snapshot, persistVitals]
  );

  return {
    vitals,
    loading,
    saving,
    error,
    refetch: fetchVitals,
    addAllergy,
    removeAllergy,
    addChronicCondition,
    removeChronicCondition,
    addMedication,
    removeMedication,
    setBloodType,
  };
}
