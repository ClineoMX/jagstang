import type { ApiAppointment } from '../types';

/** Clinic hours: 09:00–18:00, 30-min granularity (matches Clineo prototype). */
export const CLINIC = { startMin: 9 * 60, endMin: 18 * 60, step: 30 } as const;

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min', api: '30m' },
  { value: 45, label: '45 min', api: '45m' },
  { value: 60, label: '1 hora', api: '60m' },
  { value: 90, label: '1.5 h', api: '90m' },
  { value: 120, label: '2 horas', api: '120m' },
] as const;

export const APPT_REASONS = [
  'Consulta de primera vez',
  'Seguimiento',
  'Revisión de estudios',
  'Control de crónico',
  'Certificado médico',
  'Urgencia',
] as const;

export type AppointmentSlot = {
  min: number;
  label: string;
  busy: boolean;
  who: string | null;
};

export function isoDate(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function minsToHHMM(m: number): string {
  return (
    String(Math.floor(m / 60)).padStart(2, '0') +
    ':' +
    String(m % 60).padStart(2, '0')
  );
}

export function hhmmToMins(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function fmt12(min: number): string {
  let h = Math.floor(min / 60);
  const m = min % 60;
  const ap = h >= 12 ? 'p.m.' : 'a.m.';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return hh + ':' + String(m).padStart(2, '0') + ' ' + ap;
}

const MON = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

const MON_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const DOW_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function isToday(d: Date): boolean {
  return isoDate(d) === isoDate(new Date());
}

export function dayLabel(
  d: Date,
  opt?: { relative?: boolean; long?: boolean }
): string {
  const today = isoDate(d) === isoDate(new Date());
  const tomorrow = isoDate(d) === isoDate(addDays(new Date(), 1));
  if (opt?.relative && today) return 'Hoy';
  if (opt?.relative && tomorrow) return 'Mañana';
  return opt?.long ? DOW_LONG[d.getDay()] : DOW_LONG[d.getDay()].slice(0, 3);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function summaryWhen(dateISO: string | null, timeMin: number | null): string | null {
  if (!dateISO || timeMin == null) return null;
  const d = new Date(dateISO + 'T00:00:00');
  const dl = dayLabel(d, { relative: true, long: true });
  const datePart =
    dl === 'Hoy' || dl === 'Mañana'
      ? dl
      : dl + ' ' + d.getDate() + ' ' + MON[d.getMonth()];
  return datePart + ' · ' + fmt12(timeMin);
}

export function durationToApi(minutes: number): string {
  const found = DURATION_OPTIONS.find((d) => d.value === minutes);
  return found?.api ?? `${minutes}m`;
}

export function parseInitialTime(time?: string): number | null {
  if (!time?.trim()) return null;
  const m = time.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Build booked blocks for a day from API appointments + patient names map. */
function bookedForDay(
  date: Date,
  appointments: ApiAppointment[],
  patientName: (id: string) => string
): { s: number; e: number; who: string }[] {
  const key = isoDate(date);
  return appointments
    .filter((a) => {
      const start = new Date(a.starts_at);
      return isoDate(start) === key && a.status?.toUpperCase() !== 'CANCELLED';
    })
    .map((a) => {
      const start = new Date(a.starts_at);
      const end = new Date(a.ends_at);
      const s =
        start.getHours() * 60 + start.getMinutes();
      const e = end.getHours() * 60 + end.getMinutes();
      return {
        s,
        e: e > s ? e : s + CLINIC.step,
        who: patientName(a.patient_id),
      };
    });
}

export function slotsForDay(
  date: Date,
  appointments: ApiAppointment[],
  patientName: (id: string) => string
): AppointmentSlot[] {
  const booked = bookedForDay(date, appointments, patientName);
  const slots: AppointmentSlot[] = [];
  for (let m = CLINIC.startMin; m < CLINIC.endMin; m += CLINIC.step) {
    const hit = booked.find((b) => m >= b.s && m < b.e);
    slots.push({
      min: m,
      label: minsToHHMM(m),
      busy: !!hit,
      who: hit ? hit.who : null,
    });
  }
  return slots;
}

export function isSlotFree(
  slots: AppointmentSlot[],
  slotIndex: number,
  durationMin: number
): boolean {
  const need = durationMin / CLINIC.step;
  for (let k = 0; k < need; k++) {
    const s = slots[slotIndex + k];
    if (!s || s.busy) return false;
  }
  return true;
}

export function appointmentCountByDay(
  appointments: ApiAppointment[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const a of appointments) {
    if (a.status?.toUpperCase() === 'CANCELLED') continue;
    const key = isoDate(new Date(a.starts_at));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function formatDayTimelineTitle(date: Date): string {
  return (
    dayLabel(date, { long: true }) +
    ', ' +
    date.getDate() +
    ' ' +
    MON_LONG[date.getMonth()]
  );
}

export { MON, MON_LONG };
