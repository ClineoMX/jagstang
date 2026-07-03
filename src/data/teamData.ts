/* ───────────────────────────────────────────────────────────────
   Clineo · Equipo — catálogo y roster (simulan la API)
   Roles, permisos por rol, turnos y personal del consultorio.
   Portado del prototipo de diseño "Clineo Equipo A" (staff-data.js).
   ─────────────────────────────────────────────────────────────── */
import type { IconType } from 'react-icons';
import {
  FiActivity,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiEdit,
  FiEdit3,
  FiHash,
  FiMoon,
  FiSun,
  FiSunrise,
  FiUsers,
} from 'react-icons/fi';
import type { ShiftId, StaffMember, StaffRoleId } from '../types';

export interface Permission {
  id: string;
  label: string;
}

export interface PermissionGroup {
  module: string;
  icon: IconType;
  perms: Permission[];
}

export interface StaffRole {
  id: StaffRoleId;
  label: string;
  short: string;
  desc: string;
  /** Color de acento (token Chakra o hex) usado en avatar, badge e ícono. */
  accent: string;
  icon: IconType;
  grants: string[];
  requiresLicense: boolean;
  licenseLabel: string;
}

export interface Shift {
  id: ShiftId;
  label: string;
  range: string | null;
  start?: string;
  end?: string;
  custom?: boolean;
  icon: IconType;
}

// Catálogo de permisos agrupado por módulo (definición de la organización)
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'Pacientes',
    icon: FiUsers,
    perms: [
      { id: 'pat.view', label: 'Ver expedientes de pacientes' },
      { id: 'pat.edit', label: 'Crear y editar pacientes' },
      { id: 'pat.sensitive', label: 'Ver datos sensibles y legales' },
    ],
  },
  {
    module: 'Agenda y citas',
    icon: FiCalendar,
    perms: [
      { id: 'appt.view', label: 'Ver la agenda' },
      { id: 'appt.manage', label: 'Agendar y reagendar citas' },
      { id: 'appt.cancel', label: 'Cancelar citas' },
    ],
  },
  {
    module: 'Notas clínicas',
    icon: FiClipboard,
    perms: [
      { id: 'note.view', label: 'Ver notas clínicas' },
      { id: 'note.create', label: 'Crear notas de enfermería' },
      { id: 'note.sign', label: 'Firmar notas' },
    ],
  },
  {
    module: 'Signos vitales',
    icon: FiActivity,
    perms: [{ id: 'vitals.record', label: 'Registrar signos vitales' }],
  },
  {
    module: 'Recetas',
    icon: FiEdit3,
    perms: [
      { id: 'rx.view', label: 'Ver recetas' },
      { id: 'rx.issue', label: 'Emitir recetas' },
    ],
  },
  {
    module: 'Facturación',
    icon: FiHash,
    perms: [
      { id: 'bill.view', label: 'Ver facturación' },
      { id: 'bill.issue', label: 'Emitir facturas' },
    ],
  },
];

// Roles disponibles (los que un doctor puede asignar)
export const ROLES: StaffRole[] = [
  {
    id: 'ENFERMERO',
    label: 'Enfermero / a',
    short: 'Enfermería',
    desc: 'Apoyo clínico directo: signos vitales, notas de enfermería y seguimiento en consulta.',
    accent: 'brand.600',
    icon: FiActivity,
    grants: [
      'pat.view',
      'pat.edit',
      'pat.sensitive',
      'appt.view',
      'appt.manage',
      'note.view',
      'note.create',
      'vitals.record',
      'rx.view',
    ],
    requiresLicense: true,
    licenseLabel: 'Cédula profesional de enfermería',
  },
  {
    id: 'ASISTENTE',
    label: 'Asistente médico',
    short: 'Asistente',
    desc: 'Apoyo administrativo y de consultorio: prepara pacientes y gestiona la agenda.',
    accent: '#7c5cd6',
    icon: FiClipboard,
    grants: [
      'pat.view',
      'pat.edit',
      'appt.view',
      'appt.manage',
      'appt.cancel',
      'note.view',
      'vitals.record',
      'rx.view',
      'bill.view',
      'bill.issue',
    ],
    requiresLicense: false,
    licenseLabel: '',
  },
  {
    id: 'RECEPCION',
    label: 'Recepción',
    short: 'Recepción',
    desc: 'Primer contacto: agenda, altas de pacientes y facturación. Sin acceso clínico.',
    accent: '#c07a2b',
    icon: FiCalendar,
    grants: [
      'pat.view',
      'pat.edit',
      'appt.view',
      'appt.manage',
      'appt.cancel',
      'bill.view',
      'bill.issue',
    ],
    requiresLicense: false,
    licenseLabel: '',
  },
];

export const SHIFTS: Shift[] = [
  {
    id: 'matutino',
    label: 'Matutino',
    range: '07:00 – 15:00',
    start: '07:00',
    end: '15:00',
    icon: FiSunrise,
  },
  {
    id: 'vespertino',
    label: 'Vespertino',
    range: '15:00 – 23:00',
    start: '15:00',
    end: '23:00',
    icon: FiSun,
  },
  {
    id: 'nocturno',
    label: 'Nocturno',
    range: '23:00 – 07:00',
    start: '23:00',
    end: '07:00',
    icon: FiMoon,
  },
  {
    id: 'completa',
    label: 'Jornada completa',
    range: '08:00 – 18:00',
    start: '08:00',
    end: '18:00',
    icon: FiClock,
  },
  {
    id: 'custom',
    label: 'Personalizado',
    range: null,
    custom: true,
    icon: FiEdit,
  },
];

export const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Roster actual del equipo
export const STAFF: StaffMember[] = [
  {
    id: 's1',
    firstName: 'María',
    lastName: 'Hernández Ruiz',
    role: 'ENFERMERO',
    shift: 'matutino',
    days: [0, 1, 2, 3, 4],
    email: 'maria.hernandez@clineo.mx',
    phone: '55 1234 5678',
    status: 'active',
    since: 'Mar 2024',
  },
  {
    id: 's2',
    firstName: 'José',
    lastName: 'Martínez León',
    role: 'ENFERMERO',
    shift: 'vespertino',
    days: [0, 1, 2, 3, 4],
    email: 'jose.martinez@clineo.mx',
    phone: '55 2345 6789',
    status: 'active',
    since: 'Ene 2025',
  },
  {
    id: 's3',
    firstName: 'Lucía',
    lastName: 'Gómez Prado',
    role: 'ASISTENTE',
    shift: 'completa',
    days: [0, 1, 2, 3, 4],
    email: 'lucia.gomez@clineo.mx',
    phone: '55 3456 7890',
    status: 'active',
    since: 'Sep 2023',
  },
  {
    id: 's4',
    firstName: 'Diego',
    lastName: 'Ramírez Sosa',
    role: 'ASISTENTE',
    shift: 'matutino',
    days: [0, 2, 4],
    email: 'diego.ramirez@clineo.mx',
    phone: '55 4567 8901',
    status: 'pending',
    since: 'Invitado',
  },
  {
    id: 's5',
    firstName: 'Andrea',
    lastName: 'Flores Cano',
    role: 'RECEPCION',
    shift: 'matutino',
    days: [0, 1, 2, 3, 4, 5],
    email: 'andrea.flores@clineo.mx',
    phone: '55 5678 9012',
    status: 'active',
    since: 'Jun 2024',
  },
];

export const roleById = (id: StaffRoleId): StaffRole =>
  ROLES.find((r) => r.id === id) ?? ROLES[0];

export const shiftById = (id: ShiftId): Shift | undefined =>
  SHIFTS.find((s) => s.id === id);

/** Resuelve etiqueta + rango horario de un miembro, respetando horas manuales. */
export const resolveShift = (
  s: Pick<StaffMember, 'shift' | 'shiftStart' | 'shiftEnd'>
): { label: string; range: string | null } => {
  if (s.shift === 'custom') {
    return {
      label: 'Personalizado',
      range:
        s.shiftStart && s.shiftEnd
          ? `${s.shiftStart} – ${s.shiftEnd}`
          : 'Horario a definir',
    };
  }
  const base = shiftById(s.shift) ?? SHIFTS[0];
  return { label: base.label, range: base.range };
};

export const initials = (first: string, last: string): string =>
  (first[0] || '') + (last[0] || '');
