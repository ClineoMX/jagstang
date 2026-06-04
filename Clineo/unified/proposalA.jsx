/* Proposal A — "Continuo": one right-side drawer, lowest retraining cost.
   Patient (search → disambiguate → or create inline) then the visual slot
   picker, all in a single scroll. Closest to today's drawer pattern. */
(function () {
  const { createElement: e, useState } = React;
  const Icon = window.Icon;
  const U = window.dateUtils;

  function Backdrop({ entry, setEntry, onOpen }) {
    return e('div', { className: 'stage' },
      e('div', { className: 'stage-head' },
        e('div', null,
          e('div', { className: 'mono-crumb' }, entry === 'agenda' ? 'Agenda · Lunes 9 jun' : 'Pacientes · 248 registrados'),
          e('h1', null, entry === 'agenda' ? 'Agenda del día' : 'Pacientes')),
        e('div', { className: 'row gap8' },
          e('div', { className: 'tabs', style: { marginRight: 4 } },
            e('button', { className: entry === 'agenda' ? 'on' : '', onClick: () => setEntry('agenda') }, e(Icon, { name: 'calendar', size: 14 }), 'Desde Agenda'),
            e('button', { className: entry === 'patients' ? 'on' : '', onClick: () => setEntry('patients') }, e(Icon, { name: 'users', size: 14 }), 'Desde Pacientes')),
          e('button', { className: 'btn btn-primary', onClick: onOpen },
            e(Icon, { name: 'plus', size: 16 }), entry === 'agenda' ? 'Nueva cita' : 'Nuevo paciente'))),
      e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 20px', color: 'var(--text-faint)', textAlign: 'center', border: '1px dashed var(--line-strong)', borderRadius: 'var(--r-md)', background: 'var(--surface-card)' } },
        e(Icon, { name: entry === 'agenda' ? 'calendar' : 'users', size: 30, style: { color: 'var(--paper-300)', marginBottom: 10 } }),
        e('div', { style: { fontSize: 13.5, maxWidth: 360, lineHeight: 1.6 } },
          'Abre el formulario para registrar paciente y cita en un mismo flujo. ',
          'Un solo botón, sea cual sea tu punto de partida.')));
  }

  window.ProposalA = function ProposalA() {
    const uf = window.useUF();
    const { st, patch, patchAppt, fire, reset, hasPatient, hasWhen } = uf;
    const [open, setOpen] = useState(true);
    const [entry, setEntry] = useState('agenda');

    const openDrawer = () => {
      reset();
      // entry from Agenda pre-selects today; from Pacientes opens in "new patient"
      if (entry === 'agenda') patchAppt({ dateISO: U.iso(window.NOW) });
      if (entry === 'patients') patch({ patientMode: 'new' });
      setOpen(true);
    };

    const submit = () => {
      if (!hasPatient) { fire('Falta el paciente'); return; }
      if (!hasWhen) { fire('Falta elegir día y hora'); return; }
      const who = st.patientMode === 'new' ? (st.draft.first + ' ' + st.draft.last) : U.fullName(uf.patient);
      fire((st.patientMode === 'new' ? 'Paciente y cita creados' : 'Cita agendada') + ' · ' + who.trim());
      setOpen(false);
    };

    const lbl = (t, req) => e('span', { className: 'f-label' }, t, req && e('span', { className: 'req' }, '*'));

    return e('div', { className: 'app' },
      e(window.AppRail, { active: entry === 'agenda' ? 'agenda' : 'patients' }),
      e('div', { className: 'fade-in', style: { minWidth: 0 } }, e(Backdrop, { entry, setEntry, onOpen: openDrawer })),
      open && e('div', { className: 'drawer-scrim', onMouseDown: (ev) => { if (ev.target === ev.currentTarget) setOpen(false); } },
        e('div', { className: 'drawer' },
          e('div', { className: 'drawer-head' },
            e('div', { className: 'crumb' }, 'Agenda · Nueva cita'),
            e('h2', null, 'Agendar cita'),
            e('p', null, 'Encuentra o crea al paciente y elige un horario disponible.'),
            e('button', { className: 'icon-btn drawer-x', onClick: () => setOpen(false) }, e(Icon, { name: 'x', size: 18 }))),

          e('div', { className: 'drawer-body' },
            /* ── Section 1 · Paciente ── */
            e('div', null,
              e('div', { className: 'fsec', style: { marginBottom: 14 } },
                e('span', { className: 'num' }, '1'),
                e('h3', null, 'Paciente'),
                e('span', { className: 'fsec-line' })),
              uf.patient
                ? e(window.SelectedPatient, { onClear: () => patch({ selectedId: null }) })
                : st.patientMode === 'new'
                  ? e('div', { className: 'np-panel' },
                      e('div', { className: 'np-head' },
                        e('span', { className: 'ico' }, e(Icon, { name: 'userPlus', size: 16 })),
                        e('div', { style: { flex: 1 } },
                          e('h4', null, 'Nuevo paciente'),
                          e('p', null, 'Se guardará en tu lista al agendar.')),
                        e('button', { className: 'btn btn-ghost btn-sm', onClick: () => patch({ patientMode: 'search' }) },
                          e(Icon, { name: 'search', size: 14 }), 'Buscar existente')),
                      e('div', { className: 'np-body' }, e(window.NewPatientForm)))
                  : e(window.PatientSearch, { autoFocus: true, onCreate: (d) => patch({ patientMode: 'new', draft: { ...st.draft, ...d } }) })),

            /* ── Section 2 · Cuándo ── */
            e('div', null,
              e('div', { className: 'fsec', style: { marginBottom: 14 } },
                e('span', { className: 'num' }, '2'),
                e('h3', null, 'Fecha y hora'),
                e('span', { className: 'fsec-line' })),
              e('div', { style: { marginBottom: 14 } },
                lbl('Duración'),
                e(window.DurationPicker)),
              e(window.SlotPicker, { days: 8 })),

            /* ── Section 3 · Motivo ── */
            e('div', null,
              lbl('Motivo de la consulta'),
              e('select', { className: 'inp', value: st.appt.reason, onChange: (ev) => patchAppt({ reason: ev.target.value }) },
                window.APPT_REASONS.map((r) => e('option', { key: r, value: r }, r))))),

          e('div', { className: 'drawer-foot' },
            e('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-label)' } },
              window.summaryWhen(st.appt) || 'Sin horario'),
            e('div', { className: 'row gap8' },
              e('button', { className: 'btn btn-ghost btn-sm', onClick: () => setOpen(false) }, 'Cancelar'),
              e('button', { className: 'btn btn-primary btn-sm', onClick: submit },
                e(Icon, { name: 'check', size: 15 }),
                st.patientMode === 'new' ? 'Crear y agendar' : 'Agendar cita'))))));
  };
})();
