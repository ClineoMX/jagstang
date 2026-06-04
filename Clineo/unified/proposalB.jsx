/* Proposal B — "Lienzo dividido": a wide composer split into two panes.
   Left = patient (search w/ rich cards OR new-patient tab). Right = a real
   month calendar + day timeline. Who and When are visible simultaneously. */
(function () {
  const { createElement: e, useState } = React;
  const Icon = window.Icon;
  const U = window.dateUtils;

  function Backdrop({ onOpen }) {
    return e('div', { className: 'stage' },
      e('div', { className: 'stage-head' },
        e('div', null,
          e('div', { className: 'mono-crumb' }, 'Agenda · Junio 2025'),
          e('h1', null, 'Agenda')),
        e('button', { className: 'btn btn-primary', onClick: onOpen }, e(Icon, { name: 'calendarPlus', size: 16 }), 'Nueva cita')),
      e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 20px', color: 'var(--text-faint)', textAlign: 'center', border: '1px dashed var(--line-strong)', borderRadius: 'var(--r-md)', background: 'var(--surface-card)' } },
        e(Icon, { name: 'columns', size: 30, style: { color: 'var(--paper-300)', marginBottom: 10 } }),
        e('div', { style: { fontSize: 13.5, maxWidth: 380, lineHeight: 1.6 } },
          'El compositor de dos paneles muestra al paciente y la disponibilidad lado a lado — eliges a quién y cuándo sin perder de vista ninguno.')));
  }

  window.ProposalB = function ProposalB() {
    const uf = window.useUF();
    const { st, patch, patchAppt, fire, reset, hasPatient, hasWhen, draftValid } = uf;
    const [open, setOpen] = useState(true);

    const openModal = () => { reset(); setOpen(true); };
    const tab = st.patientMode;

    const submit = () => {
      if (!hasPatient) { fire('Falta el paciente'); return; }
      if (!hasWhen) { fire('Falta elegir día y hora'); return; }
      const who = tab === 'new' ? (st.draft.first + ' ' + st.draft.last).trim() : U.fullName(uf.patient);
      fire((tab === 'new' ? 'Paciente y cita creados' : 'Cita agendada') + ' · ' + who);
      setOpen(false);
    };

    const lbl = (t) => e('span', { className: 'f-label' }, t);

    return e('div', { className: 'app' },
      e(window.AppRail, { active: 'agenda' }),
      e('div', { className: 'fade-in', style: { minWidth: 0 } }, e(Backdrop, { onOpen: openModal })),
      open && e('div', { className: 'bcomp-scrim', onMouseDown: (ev) => { if (ev.target === ev.currentTarget) setOpen(false); } },
        e('div', { className: 'bcomp' },
          e('div', { className: 'bcomp-head' },
            e('span', { className: 'np-head', style: { padding: 0, background: 'none', border: 'none' } },
              e('span', { className: 'ico', style: { background: 'var(--brand-600)' } }, e(Icon, { name: 'calendarPlus', size: 16 }))),
            e('div', { style: { flex: 1 } },
              e('div', { className: 'crumb' }, 'Agenda'),
              e('h2', null, 'Nueva cita')),
            e('button', { className: 'icon-btn', onClick: () => setOpen(false) }, e(Icon, { name: 'x', size: 18 }))),

          e('div', { className: 'bcomp-cols' },
            /* ── LEFT · paciente ── */
            e('div', { className: 'bcol left' },
              e('div', { className: 'bcol-title' },
                e('span', { className: 'step' + (hasPatient ? ' ok' : '') }, hasPatient ? e(Icon, { name: 'check', size: 13 }) : '1'),
                'Paciente'),
              e('div', { className: 'tabs' },
                e('button', { className: tab === 'search' ? 'on' : '', onClick: () => patch({ patientMode: 'search' }) }, e(Icon, { name: 'search', size: 14 }), 'Buscar existente'),
                e('button', { className: tab === 'new' ? 'on' : '', onClick: () => patch({ patientMode: 'new' }) }, e(Icon, { name: 'userPlus', size: 14 }), 'Nuevo paciente')),
              tab === 'search'
                ? (uf.patient
                    ? e(window.SelectedPatient, { onClear: () => patch({ selectedId: null }) })
                    : e(window.PatientSearch, { onCreate: (d) => patch({ patientMode: 'new', draft: { ...st.draft, ...d } }) }))
                : e('div', null,
                    e('div', { className: 'callout', style: { marginBottom: 14 } },
                      e(Icon, { name: 'info', size: 15 }),
                      e('span', null, 'Captura lo esencial ahora; podrás completar el expediente más tarde.')),
                    e(window.NewPatientForm))),

            /* ── RIGHT · cuándo ── */
            e('div', { className: 'bcol' },
              e('div', { className: 'bcol-title' },
                e('span', { className: 'step' + (hasWhen ? ' ok' : ' wait') }, hasWhen ? e(Icon, { name: 'check', size: 13 }) : '2'),
                'Fecha y hora'),
              e('div', null, lbl('Duración'), e(window.DurationPicker)),
              e(window.MiniCalendar),
              e(window.DayTimeline),
              e('div', null, lbl('Motivo'),
                e('select', { className: 'inp', value: st.appt.reason, onChange: (ev) => patchAppt({ reason: ev.target.value }) },
                  window.APPT_REASONS.map((r) => e('option', { key: r, value: r }, r)))))),

          e('div', { className: 'bcomp-foot' },
            e('div', { className: 'bcomp-summary' },
              e('span', { className: 'row gap8' }, e(Icon, { name: 'user', size: 15, style: { color: 'var(--text-label)' } }),
                hasPatient ? e('b', null, tab === 'new' ? (st.draft.first + ' ' + st.draft.last).trim() : U.fullName(uf.patient)) : 'Sin paciente'),
              e('span', { className: 'dot-sep', style: { width: 4, height: 4, borderRadius: '50%', background: 'var(--paper-300)' } }),
              e('span', { className: 'row gap8' }, e(Icon, { name: 'clock', size: 15, style: { color: 'var(--text-label)' } }),
                window.summaryWhen(st.appt) || 'Sin horario')),
            e('div', { className: 'row gap8' },
              e('button', { className: 'btn btn-outline btn-sm', onClick: () => setOpen(false) }, 'Cancelar'),
              e('button', { className: 'btn btn-primary btn-sm', onClick: submit },
                e(Icon, { name: 'check', size: 15 }), tab === 'new' ? 'Crear y agendar' : 'Agendar cita'))))));
  };
})();
