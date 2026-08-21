import type { FieldDef, SectionDef } from './noteSchemas';

/**
 * Modelo JSON que se serializa dentro de `Template.content` (string opaco sin
 * validación del servidor, ver /doctor/templates/). `updatedAt` es
 * responsabilidad del cliente: el servidor no expone timestamps de template.
 */
export interface NoteTemplateContent {
  description?: string;
  sections: SectionDef[];
  updatedAt: string;
}

export function serializeTemplateContent(content: {
  description?: string;
  sections: SectionDef[];
}): string {
  const payload: NoteTemplateContent = {
    ...content,
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export function parseTemplateContent(raw: string): NoteTemplateContent | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.sections)
    ) {
      return null;
    }
    return parsed as NoteTemplateContent;
  } catch {
    return null;
  }
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
    kind === 'text'
      ? { placeholder: 'Escribe aquí…' }
      : kind === 'richlite'
        ? { placeholder: 'Describe…' }
        : kind === 'vitals'
          ? { requiredKeys: ['bp_sys', 'bp_dia', 'hr'] }
          : kind === 'select'
            ? { options: ['Opción A', 'Opción B'], placeholder: 'Seleccionar…' }
            : kind === 'multi'
              ? { options: ['Opción A', 'Opción B'] }
              : kind === 'number'
                ? { unit: '' }
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
