/**
 * Algunos payloads incluyen el slug con prefijo "#". En rutas como
 * `/patients/#foo` el navegador trata `#foo` como fragmento, no como path.
 */
export function normalizePatientSlug(slug: string | null | undefined): string {
  return (slug ?? '').trim().replace(/^#/, '');
}
