/* Top-level app: proposal switcher + overview + mode state. */
const { createElement: m, useState: mS } = React;
const MIcon = window.Icon;

const PROPOSALS = [
  { id: 'overview', label: 'Resumen', cap: 'Contexto y razonamiento de diseño' },
  { id: 'A', label: 'Propuesta A · Continuo', cap: 'Un scroll · índice lateral fijo' },
  { id: 'B', label: 'Propuesta B · Acordeón', cap: 'Secciones plegables con resumen' },
  { id: 'C', label: 'Propuesta C · Guiado', cap: 'Asistente paso a paso + revisión' },
  { id: 'builder', label: 'Constructor', cap: 'Concepto · crear tipos de nota' },
];

function Overview({ go }) {
  const cards = [
    { id: 'A', tag: 'Propuesta A', title: 'Continuo', body: 'Una sola página con todas las secciones; un índice lateral fijo muestra el progreso y permite saltar. Es el menor cambio frente al editor actual — los doctores reconocen el lienzo, pero ahora cada dato es un campo.',
      points: ['Curva de aprendizaje mínima', 'Visión completa de la nota', 'Índice con puntos de avance'] },
    { id: 'B', tag: 'Propuesta B', title: 'Acordeón', body: 'Cada sección se pliega y muestra un resumen en una línea cuando está cerrada. Mantiene la nota compacta y escaneable; ideal en tablet o notas largas como la Exploración Física.',
      points: ['Compacto y escaneable', 'Resumen vivo al plegar', 'Pensado para tablet'] },
    { id: 'C', tag: 'Propuesta C', title: 'Guiado', body: 'Un asistente de una sección por pantalla con barra de progreso y pantalla de revisión final antes de firmar. Reduce la carga cognitiva en consulta y guía a quien empieza.',
      points: ['Enfoque sin distracción', 'Revisión antes de firmar', 'Excelente en consulta'] },
  ];
  return m('div', { className: 'app no-rail' },
    m('div', { className: 'content fade-in' },
      m('div', { className: 'ov-wrap' },
        m('div', { className: 'ov-hero' },
          m('div', { className: 'mono-crumb', style: { marginBottom: 10 } }, 'Editor de notas · Propuesta de rediseño'),
          m('h1', { style: { fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', margin: '0 0 14px' } }, 'De texto enriquecido a formularios estructurados'),
          m('p', { style: { fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 680, margin: 0 } },
            'Hoy cada tipo de nota inyecta una plantilla de encabezados y viñetas que el doctor rellena escribiendo. Los doctores lo perciben como “poco usual”. La propuesta: convertir cada tipo de nota en un ',
            m('strong', null, 'formulario rígido'), ' — campos numéricos con unidad, interruptores Sí/No, selección y un cuadro de texto enriquecido solo donde la narrativa lo amerita.'),
          m('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 } },
            ['Sobre la Nota de Evolución', 'Campos: número+unidad, Sí/No, selección, fecha, IMC automático', 'Toggle Formulario ↔ Texto', 'Medidor NOM-004 en vivo', 'Responsive'].map((t) =>
              m('span', { key: t, className: 'badge badge-neutral' }, t))),
        ),
        m('div', { style: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 18 } },
          m('div', { className: 'side-card', style: { padding: '18px 20px' } },
            m('div', { className: 'mono-label', style: { marginBottom: 10 } }, 'Supuestos'),
            m('ul', { className: 'ov-list', style: { margin: 0, paddingLeft: 18 } },
              m('li', null, 'Mockeo la ', m('strong', null, 'Nota de Evolución'), ' a fondo; las demás siguen el mismo sistema.'),
              m('li', null, 'Las secciones narrativas (Evolución, Plan…) conservan un editor enriquecido ligero.'),
              m('li', null, 'Los signos vitales pueden copiarse de la última toma.'),
              m('li', null, 'Se conserva la firma, el autoguardado y la integridad NOM-004.'))),
          m('div', { className: 'side-card', style: { padding: '18px 20px' } },
            m('div', { className: 'mono-label', style: { marginBottom: 10 } }, 'Sistema visual'),
            m('div', { style: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 } },
              'Mismos tokens de Clineo: cian de marca, papel cálido, etiquetas mono en versales, tarjetas blancas, colores de estado suaves. Nada nuevo — solo el editor cambia.')),
        ),
        m('div', { style: { marginBottom: 12 } }, m('span', { className: 'mono-label' }, 'Tres direcciones — pruébalas en las pestañas de arriba')),
        m('div', { className: 'ov-grid' },
          cards.map((cd) => m('div', { key: cd.id, className: 'ov-prop', onClick: () => go(cd.id) },
            m('div', { className: 'ov-tag' }, cd.tag),
            m('h3', null, cd.title),
            m('p', null, cd.body),
            m('div', { style: { marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 } },
              cd.points.map((p) => m('div', { key: p, style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-body)' } },
                m(MIcon, { name: 'check', size: 14, style: { color: 'var(--ok-fg)' } }), p))),
            m('div', { style: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-600)', fontSize: 13, fontWeight: 600 } },
              'Abrir propuesta', m(MIcon, { name: 'chevronRight', size: 15 }))))),
        m('div', { style: { marginTop: 18 } },
          m('div', { className: 'ov-prop', style: { cursor: 'pointer' }, onClick: () => go('builder') },
            m('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
              m('span', { className: 'bld-ico', style: { width: 40, height: 40 } }, m(MIcon, { name: 'layers', size: 20 })),
              m('div', { style: { flex: 1 } },
                m('div', { className: 'ov-tag' }, 'Idea #2 · Concepto'),
                m('h3', { style: { margin: '4px 0 0' } }, 'Constructor de tipos de nota'),
                m('p', { style: { marginTop: 4 } }, 'Un primer vistazo a cómo el equipo podría crear tipos de nota personalizados arrastrando campos. Aún es una idea — incluido para abrir la conversación.')),
              m(MIcon, { name: 'chevronRight', size: 18, style: { color: 'var(--brand-600)' } })))),
      ),
    ),
  );
}

function App() {
  const [tab, setTab] = mS('overview');
  const [mode, setMode] = mS('form');
  const cap = (PROPOSALS.find((p) => p.id === tab) || {}).cap || '';

  let view;
  if (tab === 'overview') view = m(Overview, { go: setTab });
  else if (tab === 'A') view = m(window.ProposalA, { mode, setMode });
  else if (tab === 'B') view = m(window.ProposalB, { mode, setMode });
  else if (tab === 'C') view = m(window.ProposalC, { mode, setMode });
  else if (tab === 'builder') view = m(window.Builder);

  return m(window.FormProvider, null,
    m('div', { className: 'switcher' },
      m('div', { className: 'sw-brand' }, m('span', { className: 'dot' }), 'Clineo · Editor de notas'),
      m('div', { className: 'sw-tabs' },
        PROPOSALS.map((p) => m('button', { key: p.id, className: 'sw-tab' + (tab === p.id ? ' active' : ''), onClick: () => setTab(p.id) }, p.label))),
      m('div', { className: 'sw-cap' }, cap)),
    view);
}

ReactDOM.createRoot(document.getElementById('root')).render(m(App));
