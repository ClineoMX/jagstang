import type { Patient, BloodType, Gender } from '../types';

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

export function normalizeGender(raw: string | null | undefined): Gender | undefined {
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
export function isSentinelDate(iso: string | null | undefined): boolean {
  if (!iso?.trim()) return true;
  const y = iso.trim().slice(0, 4);
  return y === '0000' || y === '0001';
}

export function mapTableRowToPatient(
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
