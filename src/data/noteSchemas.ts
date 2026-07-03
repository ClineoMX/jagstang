import type { NoteType } from '../types';

export type FieldKind =
  | 'richlite'
  | 'symptoms'
  | 'vitals'
  | 'diagnoses'
  | 'select'
  | 'date'
  | 'text'
  | 'number'
  | 'yesno'
  | 'multi'
  | 'signature';

export interface FieldDef {
  id: string;
  kind: FieldKind;
  label: string;
  required?: boolean;
  requiredKeys?: string[];
  placeholder?: string;
  options?: string[];
  /** Unit suffix for `number` fields (e.g. mmHg, kg, °C). */
  unit?: string;
}

export interface SectionDef {
  id: string;
  title: string;
  hint?: string;
  fields: FieldDef[];
}

export interface NoteSchema {
  noteTypeLabel: string;
  sections: SectionDef[];
}

export const COMMON_SYMPTOMS = [
  'Dolor', 'Fiebre', 'Fatiga', 'Náusea', 'Tos', 'Disnea',
  'Cefalea', 'Mareo', 'Insomnio', 'Palpitaciones', 'Vómito', 'Diarrea',
];

export const COMMON_DIAGNOSES = [
  'Hipertensión esencial (I10)',
  'Diabetes mellitus tipo 2 (E11)',
  'Dislipidemia (E78)',
  'Infección de vías respiratorias (J06)',
  'Ansiedad generalizada (F41.1)',
  'Lumbalgia (M54.5)',
  'Faringitis aguda (J02)',
  'Infección urinaria (N39.0)',
];

export const VITAL_FIELDS: Array<{
  key: string;
  kind?: 'bp';
  label: string;
  unit: string;
  calc?: boolean;
}> = [
  { key: 'bp', kind: 'bp', label: 'Presión Arterial', unit: 'mmHg' },
  { key: 'hr', label: 'Frecuencia Cardíaca', unit: 'lpm' },
  { key: 'rr', label: 'Frecuencia Respiratoria', unit: 'rpm' },
  { key: 'temp', label: 'Temperatura', unit: '°C' },
  { key: 'spo2', label: 'Saturación O₂', unit: '%' },
  { key: 'glucose', label: 'Glucosa', unit: 'mg/dL' },
  { key: 'weight', label: 'Peso', unit: 'kg' },
  { key: 'height', label: 'Talla', unit: 'cm' },
  { key: 'abdominal_perimeter', label: 'Perímetro Abdominal', unit: 'cm' },
  { key: 'bmi', label: 'IMC', unit: 'kg/m²', calc: true },
];

const EVOLUTION_SCHEMA: NoteSchema = {
  noteTypeLabel: 'Nota de Evolución',
  sections: [
    {
      id: 'evolucion',
      title: 'Evolución',
      hint: '¿Cómo ha evolucionado el paciente desde la última consulta?',
      fields: [
        {
          id: 'evolucion',
          kind: 'richlite',
          label: 'Evolución',
          required: true,
          placeholder: 'Describe la evolución del padecimiento…',
        },
      ],
    },
    {
      id: 'sintomas',
      title: 'Síntomas Actuales',
      hint: 'Marca los síntomas presentes y añade detalle si hace falta.',
      fields: [
        { id: 'sintomas_chips', kind: 'symptoms', label: 'Síntomas presentes' },
        {
          id: 'sintomas_notas',
          kind: 'richlite',
          label: 'Detalle / otros síntomas',
          placeholder: 'Cronología, intensidad, factores…',
        },
      ],
    },
    {
      id: 'vitales',
      title: 'Signos Vitales',
      hint: 'Captura numérica con unidades. El IMC se calcula automáticamente.',
      fields: [
        {
          id: 'vitals',
          kind: 'vitals',
          label: 'Signos vitales',
          requiredKeys: ['bp_sys', 'bp_dia', 'hr'],
        },
      ],
    },
    {
      id: 'exploracion',
      title: 'Exploración Física',
      hint: 'Hallazgos por aparatos y sistemas.',
      fields: [
        {
          id: 'exploracion',
          kind: 'richlite',
          label: 'Hallazgos',
          required: true,
          placeholder: 'Aspecto general, tórax, abdomen, extremidades…',
        },
      ],
    },
    {
      id: 'diagnostico',
      title: 'Impresión Diagnóstica',
      hint: 'Registra tu impresión diagnóstica con tus propias palabras.',
      fields: [
        {
          id: 'dx_impresion',
          kind: 'richlite',
          label: 'Impresión diagnóstica',
          required: true,
          placeholder:
            'Diagnóstico(s), justificación clínica, diagnósticos diferenciales…',
        },
        {
          id: 'dx_severity',
          kind: 'select',
          label: 'Severidad',
          options: ['Leve', 'Moderada', 'Severa'],
          placeholder: 'Seleccionar…',
        },
      ],
    },
    {
      id: 'plan',
      title: 'Plan de Tratamiento',
      hint: 'Indicaciones, medicación y seguimiento.',
      fields: [
        {
          id: 'plan',
          kind: 'richlite',
          label: 'Plan',
          required: true,
          placeholder: 'Medicamentos, dosis, estudios, recomendaciones…',
        },
      ],
    },
    {
      id: 'cita',
      title: 'Próxima Cita',
      hint: 'Agenda el seguimiento.',
      fields: [
        { id: 'cita_fecha', kind: 'date', label: 'Fecha de próxima cita' },
        {
          id: 'cita_modalidad',
          kind: 'select',
          label: 'Modalidad',
          options: ['Presencial', 'Teleconsulta'],
          placeholder: 'Seleccionar…',
        },
      ],
    },
  ],
};

const INTERROGATION_SCHEMA: NoteSchema = {
  noteTypeLabel: 'Interrogatorio',
  sections: [
    {
      id: 'motivo',
      title: 'Motivo de Consulta',
      hint: 'Razón principal por la que acude el paciente.',
      fields: [
        {
          id: 'motivo',
          kind: 'richlite',
          label: 'Motivo',
          required: true,
          placeholder: 'Describe el motivo de consulta…',
        },
      ],
    },
    {
      id: 'antecedentes_hf',
      title: 'Antecedentes Heredofamiliares',
      fields: [
        {
          id: 'antecedentes_hf',
          kind: 'richlite',
          label: 'Antecedentes heredofamiliares',
          placeholder: 'Enfermedades en familia directa…',
        },
      ],
    },
    {
      id: 'antecedentes_pp',
      title: 'Antecedentes Personales',
      fields: [
        {
          id: 'antecedentes_pp',
          kind: 'richlite',
          label: 'Patológicos',
          placeholder: 'Enfermedades previas, cirugías, hospitalizaciones…',
        },
        {
          id: 'antecedentes_np',
          kind: 'richlite',
          label: 'No patológicos',
          placeholder: 'Hábitos, ocupación, habitación…',
        },
      ],
    },
    {
      id: 'padecimiento',
      title: 'Padecimiento Actual',
      hint: 'Descripción cronológica de la enfermedad actual.',
      fields: [
        {
          id: 'padecimiento',
          kind: 'richlite',
          label: 'Padecimiento actual',
          required: true,
          placeholder: 'Inicio, evolución, síntomas, tratamientos previos…',
        },
      ],
    },
    {
      id: 'sintomas',
      title: 'Síntomas Actuales',
      fields: [
        { id: 'sintomas_chips', kind: 'symptoms', label: 'Síntomas presentes' },
        {
          id: 'sintomas_notas',
          kind: 'richlite',
          label: 'Detalle',
          placeholder: 'Intensidad, factores modificadores…',
        },
      ],
    },
    {
      id: 'vitales',
      title: 'Signos Vitales',
      fields: [
        {
          id: 'vitals',
          kind: 'vitals',
          label: 'Signos vitales',
          requiredKeys: ['bp_sys', 'bp_dia', 'hr'],
        },
      ],
    },
    {
      id: 'diagnostico',
      title: 'Impresión Diagnóstica',
      fields: [
        {
          id: 'dx_impresion',
          kind: 'richlite',
          label: 'Impresión diagnóstica',
          required: true,
          placeholder:
            'Diagnósticos, diagnósticos diferenciales, razonamiento clínico…',
        },
      ],
    },
    {
      id: 'plan',
      title: 'Plan',
      fields: [
        {
          id: 'plan',
          kind: 'richlite',
          label: 'Plan diagnóstico y terapéutico',
          required: true,
          placeholder: 'Estudios, medicamentos, indicaciones…',
        },
      ],
    },
  ],
};

const EXPLORATION_SCHEMA: NoteSchema = {
  noteTypeLabel: 'Exploración Física',
  sections: [
    {
      id: 'vitales',
      title: 'Signos Vitales',
      hint: 'Captura los signos vitales antes del examen.',
      fields: [
        {
          id: 'vitals',
          kind: 'vitals',
          label: 'Signos vitales',
          requiredKeys: ['bp_sys', 'bp_dia', 'hr'],
        },
      ],
    },
    {
      id: 'aspecto',
      title: 'Aspecto General',
      fields: [
        {
          id: 'aspecto',
          kind: 'richlite',
          label: 'Aspecto general',
          required: true,
          placeholder: 'Apariencia, estado de conciencia, hidratación…',
        },
      ],
    },
    {
      id: 'cabeza_cuello',
      title: 'Cabeza y Cuello',
      fields: [
        {
          id: 'cabeza_cuello',
          kind: 'richlite',
          label: 'Hallazgos',
          placeholder: 'Pupilas, mucosas, adenopatías, tiroides…',
        },
      ],
    },
    {
      id: 'torax',
      title: 'Tórax y Corazón',
      fields: [
        {
          id: 'torax',
          kind: 'richlite',
          label: 'Hallazgos',
          placeholder: 'Auscultación cardiaca y pulmonar, percusión…',
        },
      ],
    },
    {
      id: 'abdomen',
      title: 'Abdomen',
      fields: [
        {
          id: 'abdomen',
          kind: 'richlite',
          label: 'Hallazgos',
          placeholder: 'Ruidos peristálticos, palpación, visceromegalias…',
        },
      ],
    },
    {
      id: 'extremidades',
      title: 'Extremidades',
      fields: [
        {
          id: 'extremidades',
          kind: 'richlite',
          label: 'Hallazgos',
          placeholder: 'Pulsos, edemas, reflejos…',
        },
      ],
    },
    {
      id: 'diagnostico',
      title: 'Impresión Diagnóstica',
      fields: [
        {
          id: 'dx_impresion',
          kind: 'richlite',
          label: 'Impresión diagnóstica',
          required: true,
          placeholder:
            'Diagnóstico(s), justificación clínica, diagnósticos diferenciales…',
        },
      ],
    },
  ],
};

const PSYCH_EVOLUTION_SCHEMA: NoteSchema = {
  noteTypeLabel: 'Nota de Sesión Psicológica',
  sections: [
    {
      id: 'estado_actual',
      title: 'Estado Actual del Paciente',
      hint: 'Observaciones generales al inicio de la sesión.',
      fields: [
        {
          id: 'estado_actual',
          kind: 'richlite',
          label: 'Estado actual',
          required: true,
          placeholder: 'Presentación, afecto, estado de ánimo…',
        },
      ],
    },
    {
      id: 'temas_sesion',
      title: 'Temas de la Sesión',
      hint: 'Contenidos trabajados durante la sesión.',
      fields: [
        {
          id: 'temas_sesion',
          kind: 'richlite',
          label: 'Temas abordados',
          required: true,
          placeholder: 'Narrativa de lo trabajado en sesión…',
        },
      ],
    },
    {
      id: 'intervenciones',
      title: 'Intervenciones',
      fields: [
        {
          id: 'intervenciones',
          kind: 'richlite',
          label: 'Intervenciones terapéuticas',
          placeholder: 'Técnicas utilizadas, ejercicios, tareas…',
        },
      ],
    },
    {
      id: 'observaciones',
      title: 'Observaciones Clínicas',
      fields: [
        {
          id: 'observaciones',
          kind: 'richlite',
          label: 'Observaciones',
          required: true,
          placeholder: 'Avances, retrocesos, puntos de atención…',
        },
      ],
    },
    {
      id: 'plan',
      title: 'Plan para Próxima Sesión',
      fields: [
        {
          id: 'plan',
          kind: 'richlite',
          label: 'Plan terapéutico',
          placeholder: 'Objetivos, temas a trabajar, tareas asignadas…',
        },
        { id: 'cita_fecha', kind: 'date', label: 'Próxima sesión' },
      ],
    },
  ],
};

const PSYCH_INTERROGATION_SCHEMA: NoteSchema = {
  noteTypeLabel: 'Historia Clínica Psicológica Inicial',
  sections: [
    {
      id: 'motivo',
      title: 'Motivo de Consulta',
      fields: [
        {
          id: 'motivo',
          kind: 'richlite',
          label: 'Motivo de consulta',
          required: true,
          placeholder: 'Demanda del paciente con sus propias palabras…',
        },
      ],
    },
    {
      id: 'historia_personal',
      title: 'Historia Personal',
      fields: [
        {
          id: 'historia_infancia',
          kind: 'richlite',
          label: 'Infancia y desarrollo',
          placeholder: 'Hitos del desarrollo, dinámica familiar…',
        },
        {
          id: 'historia_educativa',
          kind: 'richlite',
          label: 'Historia educativa y laboral',
          placeholder: 'Escolaridad, trayectoria laboral…',
        },
        {
          id: 'relaciones',
          kind: 'richlite',
          label: 'Relaciones interpersonales',
          placeholder: 'Red de apoyo, relaciones afectivas…',
        },
      ],
    },
    {
      id: 'psicosocial',
      title: 'Evaluación Psicosocial',
      fields: [
        {
          id: 'psicosocial',
          kind: 'richlite',
          label: 'Evaluación',
          required: true,
          placeholder: 'Área emocional, cognitiva, conductual y social…',
        },
      ],
    },
    {
      id: 'diagnostico',
      title: 'Impresión Diagnóstica',
      fields: [
        {
          id: 'diagnostico_psicologico',
          kind: 'richlite',
          label: 'Diagnóstico psicológico',
          required: true,
          placeholder: 'Hipótesis diagnóstica, diagnósticos DSM/CIE…',
        },
      ],
    },
    {
      id: 'plan',
      title: 'Plan Terapéutico',
      fields: [
        {
          id: 'plan',
          kind: 'richlite',
          label: 'Plan',
          required: true,
          placeholder: 'Objetivos terapéuticos, enfoque, frecuencia de sesiones…',
        },
      ],
    },
  ],
};

export const NOTE_SCHEMAS: Partial<Record<NoteType, NoteSchema>> = {
  evolution: EVOLUTION_SCHEMA,
  interrogation: INTERROGATION_SCHEMA,
  exploration: EXPLORATION_SCHEMA,
  'psychology-evolution': PSYCH_EVOLUTION_SCHEMA,
  'psychology-interrogation': PSYCH_INTERROGATION_SCHEMA,
};

export function getSchema(noteType: NoteType): NoteSchema | null {
  return NOTE_SCHEMAS[noteType] ?? null;
}

// ── Completeness helpers ──────────────────────────────────────────────────────

export interface StructuredVitals {
  bp_sys?: string;
  bp_dia?: string;
  hr?: string;
  rr?: string;
  temp?: string;
  spo2?: string;
  glucose?: string;
  weight?: string;
  height?: string;
  abdominal_perimeter?: string;
}

export interface StructuredFormValues {
  vitals?: StructuredVitals;
  sintomas_chips?: string[];
  dx_chips?: string[];
  [key: string]: string | string[] | StructuredVitals | undefined;
}

export interface StructuredNoteContent {
  structured: true;
  schemaType: NoteType;
  /** Set when `schemaType === 'custom'` — id of the doctor's saved template. */
  templateId?: string;
  /**
   * Snapshot of the custom template's schema at save time (set alongside
   * `templateId`). Built-in schema types don't need this — `getSchema()`
   * already resolves them from static, versioned definitions in this file.
   * A custom template's fields live on the backend and can change or be
   * deleted after a note is signed, so previews/PDFs must render the schema
   * as it was when the note was written, not whatever the template is now —
   * hence embedding it here instead of re-fetching by `templateId`.
   */
  schema?: NoteSchema;
  values: StructuredFormValues;
}

export function isStructuredContent(raw: string): boolean {
  try {
    const p = JSON.parse(raw);
    return p?.structured === true;
  } catch {
    return false;
  }
}

export function parseStructuredContent(raw: string): StructuredNoteContent | null {
  try {
    const p = JSON.parse(raw);
    if (p?.structured === true) return p as StructuredNoteContent;
    return null;
  } catch {
    return null;
  }
}

function stripHtml(s: string): string {
  return (s || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function isFieldFilled(field: FieldDef, values: StructuredFormValues): boolean {
  const v = values[field.id];
  switch (field.kind) {
    case 'richlite':
      return stripHtml(String(v || '')).length > 0;
    case 'symptoms':
    case 'diagnoses':
    case 'multi':
      return Array.isArray(v) && v.length > 0;
    case 'vitals': {
      const keys = field.requiredKeys ?? [];
      const vv = values.vitals ?? {};
      return keys.every((k) => String(vv[k as keyof StructuredVitals] ?? '').trim() !== '');
    }
    case 'yesno':
      return v === 'yes' || v === 'no';
    case 'number':
    case 'signature':
    default:
      return String(v ?? '').trim() !== '';
  }
}

export function isFieldRequired(field: FieldDef): boolean {
  return !!(field.required || (field.requiredKeys && field.requiredKeys.length > 0));
}

export function getSectionCompletion(
  section: SectionDef,
  values: StructuredFormValues
): 'empty' | 'partial' | 'done' {
  const filled = section.fields.filter((f) => isFieldFilled(f, values)).length;
  if (filled === 0) return 'empty';
  if (filled === section.fields.length) return 'done';
  return 'partial';
}

export function getRequiredProgress(
  schema: NoteSchema,
  values: StructuredFormValues
): { total: number; done: number; pct: number } {
  let total = 0;
  let done = 0;
  for (const s of schema.sections) {
    for (const f of s.fields) {
      if (isFieldRequired(f)) {
        total++;
        if (isFieldFilled(f, values)) done++;
      }
    }
  }
  return { total, done, pct: total ? Math.round((done / total) * 100) : 100 };
}

export function computeBMI(vitals: StructuredVitals): string {
  const w = parseFloat(vitals.weight ?? '');
  const hcm = parseFloat(vitals.height ?? '');
  if (!w || !hcm) return '';
  const m = hcm / 100;
  return (w / (m * m)).toFixed(1);
}

// ── Compose: structured values → readable HTML ────────────────────────────────
//
// Las notas estructuradas se guardan como JSON (`{ structured, schemaType,
// values }`) para poder reabrirlas en el editor de formulario. Para mostrarlas
// (preview, PDF, timeline) las «componemos» en un solo documento HTML con un
// heading por sección y el contenido de cada campo lleno, en el orden del schema.

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function composeVitals(vitals: StructuredVitals): string {
  const parts: string[] = [];
  for (const vf of VITAL_FIELDS) {
    if (vf.kind === 'bp') {
      const sys = (vitals.bp_sys ?? '').trim();
      const dia = (vitals.bp_dia ?? '').trim();
      if (sys || dia) {
        parts.push(
          `<li><strong>${escapeHtml(vf.label)}:</strong> ${escapeHtml(
            sys || '—'
          )}/${escapeHtml(dia || '—')} ${escapeHtml(vf.unit)}</li>`
        );
      }
      continue;
    }
    if (vf.calc) {
      const bmi = computeBMI(vitals);
      if (bmi) {
        parts.push(
          `<li><strong>${escapeHtml(vf.label)}:</strong> ${escapeHtml(
            bmi
          )} ${escapeHtml(vf.unit)}</li>`
        );
      }
      continue;
    }
    const val = (vitals[vf.key as keyof StructuredVitals] ?? '').trim();
    if (val) {
      parts.push(
        `<li><strong>${escapeHtml(vf.label)}:</strong> ${escapeHtml(
          val
        )} ${escapeHtml(vf.unit)}</li>`
      );
    }
  }
  return parts.length ? `<ul>${parts.join('')}</ul>` : '';
}

function composeField(
  field: FieldDef,
  values: StructuredFormValues,
  showLabel: boolean
): string {
  const v = values[field.id];
  const label = escapeHtml(field.label);
  switch (field.kind) {
    case 'vitals':
      return composeVitals(values.vitals ?? {});
    case 'richlite':
      // El contenido ya es HTML (TipTap); lo insertamos tal cual.
      return `${showLabel ? `<h3>${label}</h3>` : ''}${String(v ?? '')}`;
    case 'symptoms':
    case 'diagnoses':
    case 'multi': {
      const arr = Array.isArray(v) ? (v as string[]) : [];
      return `<p><strong>${label}:</strong> ${arr
        .map((x) => escapeHtml(x))
        .join(', ')}</p>`;
    }
    case 'yesno':
      return `<p><strong>${label}:</strong> ${v === 'yes' ? 'Sí' : 'No'}</p>`;
    case 'signature':
      return `${
        showLabel ? `<h3>${label}</h3>` : ''
      }<p><img src="${String(v)}" alt="${label}" /></p>`;
    case 'number': {
      const unit = field.unit ? ` ${escapeHtml(field.unit)}` : '';
      return `<p><strong>${label}:</strong> ${escapeHtml(String(v ?? ''))}${unit}</p>`;
    }
    case 'date':
    case 'select':
    case 'text':
    default:
      return `<p><strong>${label}:</strong> ${escapeHtml(String(v ?? ''))}</p>`;
  }
}

/** Compone un schema + valores en un documento HTML con headings por sección. */
export function composeStructuredNote(
  schema: NoteSchema,
  values: StructuredFormValues
): string {
  const out: string[] = [];
  for (const section of schema.sections) {
    const filled = section.fields.filter((f) => isFieldFilled(f, values));
    if (filled.length === 0) continue;
    out.push(`<h2>${escapeHtml(section.title)}</h2>`);
    // Si la sección tiene un solo campo, el título de sección ya da contexto:
    // omitimos el label del campo para evitar encabezados redundantes.
    const showLabel = filled.length > 1;
    for (const f of filled) {
      const html = composeField(f, values, showLabel).trim();
      if (html) out.push(html);
    }
  }
  return out.join('\n');
}

/**
 * Si `raw` es una nota estructurada (JSON), devuelve su HTML compuesto; en caso
 * contrario devuelve `null` para que el llamador use el contenido tal cual.
 *
 * `templateSchemaCache` es un fallback opcional para notas de plantillas
 * personalizadas guardadas antes de que existiera el snapshot embebido
 * (`StructuredNoteContent.schema`) — el llamador lo llena resolviendo
 * `templateId` contra el backend y lo pasa aquí; sin él, esas notas antiguas
 * no tienen forma síncrona de resolver su schema.
 */
export function structuredNoteToHtml(
  raw: string,
  templateSchemaCache?: Record<string, NoteSchema>
): string | null {
  const parsed = parseStructuredContent(raw);
  if (!parsed) return null;
  const schema =
    parsed.schema ??
    (parsed.templateId
      ? templateSchemaCache?.[parsed.templateId]
      : undefined) ??
    getSchema(parsed.schemaType);
  if (!schema || !Array.isArray(schema.sections)) return null;
  return composeStructuredNote(schema, parsed.values ?? {});
}
