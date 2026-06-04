/* Proposal B — "Acordeón": collapsible sections with live summaries when closed.
   Compact, scannable; great on tablet. */
const { createElement: b, useState: bS } = React;
const BIcon = window.Icon;

function sectionSummary(section, values) {
  const parts = [];
  for (const f of section.fields) {
    const v = values[f.id];
    if (f.kind === 'richlite') { const t = window.completion.stripHtml(v); if (t) parts.push(t.slice(0, 60)); }
    else if (f.kind === 'symptoms' || f.kind === 'diagnoses') { if (Array.isArray(v) && v.length) parts.push(v.join(', ')); }
    else if (f.kind === 'vitals') {
      const vt = values.vitals || {};
      const bits = [];
      if (vt.bp_sys && vt.bp_dia) bits.push(vt.bp_sys + '/' + vt.bp_dia);
      if (vt.hr) bits.push('FC ' + vt.hr);
      if (vt.temp) bits.push(vt.temp + '°');
      if (bits.length) parts.push(bits.join(' · '));
    }
    else if (v) parts.push(String(v));
  }
  return parts.join(' — ');
}

window.ProposalB = function ProposalB({ mode, setMode, allOpen }) {
  const schema = window.EVOLUTION_SCHEMA;
  const { values } = window.useForm();
  const [open, setOpen] = bS(() => {
    if (allOpen === true) return Object.fromEntries(schema.sections.map((s) => [s.id, true]));
    if (allOpen === false) return {};
    return { [schema.sections[0].id]: true };
  });
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const track = b('div', { className: 'pb-track' },
    schema.sections.map((s) => {
      const st = window.completion.section(s, values);
      return b('button', { key: s.id, className: 'pb-pill' + (open[s.id] ? ' active' : ''), onClick: () => { setOpen((o) => ({ ...o, [s.id]: true })); setTimeout(() => { const el = document.getElementById('acc-' + s.id); if (el) window.scrollTo({ top: window.pageYOffset + el.getBoundingClientRect().top - 80, behavior: 'smooth' }); }, 40); } },
        b(window.CompletionDot, { state: st }),
        s.title);
    }));

  const body = b('div', null,
    schema.sections.map((s, i) => {
      const isOpen = !!open[s.id];
      const st = window.completion.section(s, values);
      const summary = sectionSummary(s, values);
      return b('div', { key: s.id, id: 'acc-' + s.id, className: 'acc' + (isOpen ? ' open' : '') },
        b('button', { type: 'button', className: 'acc-head', onClick: () => toggle(s.id), 'aria-expanded': isOpen },
          b('span', { className: 'sec-num' }, String(i + 1).padStart(2, '0')),
          b(window.CompletionDot, { state: st }),
          b('span', { className: 'sec-title' }, s.title),
          !isOpen && summary && b('span', { className: 'acc-summary' }, summary),
          b('span', { className: 'acc-chevron', style: { marginLeft: isOpen || !summary ? 'auto' : 16 } }, b(BIcon, { name: 'chevronDown', size: 17 }))),
        isOpen && b('div', { className: 'acc-body fade-in' },
          s.hint && b('div', { style: { fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 } }, s.hint),
          s.fields.map((f) => b(window.FieldRenderer, { key: f.id, field: f, compact: true }))));
    }));

  const footer = b('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 22px', borderTop: '1px solid var(--line-light)', background: 'var(--surface-raised)' } },
    b('button', { className: 'btn btn-ghost btn-sm', onClick: () => setOpen(Object.fromEntries(schema.sections.map((s) => [s.id, true]))) }, 'Expandir todo'),
    b('div', { style: { display: 'flex', gap: 8 } },
      b('button', { className: 'btn btn-ghost btn-sm' }, 'Cancelar'),
      b('button', { className: 'btn btn-primary btn-sm' }, 'Guardar borrador')));

  return b(window.AppFrame, { schema, primaryLabel: 'Guardar borrador', saveLabel: 'Guardado hace 4s' },
    b(window.EditorChrome, { mode, setMode, footer, noPadBody: true }, track, body));
};

Object.assign(window, { sectionSummary });
