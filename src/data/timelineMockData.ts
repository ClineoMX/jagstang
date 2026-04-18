/**
 * Optional mock timeline rows (solo recetas / labs de demostración) por paciente.
 *
 * Los pacientes nuevos no tienen entradas aquí → no se inyecta nada en el
 * timeline. Añade claves a `PATIENT_ITEMS` solo si necesitas datos de UI de
 * ejemplo para un `patientId` concreto.
 *
 * Las notas y citas reales vienen del API (`useNotes`, citas, etc.).
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

const PATIENT_ITEMS: Record<string, MockTimelineItem[]> = {};

export function getMockTimelineForPatient(
  patientId: string
): MockTimelineItem[] {
  return PATIENT_ITEMS[patientId] ?? [];
}
