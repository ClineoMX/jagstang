/* Top-level app: proposal switcher + overview. */
(function () {
  const { createElement: e, useState } = React;
  const Icon = window.Icon;

  const TABS = [
    { id: 'overview', label: 'Resumen', cap: 'Problema y dirección de diseño' },
    { id: 'A', label: 'A · Continuo', cap: 'Un cajón · menor curva de aprendizaje' },
    { id: 'B', label: 'B · Lienzo dividido', cap: 'Dos paneles · paciente + agenda a la vez' },
    { id: 'C', label: 'C · Guiado', cap: 'Asistente paso a paso · ideal en consulta' },
  ];

  // tiny schematic previews (simple rects only)
  const miniA = e('svg', { viewBox: '0 0 240 96', width: '100%', height: '100%', preserveAspectRatio: 'none' },
    e('rect', { width: 240, height: 96, fill: '#f6f5f1' }),
    e('rect', { x: 120, y: 0, width: 120, height: 96, fill: '#fff', stroke: '#e4e1d8' }),
    e('rect', { x: 134, y: 14, width: 60, height: 7, rx: 3, fill: '#2e7f99' }),
    e('rect', { x: 134, y: 30, width: 92, height: 13, rx: 4, fill: '#eceef2' }),
    e('rect', { x: 134, y: 50, width: 92, height: 8, rx: 3, fill: '#d4f0f7' }),
    e('rect', { x: 134, y: 62, width: 28, height: 14, rx: 3, fill: '#eceef2' }),
    e('rect', { x: 166, y: 62, width: 28, height: 14, rx: 3, fill: '#4cb7d7' }),
    e('rect', { x: 198, y: 62, width: 28, height: 14, rx: 3, fill: '#eceef2' }));
  const miniB = e('svg', { viewBox: '0 0 240 96', width: '100%', height: '100%', preserveAspectRatio: 'none' },
    e('rect', { width: 240, height: 96, fill: '#fff' }),
    e('rect', { x: 0, y: 0, width: 120, height: 96, fill: '#f6f5f1', stroke: '#e4e1d8' }),
    e('rect', { x: 14, y: 14, width: 50, height: 7, rx: 3, fill: '#2e7f99' }),
    e('rect', { x: 14, y: 30, width: 92, height: 11, rx: 4, fill: '#fff', stroke: '#dde0e6' }),
    e('rect', { x: 14, y: 48, width: 92, height: 11, rx: 4, fill: '#fff', stroke: '#dde0e6' }),
    e('rect', { x: 134, y: 14, width: 40, height: 7, rx: 3, fill: '#2e7f99' }),
    [0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => e('rect', { key: c + '-' + r, x: 134 + c * 22, y: 30 + r * 16, width: 17, height: 12, rx: 2, fill: (c + r) % 3 === 0 ? '#4cb7d7' : '#eceef2' }))));
  const miniC = e('svg', { viewBox: '0 0 240 96', width: '100%', height: '100%', preserveAspectRatio: 'none' },
    e('rect', { width: 240, height: 96, fill: '#f6f5f1' }),
    e('circle', { cx: 70, cy: 22, r: 8, fill: '#2e7f99' }),
    e('circle', { cx: 120, cy: 22, r: 8, fill: '#fff', stroke: '#c2c5cd', strokeWidth: 2 }),
    e('circle', { cx: 170, cy: 22, r: 8, fill: '#fff', stroke: '#c2c5cd', strokeWidth: 2 }),
    e('rect', { x: 78, y: 21, width: 34, height: 2, fill: '#c2c5cd' }),
    e('rect', { x: 128, y: 21, width: 34, height: 2, fill: '#c2c5cd' }),
    e('rect', { x: 70, y: 42, width: 100, height: 9, rx: 4, fill: '#27292f', transform: 'translate(-50,0)' }),
    e('rect', { x: 40, y: 60, width: 70, height: 14, rx: 7, fill: '#fff', stroke: '#dde0e6' }),
    e('rect', { x: 116, y: 60, width: 84, height: 14, rx: 7, fill: '#4cb7d7' }));

  function Overview({ go }) {
    const problems = [
      { icon: 'columns', t: 'Dos formularios separados', d: 'Crear paciente y crear cita son flujos distintos. Para citar a alguien nuevo hay que registrarlo, salir, buscarlo y volver a empezar.' },
      { icon: 'calendar', t: 'Calendario poco intuitivo', d: 'El campo de fecha/hora nativo obliga a teclear y no muestra qué horarios están libres ni ocupados.' },
      { icon: 'search', t: 'Búsqueda ambigua', d: 'La barra de pacientes no distingue entre homónimos. Dos “Juan Pérez” se ven idénticos y es fácil citar al equivocado.' },
    ];
    const cards = [
      { id: 'A', tag: 'Propuesta A', title: 'Continuo', mini: miniA,
        body: 'Un solo cajón lateral, igual al patrón actual: buscas o creas al paciente arriba y eliges el horario abajo, todo en un scroll. Mínima recapacitación.',
        pts: ['Reusa el cajón que ya conocen', 'Crear paciente se expande en línea', 'Rejilla de horarios con ocupados visibles'] },
      { id: 'B', tag: 'Propuesta B', title: 'Lienzo dividido', mini: miniB,
        body: 'Compositor de dos paneles: paciente a la izquierda, calendario real + línea de tiempo del día a la derecha. Ves a quién y cuándo simultáneamente.',
        pts: ['Quién y cuándo, lado a lado', 'Calendario de mes + timeline real', 'Pestañas Buscar / Nuevo paciente'] },
      { id: 'C', tag: 'Propuesta C', title: 'Guiado', mini: miniC,
        body: 'Asistente de tres pasos — ¿Quién? · ¿Cuándo? · Confirmar — con sugerencias inteligentes de horario y revisión final. Enfocado, ideal en consulta o tablet.',
        pts: ['Una decisión por pantalla', 'Sugiere el próximo hueco libre', 'Pantalla de revisión antes de guardar'] },
    ];
    return e('div', { className: 'app no-rail' },
      e('div', { className: 'fade-in', style: { padding: '26px 38px 60px' } },
        e('div', { className: 'ov-wrap' },
          e('div', { className: 'ov-hero' },
            e('div', { className: 'mono-crumb', style: { marginBottom: 10 } }, 'Paciente + Cita · Propuesta de rediseño'),
            e('h1', null, 'Un solo flujo para registrar y agendar'),
            e('p', null,
              'Hoy “Nuevo paciente” y “Nueva cita” son dos formularios aislados. Las doctoras quieren crear al paciente y agendarlo en el mismo gesto — en ambos sentidos. Estas tres direcciones unifican los formularios y, de paso, arreglan el selector de fecha y la búsqueda de pacientes.'),
            e('div', { className: 'ov-problems' },
              problems.map((p) => e('div', { key: p.t, className: 'ov-prob' },
                e('div', { className: 'tag' }, e(Icon, { name: 'alert', size: 13 }), 'Dolor actual'),
                e('div', { style: { fontSize: 13.5, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 5 } }, p.t),
                e('p', null, p.d))))),
          e('div', { className: 'section-label' },
            e('span', { className: 'mono-label' }, 'Tres direcciones — pruébalas en las pestañas de arriba'),
            e('span', { className: 'ln' })),
          e('div', { className: 'ov-grid' },
            cards.map((cd) => e('div', { key: cd.id, className: 'ov-card', onClick: () => go(cd.id) },
              e('div', { className: 'mini' }, cd.mini),
              e('div', { className: 'tag' }, cd.tag),
              e('h3', null, cd.title),
              e('p', null, cd.body),
              e('div', { className: 'pts' },
                cd.pts.map((pt) => e('div', { key: pt }, e(Icon, { name: 'check', size: 14, style: { color: 'var(--ok-fg)', flexShrink: 0 } }), pt))),
              e('div', { className: 'open' }, 'Abrir propuesta', e(Icon, { name: 'chevronRight', size: 15 }))))),
          e('div', { className: 'section-label', style: { marginTop: 26 } },
            e('span', { className: 'mono-label' }, 'Las tres comparten'),
            e('span', { className: 'ln' })),
          e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 } },
            [
              { i: 'userCheck', t: 'Búsqueda que desambigua', d: 'Cada resultado muestra edad, fecha de nacimiento, teléfono y última visita. Avisa cuando hay homónimos.' },
              { i: 'grid', t: 'Horarios visuales', d: 'Tiras de días y rejillas de horario con los huecos ocupados marcados — se elige, no se teclea.' },
              { i: 'userPlus', t: 'Crear sin salir', d: '“Crear paciente” aparece dentro del mismo flujo, partiendo de lo que ya escribiste.' },
            ].map((x) => e('div', { key: x.t, className: 'ov-prob', style: { background: 'var(--surface-card)' } },
              e('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
                e('span', { style: { width: 28, height: 28, borderRadius: 8, background: 'var(--info-bg)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, e(Icon, { name: x.i, size: 15 })),
                e('span', { style: { fontSize: 13.5, fontWeight: 700 } }, x.t)),
              e('p', null, x.d)))))));
  }

  function App() {
    const [tab, setTab] = useState('overview');
    const cap = (TABS.find((t) => t.id === tab) || {}).cap || '';
    let view;
    if (tab === 'overview') view = e(Overview, { go: setTab });
    else if (tab === 'A') view = e(window.ProposalA);
    else if (tab === 'B') view = e(window.ProposalB);
    else if (tab === 'C') view = e(window.ProposalC);

    return e(window.FormProvider, null,
      e('div', { className: 'switcher' },
        e('div', { className: 'sw-brand' }, e('span', { className: 'dot' }), 'Clineo · Paciente + Cita'),
        e('div', { className: 'sw-tabs' },
          TABS.map((t) => e('button', { key: t.id, className: 'sw-tab' + (tab === t.id ? ' active' : ''), onClick: () => setTab(t.id) }, t.label))),
        e('div', { className: 'sw-cap' }, cap)),
      e('div', { key: tab }, view),
      e(window.ToastHost));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(e(App));
})();
