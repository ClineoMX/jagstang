/**
 * Secciones del interrogatorio inicial (estructura de formsample.txt).
 * Cada sección es un campo libre; `bullets` se muestran como placeholder.
 */
export interface InterrogationFormSection {
  id: string;
  title: string;
  bullets: string[];
}

export const INTERROGATION_FORM_SECTIONS: InterrogationFormSection[] = [
  {
    id: 'datos_generales',
    title: 'Datos generales',
    bullets: ['Nombre del paciente:', 'Edad:', 'Sexo:', 'Ocupación:'],
  },
  {
    id: 'motivo_consulta',
    title: 'Motivo de consulta',
    bullets: [],
  },
  {
    id: 'antecedentes_heredofamiliares',
    title: 'Antecedentes heredofamiliares',
    bullets: ['Diabetes:', 'Hipertensión:', 'Cáncer:', 'Otros:'],
  },
  {
    id: 'ap_no_patologicos',
    title: 'Antecedentes personales no patológicos',
    bullets: [
      'Tabaquismo:',
      'Alcoholismo:',
      'Drogas:',
      'Actividad física:',
      'Alimentación:',
    ],
  },
  {
    id: 'ap_patologicos',
    title: 'Antecedentes personales patológicos',
    bullets: [
      'Enfermedades previas:',
      'Cirugías:',
      'Alergias:',
      'Medicamentos actuales:',
    ],
  },
  {
    id: 'padecimiento_actual',
    title: 'Padecimiento actual',
    bullets: [],
  },
  {
    id: 'interrogatorio_aparatos',
    title: 'Interrogatorio por aparatos y sistemas',
    bullets: [
      'Cardiovascular:',
      'Respiratorio:',
      'Digestivo:',
      'Genitourinario:',
      'Nervioso:',
      'Musculoesquelético:',
      'Endocrino:',
    ],
  },
];

export function interrogationPlaceholder(bullets: string[]): string {
  if (!bullets.length) return '';
  return bullets.map((b) => `- ${b}`).join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Construye el HTML de la nota tipo interrogatorio a partir de los valores del formulario. */
export function buildInterrogationNoteHtml(
  values: Record<string, string>
): string {
  const parts = ['<h1>Interrogatorio inicial</h1>'];
  for (const s of INTERROGATION_FORM_SECTIONS) {
    const raw = values[s.id] ?? '';
    const trimmed = raw.trim();
    parts.push(`<h2>${escapeHtml(s.title)}</h2>`);
    if (trimmed) {
      parts.push(
        `<div style="white-space:pre-wrap">${escapeHtml(raw).replace(/\n/g, '<br/>')}</div>`
      );
    } else {
      parts.push('<p></p>');
    }
  }
  return parts.join('');
}
