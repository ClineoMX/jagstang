/* Converged direction — "Lienzo dividido" inside a wide right-side DRAWER
   (the project's standard chrome) instead of a centered modal.
   Reuses every shared primitive; only the shell changes. */
(function () {
  const { createElement: e, useState } = React;
  const Icon = window.Icon;
  const U = window.dateUtils;

  function Backdrop({ entry, setEntry, onOpen }) {
    return e('div', { className: 'stage' },
      e('div', { className: 'stage-head' },
        e('div', null,
          e('div', { className: 'mono-crumb' }, entry === 'agenda' ? 'Agenda · Lunes 9 jun 2025' : 'Pacientes · 248 registrados'),
          e('h1', null, entry === 'agenda' ? 'Agenda del día' : 'Pacientes')),
        e('div', { className: 'row gap8' },
          e('div', { className: 'tabs', style: { marginRight: 4 } },
            e('button', { className: entry === 'agenda' ? 'on' : '', onClick: () => setEntry('agenda') }, e(Icon, { name: 'calendar', size: 14 }), 'Desde Agenda'),
            e('button', { className: entry === 'patients' ? 'on' : '', onClick: () => setEntry('patients') }, e(Icon, { name: 'users', size: 14 }), 'Desde Pacientes')),
          e('button', { className: 'btn btn-primary', onClick: onOpen },
            e(Icon, { name: entry === 'agenda' ? 'calendarPlus' : 'userPlus', size: 16 }),
            entry === 'agenda' ? 'Nueva cita' : 'Nuevo paciente'))),
      e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 20px', color: 'var(--text-faint)', textAlign: 'center', border: '1px dashed var(--line-strong)', borderRadius: 'var(--r-md)', background: 'var(--surface-card)' } },
        e(Icon, { name: 'columns', size: 30, style: { color: 'var(--paper-300)', marginBottom: 10 } }),
        e('div', { style: { fontSize: 13.5, maxWidth: 400, lineHeight: 1.6 } },
          'El cajón se abre desde el borde derecho — igual que el resto del producto — pero más amplio, con paciente y agenda en dos columnas lado a lado.')));
  }

  function DrawerSplit() {
    const uf = window.useUF();
    const { st, patch, patchAppt, fire, reset, hasPatient, hasWhen } = uf;
    const [open, setOpen] = useState(true);
    const [entry, setEntry] = useState('agenda');
    const tab = st.patientMode;

    const openDrawer = () => {
      reset();
      if (entry === 'agenda') patchAppt({ dateISO: U.iso(window.NOW) });
      if (entry === 'patients') patch({ patientMode: 'new' });
      setOpen(true);
    };

    const submit = () => {
      if (!hasPatient) { fire('Falta el paciente'); return; }
      if (!hasWhen) { fire('Falta elegir día y hora'); return; }
      const who = tab === 'new' ? (st.draft.first + ' ' + st.draft.last).trim() : U.fullName(uf.patient);
      fire((tab === 'new' ? 'Paciente y cita creados' : 'Cita agendada') + ' · ' + who);
      setOpen(false);
    };

    const lbl = (t) => e('span', { className: 'f-label' }, t);

    return e('div', { className: 'app' },
      e(window.AppRail, { active: entry === 'agenda' ? 'agenda' : 'patients' }),
      e('div', { className: 'fade-in', style: { minWidth: 0 } }, e(Backdrop, { entry, setEntry, onOpen: openDrawer })),
      open && e('div', { className: 'drawer-scrim', onMouseDown: (ev) => { if (ev.target === ev.currentTarget) setOpen(false); } },
        e('div', { className: 'wdrawer' },
          e('div', { className: 'drawer-head' },
            e('div', { className: 'crumb' }, 'Agenda · Nueva cita'),
            e('h2', null, 'Registrar y agendar'),
            e('p', null, 'Elige o crea al paciente a la izquierda y resérvale un horario a la derecha.'),
            e('button', { className: 'icon-btn drawer-x', onClick: () => setOpen(false) }, e(Icon, { name: 'x', size: 18 }))),

          e('div', { className: 'wdrawer-cols' },
            /* ── LEFT · paciente ── */
            e('div', { className: 'wdrawer-col left' },
              e('div', { className: 'col-head' },
                e('span', { className: 'step' + (hasPatient ? ' ok' : '') }, hasPatient ? e(Icon, { name: 'check', size: 13 }) : '1'),
                e('h3', null, 'Paciente'),
                e('span', { className: 'sub' }, tab === 'new' ? 'nuevo' : 'existente')),
              e('div', { className: 'tabs' },
                e('button', { className: tab === 'search' ? 'on' : '', onClick: () => patch({ patientMode: 'search' }) }, e(Icon, { name: 'search', size: 14 }), 'Buscar existente'),
                e('button', { className: tab === 'new' ? 'on' : '', onClick: () => patch({ patientMode: 'new' }) }, e(Icon, { name: 'userPlus', size: 14 }), 'Nuevo paciente')),
              tab === 'search'
                ? (uf.patient
                    ? e(window.SelectedPatient, { onClear: () => patch({ selectedId: null }) })
                    : e(window.PatientSearch, { autoFocus: true, onCreate: (d) => patch({ patientMode: 'new', draft: { ...st.draft, ...d } }) }))
                : e('div', { className: 'field-stack' },
                    e('div', { className: 'callout' },
                      e(Icon, { name: 'info', size: 15 }),
                      e('span', null, 'Captura lo esencial ahora; el expediente completo puede llenarse después.')),
                    e(window.NewPatientForm))),

            /* ── RIGHT · cuándo ── */
            e('div', { className: 'wdrawer-col right' },
              e('div', { className: 'col-head' },
                e('span', { className: 'step' + (hasWhen ? ' ok' : ' wait') }, hasWhen ? e(Icon, { name: 'check', size: 13 }) : '2'),
                e('h3', null, 'Fecha y hora'),
                e('span', { className: 'sub' }, window.summaryWhen(st.appt) ? '' : 'pendiente')),
              e('div', null, lbl('Duración'), e(window.DurationPicker)),
              e('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
                e(window.MiniCalendar),
                e('div', { style: { border: '1px solid var(--line-light)', borderRadius: 'var(--r-md)', padding: '14px 16px', background: 'var(--surface-card)' } },
                  e(window.DayTimeline))),
              e('div', null, lbl('Motivo de la consulta'),
                e('select', { className: 'inp', value: st.appt.reason, onChange: (ev) => patchAppt({ reason: ev.target.value }) },
                  window.APPT_REASONS.map((r) => e('option', { key: r, value: r }, r)))))),

          e('div', { className: 'drawer-foot' },
            e('div', { className: 'bcomp-summary' },
              e('span', { className: 'row gap8' }, e(Icon, { name: 'user', size: 15, style: { color: 'var(--text-label)' } }),
                hasPatient ? e('b', null, tab === 'new' ? (st.draft.first + ' ' + st.draft.last).trim() : U.fullName(uf.patient)) : 'Sin paciente'),
              e('span', { style: { width: 4, height: 4, borderRadius: '50%', background: 'var(--paper-300)' } }),
              e('span', { className: 'row gap8' }, e(Icon, { name: 'clock', size: 15, style: { color: 'var(--text-label)' } }),
                window.summaryWhen(st.appt) || 'Sin horario')),
            e('div', { className: 'row gap8' },
              e('button', { className: 'btn btn-outline btn-sm', onClick: () => setOpen(false) }, 'Cancelar'),
              e('button', { className: 'btn btn-primary btn-sm', onClick: submit },
                e(Icon, { name: 'check', size: 15 }), tab === 'new' ? 'Crear y agendar' : 'Agendar cita'))))));
  }

  function Root() {
    return e(window.FormProvider, null, e(DrawerSplit), e(window.ToastHost));
  }
  ReactDOM.createRoot(document.getElementById('root')).render(e(Root));
})();
