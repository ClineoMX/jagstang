/* ───────────────────────────────────────────────────────────────
   Clineo · Equipo — catálogo de roles y permisos por rol.
   Los permisos reflejan los grants reales que el backend (marauder)
   escribe al asignar cada rol; son informativos y no editables.
   ─────────────────────────────────────────────────────────────── */
import type { IconType } from 'react-icons';
import { FiActivity, FiCalendar, FiClipboard, FiUsers } from 'react-icons/fi';
import type { StaffRoleId } from '../types';

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
}

// Catálogo de permisos agrupado por módulo — espejo de los grants del backend:
// nurse  → read/update patient + create vitals
// assistant → create/read/update appointments
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'Pacientes',
    icon: FiUsers,
    perms: [
      { id: 'pat.view', label: 'Ver expedientes de pacientes' },
      { id: 'pat.edit', label: 'Actualizar datos de pacientes' },
    ],
  },
  {
    module: 'Signos vitales',
    icon: FiActivity,
    perms: [{ id: 'vitals.record', label: 'Registrar signos vitales' }],
  },
  {
    module: 'Agenda y citas',
    icon: FiCalendar,
    perms: [
      { id: 'appt.view', label: 'Ver la agenda' },
      { id: 'appt.manage', label: 'Agendar y actualizar citas' },
    ],
  },
];

// Roles disponibles (los que un doctor puede asignar)
export const ROLES: StaffRole[] = [
  {
    id: 'nurse',
    label: 'Enfermero / a',
    short: 'Enfermería',
    desc: 'Apoyo clínico directo: consulta expedientes, actualiza datos del paciente y registra signos vitales.',
    accent: 'brand.600',
    icon: FiActivity,
    grants: ['pat.view', 'pat.edit', 'vitals.record'],
  },
  {
    id: 'assistant',
    label: 'Asistente médico',
    short: 'Asistente',
    desc: 'Apoyo de consultorio: gestiona la agenda del doctor — agenda, consulta y actualiza citas.',
    accent: '#7c5cd6',
    icon: FiClipboard,
    grants: ['appt.view', 'appt.manage'],
  },
];

export const roleById = (id: StaffRoleId): StaffRole =>
  ROLES.find((r) => r.id === id) ?? ROLES[0];

export const initials = (first: string, last: string) =>
  `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`;
