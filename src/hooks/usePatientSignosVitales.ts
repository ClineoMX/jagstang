import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService, type ApiVital } from '../services/api';

/**
 * Signos vitales — modelo de UI (una sola toma, "el último valor se
 * sobreescribe"). Todos los campos son opcionales: una toma puede registrar
 * solo algunos signos.
 */
export interface SignosVitales {
  /** Presión arterial sistólica (mmHg). */
  systolic: number | null;
  /** Presión arterial diastólica (mmHg). */
  diastolic: number | null;
  /** Frecuencia cardiaca (lpm). */
  heartRate: number | null;
  /** Frecuencia respiratoria (rpm). */
  respRate: number | null;
  /** Temperatura (°C). */
  temperature: number | null;
  /** Saturación de oxígeno (%). */
  spo2: number | null;
  /** Glucosa capilar (mg/dL). */
  glucose: number | null;
  /** Peso (kg). */
  weight: number | null;
  /** Talla (cm). */
  height: number | null;
  /** Perímetro abdominal (cm). */
  abdominalPerimeter: number | null;
  /** Notas de la toma. */
  notes: string;
  /** Momento de la toma (ISO) o null si aún no hay toma. */
  takenAt: string | null;
  /** Quién tomó los signos (nombre libre) o null. */
  taker: string | null;
}

export const EMPTY_SIGNOS: SignosVitales = {
  systolic: null,
  diastolic: null,
  heartRate: null,
  respRate: null,
  temperature: null,
  spo2: null,
  glucose: null,
  weight: null,
  height: null,
  abdominalPerimeter: null,
  notes: '',
  takenAt: null,
  taker: null,
};

/** True cuando ningún signo (ni notas) está registrado en la toma. */
export function isSignosEmpty(s: SignosVitales): boolean {
  const numeric: (keyof SignosVitales)[] = [
    'systolic',
    'diastolic',
    'heartRate',
    'respRate',
    'temperature',
    'spo2',
    'glucose',
    'weight',
    'height',
    'abdominalPerimeter',
  ];
  const allNull = numeric.every((k) => s[k] === null);
  return allNull && (!s.notes || s.notes.trim() === '');
}

/** Lee el primer alias presente de un objeto y lo normaliza a número | null. */
function pickNumber(
  raw: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const k of keys) {
    const v = raw[k];
    if (v === null || v === undefined || v === '') continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function pickString(
  raw: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === 'string' && v.trim() !== '') return v;
  }
  return null;
}

/**
 * Nombre a mostrar de quién tomó los signos. `taken_by` llega como objeto de
 * usuario `{ name, lastname, … }` (se une nombre + apellido); acepta también
 * un string plano en formas legacy.
 */
function pickTaker(raw: Record<string, unknown>): string | null {
  const tb = raw.taken_by ?? raw.takenBy;
  if (tb && typeof tb === 'object') {
    const o = tb as Record<string, unknown>;
    const parts = [o.name, o.lastname]
      .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
      .map((p) => p.trim());
    if (parts.length) return parts.join(' ');
  }
  return pickString(raw, ['taken_by', 'taker', 'created_by']);
}

/**
 * Mapea el `vital` de la vista unificada al modelo de UI. Lectura defensiva:
 * acepta varios alias por campo, ya que el nombre exacto del backend no está
 * fijado en el repo (solo la convención `*_bpm` / `*_mm_hg` / `*_celsius`).
 */
function mapApiVital(raw: ApiVital | null | undefined): SignosVitales {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SIGNOS };
  const r = raw as Record<string, unknown>;
  return {
    systolic: pickNumber(r, [
      'blood_pressure_systolic_mm_hg',
      'systolic_mm_hg',
      'systolic',
      'sys',
    ]),
    diastolic: pickNumber(r, [
      'blood_pressure_diastolic_mm_hg',
      'diastolic_mm_hg',
      'diastolic',
      'dia',
    ]),
    heartRate: pickNumber(r, ['heart_rate_bpm', 'heart_rate', 'hr', 'fc']),
    respRate: pickNumber(r, [
      'respiratory_rate_bpm',
      'respiratory_rate_rpm',
      'respiratory_rate',
      'rr',
      'fr',
    ]),
    temperature: pickNumber(r, ['temperature_celsius', 'temperature', 'temp']),
    spo2: pickNumber(r, [
      'oxygen_saturation',
      'oxygen_saturation_pct',
      'spo2',
      'saturation',
    ]),
    glucose: pickNumber(r, [
      'glucose_mg_dl',
      'blood_glucose_mg_dl',
      'glucose',
      'glu',
    ]),
    weight: pickNumber(r, ['weight_kg', 'weight', 'peso']),
    height: pickNumber(r, ['height_cm', 'height', 'talla']),
    abdominalPerimeter: pickNumber(r, [
      'abdominal_perimeter_cm',
      'abdominal_circumference_cm',
      'waist_circumference_cm',
      'abdominal_perimeter',
    ]),
    notes: pickString(r, ['notes', 'note', 'observations']) ?? '',
    takenAt: pickString(r, ['taken_at', 'takenAt', 'created_at']),
    taker: pickTaker(r),
  };
}

/**
 * Convierte el modelo de UI al payload del `PUT /vitals/`.
 *
 * El backend valida contra un struct Go: `heart_rate_bpm`,
 * `respiratory_rate_bpm` y las dos presiones son `*int16` → hay que mandarlos
 * como enteros (un decimal rompe la deserialización). El resto son `*float64`.
 * Los campos vacíos van como `null` (puntero nil, `omitempty` los ignora).
 */
function toApiVital(s: SignosVitales): ApiVital {
  const asInt = (v: number | null) => (v === null ? null : Math.round(v));
  return {
    blood_pressure_systolic_mm_hg: asInt(s.systolic),
    blood_pressure_diastolic_mm_hg: asInt(s.diastolic),
    heart_rate_bpm: asInt(s.heartRate),
    respiratory_rate_bpm: asInt(s.respRate),
    temperature_celsius: s.temperature,
    oxygen_saturation: s.spo2,
    glucose_mg_dl: s.glucose,
    weight_kg: s.weight,
    height_cm: s.height,
    abdominal_perimeter_cm: s.abdominalPerimeter,
    notes: s.notes.trim() || null,
    taken_at: s.takenAt,
  };
}

export function usePatientSignosVitales(patientId: string | undefined) {
  const [remote, setRemote] = useState<SignosVitales | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!patientId) {
        setRemote(null);
        return;
      }
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const patient = await apiService.getPatient(patientId);
        setRemote(mapApiVital(patient.vital));
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          (err as { status: number }).status === 404
        ) {
          setRemote({ ...EMPTY_SIGNOS });
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar signos vitales'
          );
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [patientId]
  );

  useEffect(() => {
    void fetchVitals();
  }, [fetchVitals]);

  const signos = useMemo(() => {
    if (!patientId) return null;
    return remote ?? EMPTY_SIGNOS;
  }, [patientId, remote]);

  /**
   * Guarda la toma (sobreescribe). `next` no necesita traer `takenAt`/`taker`:
   * se sellan aquí con el momento actual y el nombre recibido.
   */
  const save = useCallback(
    async (next: SignosVitales, takerName?: string) => {
      if (!patientId) return;
      const stamped: SignosVitales = {
        ...next,
        takenAt: new Date().toISOString(),
        taker: takerName ?? next.taker ?? null,
      };
      setSaving(true);
      setError(null);
      try {
        await apiService.upsertPatientVitals(patientId, toApiVital(stamped));
        // Refleja de inmediato la toma guardada; luego revalida en silencio.
        setRemote(stamped);
        void fetchVitals({ silent: true });
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'No se pudieron guardar los signos vitales';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [patientId, fetchVitals]
  );

  return {
    signos,
    loading,
    saving,
    error,
    refetch: fetchVitals,
    save,
  };
}
