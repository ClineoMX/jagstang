/* Proposal A — "Continuo": one scroll, sticky section index with completion dots.
   Closest to the current layout; lowest retraining cost. */
const { createElement: a, useState: aS, useRef: aR, useEffect: aE } = React;
const AIcon = window.Icon;

window.ProposalA = function ProposalA({ mode, setMode }) {
  const schema = window.EVOLUTION_SCHEMA;
  const { values } = window.useForm();
  const [active, setActive] = aS(schema.sections[0].id);
  const refs = aR({});

  aE(() => {
    if (mode !== 'form') return;
    const onScroll = () => {
      let cur = schema.sections[0].id;
      for (const s of schema.sections) {
        const el = refs.current[s.id];
        if (el && el.getBoundingClientRect().top < 180) cur = s.id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode]);

  const jump = (id) => {
    const el = refs.current[id];
    if (!el) return;
    const y = window.pageYOffset + el.getBoundingClientRect().top - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActive(id);
  };

  const body = a('div', { className: 'pa-body' },
    a('div', { className: 'pa-index' },
      schema.sections.map((s) => {
        const st = window.completion.section(s, values);
        return a('button', { key: s.id, className: 'pa-idx-item' + (active === s.id ? ' active' : ''), onClick: () => jump(s.id) },
          a(window.CompletionDot, { state: st }),
          a('span', null, s.title));
      })),
    a('div', { className: 'pa-sections' },
      schema.sections.map((s, i) => {
        const st = window.completion.section(s, values);
        const filled = s.fields.filter((f) => window.completion.fieldFilled(f, values)).length;
        return a('div', { key: s.id, className: 'pa-section', ref: (el) => { refs.current[s.id] = el; } },
          a('div', { className: 'pa-sec-bar' },
            a('span', { className: 'sec-num' }, String(i + 1).padStart(2, '0')),
            a('span', { className: 'sec-title' }, s.title),
            a(window.CompletionDot, { state: st }),
            a('span', { className: 'sec-count', style: { marginLeft: 'auto' } }, filled + '/' + s.fields.length)),
          s.hint && a('div', { style: { fontSize: 12.5, color: 'var(--text-muted)', margin: '-8px 0 16px' } }, s.hint),
          s.fields.map((f) => a(window.FieldRenderer, { key: f.id, field: f })));
      })),
  );

  const footer = a('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 22px', borderTop: '1px solid var(--line-light)', background: 'var(--surface-raised)' } },
    a('div', { style: { display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-label)' } },
      a('span', null, a('span', { className: 'kbd' }, 'Cmd'), ' + ', a('span', { className: 'kbd' }, 'S'), ' guarda'),
      a('span', null, a('span', { className: 'kbd' }, 'Cmd'), ' + ', a('span', { className: 'kbd' }, '↵'), ' firma')),
    a('div', { style: { display: 'flex', gap: 8 } },
      a('button', { className: 'btn btn-ghost btn-sm' }, 'Cancelar'),
      a('button', { className: 'btn btn-primary btn-sm' }, 'Guardar borrador')));

  return a(window.AppFrame, { schema, primaryLabel: 'Guardar borrador', saveLabel: 'Guardado hace 4s' },
    a(window.EditorChrome, { mode, setMode, footer, noPadBody: true }, body));
};
