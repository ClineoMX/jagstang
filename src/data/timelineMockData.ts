/**
 * Mock timeline data used by the redesigned PatientDetail page.
 *
 * NOTE: these records are purely for UI demonstration — the current backend
 * does not yet model prescriptions ("rx") or lab results ("lab"). Real timeline
 * items (signed/draft notes, appointments) are fetched live from the API; the
 * entries here are merged in alongside them so the timeline resembles the
 * prototype. Remove this file (and its import in `PatientDetail.tsx`) once
 * those domains are implemented on the backend.
 */

export interface MockRxItem {
  kind: 'rx';
  id: string;
  date: string; // ISO string
  title: string;
  body: string;
}

export interface MockLabItem {
  kind: 'lab';
  id: string;
  date: string;
  title: string;
  body: string;
}

export type MockTimelineItem = MockRxItem | MockLabItem;

const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
};

// Keyed by patient id. Unknown ids fall back to the "default" bucket so every
// patient sees at least one or two chip-style items.
const DEFAULT_ITEMS: MockTimelineItem[] = [
  {
    kind: 'rx',
    id: 'mock-rx-default-1',
    date: daysAgo(5),
    title: 'Receta: seguimiento',
    body: 'Paracetamol 500 mg c/8h · 3 días',
  },
  {
    kind: 'lab',
    id: 'mock-lab-default-1',
    date: daysAgo(40),
    title: 'Laboratorio general',
    body: 'Biometría hemática · Química sanguínea de 6 elementos',
  },
];

const PATIENT_ITEMS: Record<string, MockTimelineItem[]> = {};

export function getMockTimelineForPatient(
  patientId: string
): MockTimelineItem[] {
  return PATIENT_ITEMS[patientId] ?? DEFAULT_ITEMS;
}
