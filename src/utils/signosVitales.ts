/**
 * Clineo · Signos vitales — evaluación clínica (pura, sin dependencias de UI/API).
 *
 * Reglas de rango (cue sutil de fuera de rango) y cálculo de IMC portados del
 * prototipo de diseño "Clineo Signos Vitales". Se aíslan aquí para poder
 * reutilizarlas en la tarjeta y el drawer, y para mantenerlas testeables.
 */

/** Nivel de alerta para un signo puntual. `null` = dentro de rango. */
export type VitalLevel = 'warn' | 'crit' | null;

/** Signos que tienen umbral de rango individual. */
export type RangeVitalKey = 'fc' | 'fr' | 'temp' | 'spo2' | 'glu';

/** True cuando el valor es un número utilizable (no null/NaN/vacío). */
export function hasValue(v: number | null | undefined): v is number {
  return v !== null && v !== undefined && !Number.isNaN(v);
}

/** Evalúa un signo individual contra sus umbrales de advertencia/crítico. */
export function evalVital(
  key: RangeVitalKey,
  value: number | null
): VitalLevel {
  if (!hasValue(value)) return null;
  const v = value;
  switch (key) {
    case 'fc':
      return v < 50 || v > 120 ? 'crit' : v < 60 || v > 100 ? 'warn' : null;
    case 'fr':
      return v < 10 || v > 24 ? 'crit' : v < 12 || v > 20 ? 'warn' : null;
    case 'temp':
      return v >= 38.5 || v < 35 ? 'crit' : v >= 37.6 ? 'warn' : null;
    case 'spo2':
      return v < 90 ? 'crit' : v < 94 ? 'warn' : null;
    case 'glu':
      return v >= 126 || v < 60 ? 'crit' : v >= 100 ? 'warn' : null;
    default:
      return null;
  }
}

/** Evalúa la presión arterial (sistólica / diastólica) de forma conjunta. */
export function evalBloodPressure(
  systolic: number | null,
  diastolic: number | null
): VitalLevel {
  if (!hasValue(systolic) && !hasValue(diastolic)) return null;
  const s = hasValue(systolic) ? systolic : 0;
  const d = hasValue(diastolic) ? diastolic : 0;
  if (s >= 180 || d >= 120) return 'crit';
  if (s >= 140 || d >= 90) return 'crit';
  if (s >= 130 || d >= 85) return 'warn';
  return null;
}

/** Índice de masa corporal a partir de peso (kg) y talla (cm). */
export function computeImc(
  weightKg: number | null,
  heightCm: number | null
): number | null {
  if (!hasValue(weightKg) || !hasValue(heightCm)) return null;
  const meters = heightCm / 100;
  if (meters <= 0) return null;
  return weightKg / (meters * meters);
}

export interface ImcClass {
  label: string;
  /** `ok` no pinta la tarjeta; `warn`/`crit` sí. */
  level: 'ok' | 'warn' | 'crit';
}

/** Clasifica el IMC (bajo peso / normal / sobrepeso / obesidad). */
export function classifyImc(imc: number | null): ImcClass | null {
  if (!hasValue(imc)) return null;
  if (imc < 18.5) return { label: 'Bajo peso', level: 'warn' };
  if (imc < 25) return { label: 'Normal', level: 'ok' };
  if (imc < 30) return { label: 'Sobrepeso', level: 'warn' };
  return { label: 'Obesidad', level: 'crit' };
}

/** Tiempo relativo en español ("hace 43 min", "hace 2 h", "hace 3 d"). */
export function relativeTimeEs(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.round(hrs / 24)} d`;
}
