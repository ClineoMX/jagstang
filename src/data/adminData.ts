/* ───────────────────────────────────────────────────────────────
   Clineo · Admin — datos simulados del panel interno (dashboard,
   usuarios, facturas, audit log). Portado del prototipo de diseño
   "Clineo Admin Engine" (admin-mock-data.js).

   Data es MOCK/en memoria — no hay backend/hooks todavía.
   ─────────────────────────────────────────────────────────────── */
import type { AdminClinicSummary, AdminInvoiceRow } from '../types';

export const dashboardStats = {
  totalClinics: 84,
  clinicsDelta: '+6 este mes',
  totalPatients: 12480,
  patientsDelta: '+3.2%',
  appointments: 3260,
  appointmentsDelta: '+1.1%',
  notesSigned: 2894,
  notesDelta: '96% del total',
  revenue: 418200,
  revenueDelta: '+8.4% vs mes anterior',
  openInvoices: 17,
};

export const revenueSeries = [62, 68, 64, 74, 71, 80, 77, 85, 90, 88, 96, 100];

export const topClinics: AdminClinicSummary[] = [
  { name: 'Clínica Aurora', doctors: 12, notes: 341, plan: 'Pro' },
  { name: 'Grupo Médico Vitalis', doctors: 9, notes: 298, plan: 'Pro' },
  { name: 'Consultorio Del Valle', doctors: 4, notes: 156, plan: 'Starter' },
  { name: 'Centro Médico Alba', doctors: 7, notes: 140, plan: 'Pro' },
  { name: 'Clínica San Rafael', doctors: 3, notes: 92, plan: 'Starter' },
];

export const adminInvoices: AdminInvoiceRow[] = [
  {
    id: 'INV-3021',
    clinic: 'Clínica Aurora',
    plan: 'Pro · 12 lic.',
    amount: 18400,
    status: 'paid',
    date: '2026-07-01',
  },
  {
    id: 'INV-3020',
    clinic: 'Grupo Médico Vitalis',
    plan: 'Pro · 9 lic.',
    amount: 13800,
    status: 'paid',
    date: '2026-07-01',
  },
  {
    id: 'INV-3019',
    clinic: 'Consultorio Del Valle',
    plan: 'Starter · 4 lic.',
    amount: 4200,
    status: 'pending',
    date: '2026-07-01',
  },
  {
    id: 'INV-3018',
    clinic: 'Centro Médico Alba',
    plan: 'Pro · 7 lic.',
    amount: 10600,
    status: 'pending',
    date: '2026-06-28',
  },
  {
    id: 'INV-3016',
    clinic: 'Clínica San Rafael',
    plan: 'Starter · 3 lic.',
    amount: 3150,
    status: 'overdue',
    date: '2026-06-15',
  },
  {
    id: 'INV-3012',
    clinic: 'Clínica Los Encinos',
    plan: 'Starter · 2 lic.',
    amount: 2100,
    status: 'overdue',
    date: '2026-06-10',
  },
  {
    id: 'INV-3009',
    clinic: 'Clínica Aurora',
    plan: 'Pro · 12 lic.',
    amount: 18400,
    status: 'paid',
    date: '2026-06-01',
  },
  {
    id: 'INV-3005',
    clinic: 'Grupo Médico Vitalis',
    plan: 'Pro · 9 lic.',
    amount: 13800,
    status: 'paid',
    date: '2026-06-01',
  },
];

export const money = (n: number) =>
  '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 });

export const dateShort = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const timeShort = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
