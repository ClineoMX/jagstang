/* Proposal C — "Guiado": a focused, one-question-per-screen wizard.
   ¿Quién? → ¿Cuándo? → Confirmar. Command-bar search/create, smart slot
   suggestions, and a review screen before confirming. Best in-consult / tablet. */
(function () {
  const { createElement: e, useState, useMemo } = React;
  const Icon = window.Icon;
  const U = window.dateUtils;

  // first free slot of `date` that fits `dur`, optionally after `afterMin`
  function firstFree(date, dur, afterMin) {
    const slots = window.slotsForDay(date);
    const need = dur / window.CLINIC.step;
    for (let i = 0; i < slots.length; i++) {
      if (afterMin != null && slots[i].min < afterMin) continue;
      let ok = true;
      for (let k = 0; k < need; k++) { const s = slots[i + k]; if (!s || s.busy) { ok = false; break; } }
      if (ok) return slots[i].min;
    }
    return null;
  }

  function Backdrop({ onOpen }) {
    return e('div', { className: 'stage' },
      e('div', { className: 'stage-head' },
        e('div', null,
          e('div', { className: 'mono-crumb' }, 'Agenda · Modo guiado'),
          e('h1', null, 'Agenda')),
        e('button', { className: 'btn btn-primary', onClick: onOpen }, e(Icon, { name: 'sparkles', size: 16 }), 'Nueva cita guiada')),
      e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 20px', color: 'var(--text-faint)', textAlign: 'center', border: '1px dashed var(--line-strong)', borderRadius: 'var(--r-md)', background: 'var(--surface-card)' } },
        e(Icon, { name: 'stethoscope', size: 30, style: { color: 'var(--paper-300)', marginBottom: 10 } }),
        e('div', { style: { fontSize: 13.5, maxWidth: 380, lineHeight: 1.6 } },
          'Un paso a la vez: quién, cuándo, y confirmar. Pensado para usar durante la consulta o en tablet, con sugerencias inteligentes de horario.')));
  }

  const STEPS = [{ n: 1, label: '¿Quién?' }, { n: 2, label: '¿Cuándo?' }, { n: 3, label: 'Confirmar' }];

  window.ProposalC = function ProposalC() {
    const uf = window.useUF();
    const { st, patch, patchAppt, fire, reset, hasPatient, hasWhen } = uf;
    const [open, setOpen] = useState(true);
    const [step, setStep] = useState(0);

    const openWiz = () => { reset(); setStep(0); setOpen(true); };

    const suggestions = useMemo(() => {
      const dur = st.appt.durationMin;
      const out = [];
      const t0 = firstFree(window.NOW, dur, window.NOW.getHours() * 60 + window.NOW.getMinutes());
      if (t0 != null) out.push({ label: 'Hoy', dateISO: U.iso(window.NOW), min: t0, tag: 'Próximo hueco' });
      const d1 = U.addDays(window.NOW, 1);
      const t1 = firstFree(d1, dur);
      if (t1 != null) out.push({ label: 'Mañana', dateISO: U.iso(d1), min: t1, tag: 'Primera hora' });
      // afternoon today
      const tA = firstFree(window.NOW, dur, 15 * 60);
      if (tA != null && tA !== t0) out.push({ label: 'Hoy p.m.', dateISO: U.iso(window.NOW), min: tA, tag: 'Por la tarde' });
      const d3 = U.addDays(window.NOW, 3);
      const t3 = firstFree(d3, dur);
      if (t3 != null) out.push({ label: U.dayLabel(d3) + ' ' + d3.getDate(), dateISO: U.iso(d3), min: t3, tag: 'Más opciones' });
      return out;
    }, [st.appt.durationMin]);

    const confirm = () => {
      const who = st.patientMode === 'new' ? (st.draft.first + ' ' + st.draft.last).trim() : U.fullName(uf.patient);
      fire((st.patientMode === 'new' ? 'Paciente y cita creados' : 'Cita agendada') + ' · ' + who);
      setOpen(false);
    };

    const canNext = step === 0 ? hasPatient : step === 1 ? hasWhen : true;

    const stages = [
      // ── step 1 · who ──
      e('div', { key: 'who', className: 'fade-in' },
        e('div', { className: 'wiz-eyebrow' }, 'Paso 1 de 3'),
        e('h2', { className: 'wiz-q' }, '¿Para quién es la cita?'),
        e('p', { className: 'wiz-sub' }, 'Busca un paciente existente o créalo aquí mismo.'),
        uf.patient
          ? e('div', { className: 'field-stack' },
              e(window.SelectedPatient, { onClear: () => patch({ selectedId: null }) }),
              e('button', { className: 'btn btn-ghost btn-sm', style: { alignSelf: 'flex-start' }, onClick: () => patch({ selectedId: null }) },
                e(Icon, { name: 'search', size: 14 }), 'Buscar otro'))
          : st.patientMode === 'new'
            ? e('div', { className: 'field-stack' },
                e('div', { className: 'np-head', style: { borderRadius: 'var(--r-base)', border: '1px solid var(--line-light)' } },
                  e('span', { className: 'ico' }, e(Icon, { name: 'userPlus', size: 16 })),
                  e('div', { style: { flex: 1 } }, e('h4', null, 'Nuevo paciente'), e('p', null, 'Se guardará al confirmar la cita.')),
                  e('button', { className: 'btn btn-ghost btn-sm', onClick: () => patch({ patientMode: 'search' }) }, e(Icon, { name: 'search', size: 14 }), 'Buscar')),
                e(window.NewPatientForm))
            : e(window.PatientSearch, { autoFocus: true, onCreate: (d) => patch({ patientMode: 'new', draft: { ...st.draft, ...d } }) })),

      // ── step 2 · when ──
      e('div', { key: 'when', className: 'fade-in' },
        e('div', { className: 'wiz-eyebrow' }, 'Paso 2 de 3'),
        e('h2', { className: 'wiz-q' }, '¿Cuándo lo atiendes?'),
        e('p', { className: 'wiz-sub' }, 'Toma una sugerencia o elige un horario libre en la agenda.'),
        e('div', { style: { marginBottom: 16 } },
          e('span', { className: 'f-label' }, 'Duración'),
          e(window.DurationPicker)),
        e('div', { style: { marginBottom: 18 } },
          e('span', { className: 'f-label' }, e(Icon, { name: 'sparkles', size: 13 }), 'Sugerencias'),
          e('div', { className: 'sugg' },
            suggestions.map((s, i) => {
              const on = st.appt.dateISO === s.dateISO && st.appt.timeMin === s.min;
              return e('button', { key: i, className: on ? 'on' : '', onClick: () => patchAppt({ dateISO: s.dateISO, timeMin: s.min }) },
                e('span', null, s.label), e('span', { className: 't' }, U.fmt12(s.min)));
            }))),
        e('span', { className: 'f-label' }, 'O elige en la agenda'),
        e(window.SlotPicker, { days: 8 })),

      // ── step 3 · confirm ──
      e('div', { key: 'rev', className: 'fade-in' },
        e('div', { className: 'wiz-eyebrow' }, 'Paso 3 de 3'),
        e('h2', { className: 'wiz-q' }, 'Confirma la cita'),
        e('p', { className: 'wiz-sub' }, 'Revisa los datos antes de guardar.'),
        e('div', { className: 'rev' },
          e('div', { className: 'rev-row' },
            e('span', { className: 'ico' }, e(Icon, { name: st.patientMode === 'new' ? 'userPlus' : 'user', size: 17 })),
            e('div', null,
              e('div', { className: 'lbl' }, st.patientMode === 'new' ? 'Paciente nuevo' : 'Paciente'),
              e('div', { className: 'val' + (hasPatient ? '' : ' empty') },
                hasPatient ? (st.patientMode === 'new' ? [st.draft.first, st.draft.last, st.draft.mat].join(' ').trim() + ' · ' + st.draft.cc + ' ' + st.draft.phone : U.fullName(uf.patient) + ' · ' + uf.patient.phone) : 'Sin definir')),
            e('button', { className: 'icon-btn edit', onClick: () => setStep(0) }, e(Icon, { name: 'edit', size: 15 }))),
          e('div', { className: 'rev-row' },
            e('span', { className: 'ico' }, e(Icon, { name: 'calendar', size: 17 })),
            e('div', null,
              e('div', { className: 'lbl' }, 'Fecha y hora'),
              e('div', { className: 'val' + (hasWhen ? '' : ' empty') }, window.summaryWhen(st.appt) || 'Sin definir')),
            e('button', { className: 'icon-btn edit', onClick: () => setStep(1) }, e(Icon, { name: 'edit', size: 15 }))),
          e('div', { className: 'rev-row' },
            e('span', { className: 'ico' }, e(Icon, { name: 'clock', size: 17 })),
            e('div', null,
              e('div', { className: 'lbl' }, 'Duración y motivo'),
              e('div', { className: 'val' }, (window.DURATIONS.find((d) => d.value === st.appt.durationMin) || {}).label + ' · ' + st.appt.reason)),
            e('button', { className: 'icon-btn edit', onClick: () => setStep(1) }, e(Icon, { name: 'edit', size: 15 }))))),
    ];

    return e('div', { className: 'app' },
      e(window.AppRail, { active: 'agenda' }),
      e('div', { className: 'fade-in', style: { minWidth: 0 } }, e(Backdrop, { onOpen: openWiz })),
      open && e('div', { className: 'wiz-scrim', onMouseDown: (ev) => { if (ev.target === ev.currentTarget) setOpen(false); } },
        e('div', { className: 'wiz' },
          e('div', { className: 'wiz-top' },
            e('div', { className: 'wiz-rail' },
              STEPS.map((s, i) => [
                e('div', { key: 'n' + i, className: 'wiz-node' + (step === i ? ' active' : '') + (step > i ? ' done' : '') },
                  e('span', { className: 'bub' }, step > i ? e(Icon, { name: 'check', size: 14 }) : s.n),
                  e('span', { className: 'lbl' }, s.label)),
                i < STEPS.length - 1 && e('span', { key: 'l' + i, className: 'wiz-line' + (step > i ? ' done' : '') }),
              ]))),
          e('div', { className: 'wiz-stage' }, stages[step]),
          e('div', { className: 'wiz-foot' },
            step === 0
              ? e('button', { className: 'btn btn-ghost btn-sm', onClick: () => setOpen(false) }, 'Cancelar')
              : e('button', { className: 'btn btn-outline btn-sm', onClick: () => setStep(step - 1) }, e(Icon, { name: 'arrowLeft', size: 15 }), 'Atrás'),
            step < 2
              ? e('button', { className: 'btn btn-primary btn-sm', disabled: !canNext, onClick: () => canNext && setStep(step + 1) }, 'Continuar', e(Icon, { name: 'arrowRight', size: 15 }))
              : e('button', { className: 'btn btn-primary btn-sm', onClick: confirm }, e(Icon, { name: 'check', size: 15 }), st.patientMode === 'new' ? 'Crear y agendar' : 'Confirmar cita')))));
  };
})();
