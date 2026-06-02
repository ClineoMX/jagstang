import { differenceInYears, isValid, parseISO } from 'date-fns';
import type { Patient } from '../types';
import type { PatientIdentity } from '../hooks/usePatientIdentity';
import { GENDER_LABELS } from '../hooks/usePatientIdentity';

/**
 * Texto inicial del bloque "Datos generales" (mismo formato que el placeholder:
 * viñetas `- Etiqueta: valor`).
 */
export function buildDatosGeneralesPrefill(
  patient: Patient | null,
  identity: PatientIdentity | null
): string {
  if (!patient) return '';

  const fullName = [
    patient.firstName,
    patient.lastName,
    patient.lastNameMaternal,
  ]
    .filter((s) => (s ?? '').trim().length > 0)
    .join(' ')
    .trim();

  let edad = '';
  const rawBirth = identity?.birthdate?.trim();
  if (rawBirth) {
    try {
      const d = parseISO(rawBirth);
      if (isValid(d)) {
        const years = differenceInYears(new Date(), d);
        if (years >= 0 && years < 130) edad = `${years} años`;
      }
    } catch {
      /* ignore */
    }
  }

  const g = identity?.gender?.trim();
  const sexo =
    g && g in GENDER_LABELS
      ? GENDER_LABELS[g as keyof typeof GENDER_LABELS]
      : g || '';

  const ocupacion = identity?.occupation?.trim() ?? '';

  return [
    `- Nombre del paciente: ${fullName}`,
    `- Edad: ${edad}`,
    `- Sexo: ${sexo}`,
    `- Ocupación: ${ocupacion}`,
  ].join('\n');
}
