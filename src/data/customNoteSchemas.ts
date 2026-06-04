import type { FieldDef, SectionDef } from './noteSchemas';

export interface CustomNoteSchemaRecord {
  id: string;
  name: string;
  description?: string;
  sections: SectionDef[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'clineo_custom_note_schemas';

function load(): CustomNoteSchemaRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomNoteSchemaRecord[]) : [];
  } catch {
    return [];
  }
}

function save(records: CustomNoteSchemaRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listCustomNoteSchemas(): CustomNoteSchemaRecord[] {
  return load().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getCustomNoteSchema(id: string): CustomNoteSchemaRecord | null {
  return load().find((r) => r.id === id) ?? null;
}

export function saveCustomNoteSchema(
  record: Omit<CustomNoteSchemaRecord, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  }
): CustomNoteSchemaRecord {
  const all = load();
  const now = new Date().toISOString();

  if (record.id) {
    const idx = all.findIndex((r) => r.id === record.id);
    const updated: CustomNoteSchemaRecord = {
      ...(all[idx] ?? {}),
      ...record,
      id: record.id,
      createdAt: all[idx]?.createdAt ?? now,
      updatedAt: now,
    };
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    save(all);
    return updated;
  }

  const created: CustomNoteSchemaRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  save(all);
  return created;
}

export function deleteCustomNoteSchema(id: string): void {
  save(load().filter((r) => r.id !== id));
}

export function newField(kind: FieldDef['kind']): FieldDef {
  const id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const labelMap: Record<FieldDef['kind'], string> = {
    text: 'Campo de texto',
    richlite: 'Texto enriquecido',
    symptoms: 'Síntomas',
    diagnoses: 'Diagnósticos',
    vitals: 'Signos vitales',
    select: 'Selector',
    date: 'Fecha',
    number: 'Número',
    yesno: 'Sí / No',
    multi: 'Selección múltiple',
    signature: 'Firma',
  };
  const extras: Partial<FieldDef> =
    kind === 'text' ? { placeholder: 'Escribe aquí…' }
    : kind === 'richlite' ? { placeholder: 'Describe…' }
    : kind === 'vitals' ? { requiredKeys: ['bp_sys', 'bp_dia', 'hr'] }
    : kind === 'select' ? { options: ['Opción A', 'Opción B'], placeholder: 'Seleccionar…' }
    : kind === 'multi' ? { options: ['Opción A', 'Opción B'] }
    : kind === 'number' ? { unit: '' }
    : {};
  return { id, kind, label: labelMap[kind], ...extras };
}

export function newSection(): SectionDef {
  return {
    id: `section_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: 'Nueva sección',
    fields: [],
  };
}
