/** Persisted between clinical note HTML and prescription block (legacy / API). */
export const RECETA_DELIMITER = '<!-- ___RECETA___ -->';

const RECETA_H2 = /<h2[^>]*>\s*Receta\s*<\/h2>/i;

/**
 * API stores `main + DELIMITER + prescriptionHtml`. The editor shows one
 * continuous document: main followed by the prescription block (no comment).
 */
export function mergeNoteBodyForEditor(raw: string): string {
  const i = raw.indexOf(RECETA_DELIMITER);
  if (i < 0) return raw;
  const main = raw.slice(0, i).trimEnd();
  let rx = raw.slice(i + RECETA_DELIMITER.length).trim();
  if (!rx) return main;
  if (!/^<(hr|h2)/i.test(rx)) {
    rx = `<hr /><h2>Receta</h2>${rx}`;
  }
  return main + rx;
}

/** Insert delimiter before `<h2>Receta</h2>` for storage / backward compatibility. */
export function serializeNoteBodyForApi(html: string): string {
  const m = html.match(RECETA_H2);
  if (!m || m.index === undefined) return html;
  const main = html.slice(0, m.index).trimEnd();
  const rx = html.slice(m.index);
  return main + RECETA_DELIMITER + rx;
}

export function hasRecetaSection(html: string): boolean {
  return RECETA_H2.test(html);
}
