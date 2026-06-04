/* Proposal C — "Guiado": one section per step + review screen.
   Focus mode; ideal for tablet in-consult and reducing cognitive load. */
const { createElement: w, useState: wS } = React;
const WIcon = window.Icon;

window.ProposalC = function ProposalC({ mode, setMode, initialStep }) {
  const schema = window.EVOLUTION_SCHEMA;
  const { values } = window.useForm();
  const sections = schema.sections;
  const total = sections.length;
  const [step, setStep] = wS(initialStep != null ? initialStep : 0);
  const onReview = step >= total;
  const pct = Math.round((Math.min(step, total) / total) * 100);

  const go = (n) => setStep(Math.max(0, Math.min(total, n)));

  const stepsBar = w('div', { className: 'wiz-steps' },
    sections.map((s, i) => {
      const st = window.completion.section(s, values);
      const cls = i === step ? 'active' : (st === 'done' ? 'done' : '');
      return w('button', { key: s.id, type: 'button', className: 'wiz-step ' + cls, style: { cursor: 'pointer' }, onClick: () => go(i) },
        st === 'done' ? w(WIcon, { name: 'check', size: 13 }) : w(window.CompletionDot, { state: st }),
        s.title);
    }));

  let stage;
  if (!onReview) {
    const s = sections[step];
    stage = w('div', { className: 'wiz-stage fade-in', key: s.id },
      w('div', { className: 'wiz-eyebrow' }, 'Paso ' + (step + 1) + ' de ' + total),
      w('div', { className: 'wiz-q' }, s.title),
      s.hint && w('div', { className: 'wiz-sub' }, s.hint),
      s.fields.map((f) => w(window.FieldRenderer, { key: f.id, field: f })));
  } else {
    stage = w('div', { className: 'wiz-stage fade-in', style: { maxWidth: 720 } },
      w('div', { className: 'wiz-eyebrow' }, 'Revisión final'),
      w('div', { className: 'wiz-q' }, 'Revisa antes de firmar'),
      w('div', { className: 'wiz-sub' }, 'Verifica los datos. Puedes editar cualquier sección antes de firmar la nota.'),
      sections.map((s, i) => {
        const summary = window.sectionSummary(s, values);
        const st = window.completion.section(s, values);
        return w('div', { key: s.id, className: 'wiz-review-row' },
          w('div', { className: 'rv-label' },
            w('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, w(window.CompletionDot, { state: st }), s.title)),
          w('div', { style: { flex: 1, minWidth: 0 } },
            w('div', { className: 'rv-val' + (summary ? '' : ' empty') }, summary || 'Sin completar')),
          w('button', { className: 'btn btn-ghost btn-sm', onClick: () => go(i) }, w(WIcon, { name: 'edit', size: 13 }), 'Editar'));
      }));
  }

  const foot = w('div', { className: 'wiz-foot' },
    w('button', { className: 'btn btn-outline btn-sm', disabled: step === 0, onClick: () => go(step - 1) },
      w(WIcon, { name: 'chevronLeft', size: 15 }), 'Atrás'),
    w('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-label)' } },
      onReview ? 'Listo para firmar' : (step + 1) + ' / ' + total),
    onReview
      ? w('button', { className: 'btn btn-primary btn-sm' }, w(WIcon, { name: 'pen', size: 14 }), 'Firmar nota')
      : w('button', { className: 'btn btn-primary btn-sm', onClick: () => go(step + 1) },
          step === total - 1 ? 'Revisar' : 'Siguiente', w(WIcon, { name: 'chevronRight', size: 15 })));

  const body = w('div', null,
    w('div', { className: 'wiz-top' },
      w('div', { className: 'wiz-progress' }, w('div', { className: 'fill', style: { width: pct + '%' } })),
      stepsBar),
    stage, foot);

  return w(window.AppFrame, { schema, primaryLabel: 'Guardar borrador', saveLabel: 'Guardado hace 4s' },
    w(window.EditorChrome, { mode, setMode, noPadBody: true }, body));
};
