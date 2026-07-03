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

/** Extrae el texto de un bloque convirtiendo `<br>` en saltos de línea. */
function blockToText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return clone.textContent ?? '';
}

/**
 * Inverso de `buildInterrogationNoteHtml`: reconstruye los valores por sección a
 * partir del HTML guardado, emparejando por el título de cada `<h2>`. Las
 * secciones cuyo encabezado no se encuentre quedan vacías (degradación segura si
 * la nota fue editada con formato libre).
 */
export function parseInterrogationNoteHtml(
  html: string
): Record<string, string> {
  const values = Object.fromEntries(
    INTERROGATION_FORM_SECTIONS.map((s) => [s.id, ''])
  ) as Record<string, string>;
  if (!html || !html.trim()) return values;

  const titleToId = new Map(
    INTERROGATION_FORM_SECTIONS.map((s) => [s.title.trim().toLowerCase(), s.id])
  );
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const h2 of Array.from(doc.querySelectorAll('h2'))) {
    const id = titleToId.get((h2.textContent ?? '').trim().toLowerCase());
    if (!id) continue;
    const chunks: string[] = [];
    let node = h2.nextElementSibling;
    while (node && node.tagName !== 'H2') {
      chunks.push(blockToText(node));
      node = node.nextElementSibling;
    }
    values[id] = chunks
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return values;
}
