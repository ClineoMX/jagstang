/** Notas clínicas con esquema estructurado (toggle Formulario ↔ Texto en NoteForm). */
export const STRUCTURED_NOTE_EDITOR_ENABLED = true;

// ── Sidebar (rail / bottom nav) — un flag por entrada ──────────────────────────
// Home y Pacientes son el núcleo de la app y quedan habilitados por defecto;
// el resto arranca apagado y se habilita por separado según se vaya liberando.

/** Entrada «Home» en el rail / bottom nav del layout. */
export const HOME_NAV_ENABLED = true;

/** Entrada «Pacientes» en el rail / bottom nav del layout. */
export const PATIENTS_NAV_ENABLED = true;

/** Entrada «Calendario» en el rail / bottom nav del layout. */
export const CALENDAR_NAV_ENABLED = true;

/** Entrada «Equipo» en el rail / bottom nav del layout. */
export const TEAM_NAV_ENABLED = false;

/** Entrada «Contactos» en el rail / bottom nav del layout. */
export const CONTACTS_NAV_ENABLED = true;

/** Entrada «Biblioteca» en el rail / bottom nav del layout. */
export const LIBRARY_NAV_ENABLED = true;

/** Entrada «NOM» (compliance) en el rail / bottom nav del layout. */
export const COMPLIANCE_NAV_ENABLED = false;
