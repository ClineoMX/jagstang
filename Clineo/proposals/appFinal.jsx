/* Finalized app: chosen direction = Propuesta A "Continuo" + Constructor.
   Drops the exploration framing (overview + B/C); two destinations only. */
const { createElement: m, useState: mS } = React;
const FIcon = window.Icon;

const NAV = [
  { id: 'editor', label: 'Editor de notas', cap: 'Continuo · un scroll · índice lateral fijo' },
  { id: 'builder', label: 'Constructor', cap: 'Concepto · crear tipos de nota' },
];

function App() {
  const [tab, setTab] = mS('editor');
  const [mode, setMode] = mS('form');
  const cap = (NAV.find((p) => p.id === tab) || {}).cap || '';

  const view = tab === 'editor'
    ? m(window.ProposalA, { mode, setMode })
    : m(window.Builder);

  return m(window.FormProvider, null,
    m('div', { className: 'switcher' },
      m('div', { className: 'sw-brand' }, m('span', { className: 'dot' }), 'Clineo · Editor de notas'),
      m('div', { className: 'sw-tabs' },
        NAV.map((p) => m('button', {
          key: p.id,
          className: 'sw-tab' + (tab === p.id ? ' active' : ''),
          onClick: () => setTab(p.id),
        },
          p.id === 'builder' && m(FIcon, { name: 'layers', size: 14, style: { marginRight: 2 } }),
          p.label))),
      m('div', { className: 'sw-cap' }, cap)),
    view);
}

ReactDOM.createRoot(document.getElementById('root')).render(m(App));
