/* Clineo app chrome: rail, page head, side panel, editor frame, mode toggle.
   Exposes window.AppFrame, window.EditorChrome, window.SidePanel. */
const { createElement: c, useState: cS } = React;
const CIcon = window.Icon;

/* ── Left icon rail ───────────────────────────────────────────── */
function AppRail() {
  const items = [
    { icon: 'home', label: 'Inicio' },
    { icon: 'users', label: 'Pacientes', active: true },
    { icon: 'calendar', label: 'Agenda' },
    { icon: 'book', label: 'Biblioteca' },
    { icon: 'shield', label: 'NOM' },
  ];
  return c('nav', { className: 'rail' },
    c('div', { className: 'rail-logo' }, c('img', { src: (window.__resources && window.__resources.railLogo) || 'assets/svg/clineo-icon.svg', alt: 'Clineo' })),
    items.map((it) => c('button', { key: it.label, className: 'rail-item' + (it.active ? ' active' : '') },
      c(CIcon, { name: it.icon, size: 20, stroke: 1.75 }),
      c('span', null, it.label))),
    c('div', { className: 'rail-spacer' }),
    c('div', { className: 'rail-avatar' }, 'DR'),
  );
}

/* ── Side panel cards ─────────────────────────────────────────── */
function SideCard({ heading, action, children }) {
  return c('div', { className: 'side-card' },
    c('div', { className: 'sc-head' },
      c('span', { className: 'mono-label' }, heading),
      action),
    children);
}

function NomMeterCard({ schema }) {
  const { values } = window.useForm();
  const [open, setOpen] = cS(false);
  const prog = window.completion.required(schema, values);
  const color = prog.pct >= 90 ? 'var(--ok-fg)' : prog.pct >= 60 ? 'var(--warn-fg)' : 'var(--crit-fg)';
  const reqFields = [];
  schema.sections.forEach((s) => s.fields.forEach((f) => {
    if (window.completion.fieldRequired(f)) reqFields.push({ section: s.title, field: f });
  }));
  return c('div', { className: 'side-card' },
    c('button', { type: 'button', onClick: () => setOpen((o) => !o),
      style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 } },
      c('span', { className: 'mono-label' }, 'Integridad NOM-004'),
      c(CIcon, { name: open ? 'chevronUp' : 'chevronDown', size: 15, style: { color: 'var(--text-label)' } })),
    c('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 } },
      c('span', { style: { color: 'var(--text-muted)' } }, 'Completitud'),
      c('span', { style: { fontWeight: 700, color } }, prog.pct + '%')),
    c('div', { className: 'meter-track' }, c('div', { className: 'meter-fill', style: { width: prog.pct + '%', background: color } })),
    c('div', { style: { fontSize: 11.5, color: 'var(--text-faint)', marginTop: 7 } },
      prog.done + ' de ' + prog.total + ' campos obligatorios'),
    open && c('div', { className: 'fade-in', style: { marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line-light)' } },
      reqFields.map(({ section, field }, i) => {
        const ok = window.completion.fieldFilled(field, values);
        return c('div', { key: i, className: 'nom-row' },
          c(CIcon, { name: ok ? 'check' : 'x', size: 14, style: { color: ok ? 'var(--ok-fg)' : 'var(--crit-fg)' } }),
          c('span', null, section));
      })),
  );
}

function SidePanel({ schema }) {
  const p = window.CLINEO_PATIENT;
  const lv = window.LAST_VITALS;
  const [sumOpen, setSumOpen] = cS(false);
  return c('div', { className: 'side-col' },
    c(SideCard, { heading: 'Paciente' },
      c('div', { className: 'patient-row' },
        c('div', { className: 'patient-av' }, p.initials),
        c('div', null,
          c('div', { style: { fontSize: 13.5, fontWeight: 600 } }, p.firstName + ' ' + p.lastName),
          c('div', { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 1 } }, p.age + ' años · ' + p.gender + ' · ' + p.bloodType)))),
    c('div', { className: 'side-card' },
      c('button', { type: 'button', onClick: () => setSumOpen((o) => !o),
        style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' } },
        c('span', { className: 'mono-label' }, 'Resumen clínico'),
        c(CIcon, { name: sumOpen ? 'chevronUp' : 'chevronDown', size: 15, style: { color: 'var(--text-label)' } })),
      sumOpen && c('div', { className: 'fade-in', style: { marginTop: 12, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.9 } },
        c('div', { style: { display: 'flex', justifyContent: 'space-between' } }, c('span', null, 'Últimos signos'), c('span', { style: { color: 'var(--text-faint)' } }, lv.recordedAt)),
        c('div', { style: { display: 'flex', justifyContent: 'space-between' } }, c('span', null, 'TA'), c('span', { style: { fontWeight: 600, color: 'var(--text-body)' } }, lv.bp_sys + '/' + lv.bp_dia + ' mmHg')),
        c('div', { style: { display: 'flex', justifyContent: 'space-between' } }, c('span', null, 'FC'), c('span', { style: { fontWeight: 600, color: 'var(--text-body)' } }, lv.hr + ' lpm')),
        c('div', { style: { display: 'flex', justifyContent: 'space-between' } }, c('span', null, 'Peso'), c('span', { style: { fontWeight: 600, color: 'var(--text-body)' } }, lv.weight + ' kg')))),
    c(NomMeterCard, { schema }),
    c(SideCard, { heading: 'Notas anteriores' },
      c('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        window.PREVIOUS_NOTES.map((n, i) => c('a', { key: i, href: '#', onClick: (ev) => ev.preventDefault(),
          style: { textDecoration: 'none', color: 'var(--text-strong)' } },
          c('div', { style: { fontSize: 12.5, fontWeight: 600 } }, n.title.split(' — ')[0]),
          c('div', { style: { fontSize: 11.5, color: 'var(--text-muted)' } }, n.date))))),
  );
}
window.SidePanel = SidePanel;

/* ── Mode toggle ──────────────────────────────────────────────── */
function ModeToggle({ mode, setMode }) {
  return c('div', { className: 'mode-toggle' },
    c('button', { className: mode === 'form' ? 'on' : '', onClick: () => setMode('form') },
      c(CIcon, { name: 'checkSquare', size: 13 }), 'Formulario'),
    c('button', { className: mode === 'texto' ? 'on' : '', onClick: () => setMode('texto') },
      c(CIcon, { name: 'type', size: 13 }), 'Texto'),
  );
}

/* ── Legacy free-text mode (escape hatch) ─────────────────────── */
const LEGACY_SEED = `<h2>Evolución</h2><p><br></p><h2>Síntomas Actuales</h2><p><br></p><h2>Signos Vitales</h2><ul><li><strong>Presión Arterial:</strong> </li><li><strong>Frecuencia Cardíaca:</strong> </li></ul><h2>Exploración Física</h2><p><br></p><h2>Impresión Diagnóstica</h2><p><br></p><h2>Plan de Tratamiento</h2><p><br></p>`;
function LegacyTextEditor() {
  const { values, setValue } = window.useForm();
  const v = values._freetext != null ? values._freetext : LEGACY_SEED;
  return c('div', { style: { padding: '18px 22px' } },
    c('div', { className: 'note-callout', style: { marginBottom: 14 } },
      'Modo texto libre — el editor enriquecido clásico. Útil para notas atípicas; el modo Formulario es el predeterminado.'),
    c(window.RichLite, { value: v, onChange: (val) => setValue('_freetext', val), placeholder: 'Escribe la nota…' }),
  );
}

/* ── Editor chrome (title + meta strip + body) ────────────────── */
window.EditorChrome = function EditorChrome({ mode, setMode, children, footer, bodyClassName, noPadBody }) {
  const { values, setValue } = window.useForm();
  return c('div', { className: 'editor-card' },
    c('input', { className: 'note-title', value: values._title || '', placeholder: 'Título de la nota',
      onChange: (ev) => setValue('_title', ev.target.value) }),
    c('div', { className: 'meta-strip' },
      c('span', { className: 'mono-label', style: { fontSize: 10.5 } }, 'Tipo'),
      c('select', { className: 'mini-select', defaultValue: 'evolution' },
        c('option', { value: 'interrogation' }, 'Interrogatorio'),
        c('option', { value: 'evolution' }, 'Nota de Evolución'),
        c('option', { value: 'exploration' }, 'Exploración Física')),
      c('span', { className: 'ms-divider' }),
      c(ModeToggle, { mode, setMode }),
      c('span', { className: 'ms-divider' }),
      c('span', { className: 'mono-label', style: { fontSize: 10.5 } }, 'Fecha'),
      c('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' } },
        new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' +
        new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })),
    ),
    mode === 'texto'
      ? c(LegacyTextEditor)
      : c('div', { className: bodyClassName, style: noPadBody ? null : { padding: '6px 4px' } }, children),
    footer,
  );
};

/* ── Page head ────────────────────────────────────────────────── */
function PageHeadBar({ onPrimary, primaryLabel, saveLabel }) {
  return c('div', { className: 'page-head' },
    c('div', { style: { minWidth: 0 } },
      c('div', { className: 'mono-crumb' }, 'Pacientes · María García López · Editar nota'),
      c('h1', null, 'Nota clínica')),
    c('div', { className: 'ph-actions' },
      c('div', { className: 'save-state' }, c('span', { className: 'sdot' }), c('span', null, saveLabel || 'Borrador automático')),
      c('button', { className: 'btn btn-primary btn-sm', onClick: onPrimary }, primaryLabel || 'Guardar borrador')),
  );
}

/* ── App frame ────────────────────────────────────────────────── */
window.AppFrame = function AppFrame({ schema, sidePanel = true, children, onPrimary, primaryLabel, saveLabel }) {
  return c('div', { className: 'app' },
    c(AppRail),
    c('div', { className: 'content fade-in' },
      c(PageHeadBar, { onPrimary, primaryLabel, saveLabel }),
      sidePanel
        ? c('div', { className: 'editor-grid' }, c('div', { style: { minWidth: 0 } }, children), c(SidePanel, { schema }))
        : children),
  );
};

Object.assign(window, { AppRail, SideCard, NomMeterCard, ModeToggle, PageHeadBar });
