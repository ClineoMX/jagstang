/* Shared state + reusable primitives for all three proposals.
   Exposes on window: FormProvider, useUF, AppRail, Toast host,
   PatientSearch, SelectedPatient, NewPatientForm, SlotPicker,
   MiniCalendar, DayTimeline, and a few small helpers. */
(function () {
  const { createElement: e, useState, useEffect, useRef, useContext, createContext, useMemo, useCallback } = React;
  const Icon = window.Icon;
  const U = window.dateUtils;

  /* ── form state ─────────────────────────────────────────────── */
  const Ctx = createContext(null);
  function freshDraft() { return { first: '', last: '', mat: '', cc: '+52', phone: '', sex: '', dob: '' }; }
  function freshState() {
    return {
      patientMode: 'search',        // 'search' | 'new'
      selectedId: null,
      draft: freshDraft(),
      appt: { dateISO: null, timeMin: null, durationMin: 30, reason: 'Seguimiento' },
    };
  }

  window.FormProvider = function FormProvider({ children }) {
    const [st, setSt] = useState(freshState);
    const [toast, setToast] = useState(null);
    const patch = useCallback((p) => setSt((s) => ({ ...s, ...p })), []);
    const patchAppt = useCallback((p) => setSt((s) => ({ ...s, appt: { ...s.appt, ...p } })), []);
    const patchDraft = useCallback((p) => setSt((s) => ({ ...s, draft: { ...s.draft, ...p } })), []);
    const reset = useCallback(() => setSt(freshState()), []);
    const fire = useCallback((msg) => {
      setToast({ msg, id: Date.now() });
      setTimeout(() => setToast(null), 2600);
    }, []);
    const patient = useMemo(() => {
      if (st.selectedId) return window.PATIENTS.find((p) => p.id === st.selectedId) || null;
      return null;
    }, [st.selectedId]);
    const draftValid = st.draft.first.trim() && st.draft.last.trim();
    const hasPatient = st.patientMode === 'new' ? !!draftValid : !!st.selectedId;
    const hasWhen = st.appt.dateISO && st.appt.timeMin != null;
    const value = { st, setSt, patch, patchAppt, patchDraft, reset, fire, toast, patient, hasPatient, hasWhen, draftValid };
    return e(Ctx.Provider, { value }, children);
  };
  window.useUF = function () { return useContext(Ctx); };

  /* ── small helpers ──────────────────────────────────────────── */
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function highlight(text, q) {
    if (!q) return text;
    const nt = norm(text), nq = norm(q);
    const i = nt.indexOf(nq);
    if (i < 0) return text;
    return [text.slice(0, i), e('mark', { key: 'm' }, text.slice(i, i + q.length)), text.slice(i + q.length)];
  }
  window.summaryWhen = function (appt) {
    if (!appt.dateISO || appt.timeMin == null) return null;
    const d = new Date(appt.dateISO + 'T00:00:00');
    const dl = U.dayLabel(d, { relative: true, long: true });
    const datePart = (dl === 'Hoy' || dl === 'Mañana') ? dl : dl + ' ' + d.getDate() + ' ' + U.MON[d.getMonth()];
    return datePart + ' · ' + U.fmt12(appt.timeMin);
  };

  /* ── app rail ───────────────────────────────────────────────── */
  window.AppRail = function ({ active }) {
    const items = [
      { icon: 'home', label: 'Inicio', id: 'home' },
      { icon: 'users', label: 'Pacientes', id: 'patients' },
      { icon: 'calendar', label: 'Agenda', id: 'agenda' },
      { icon: 'book', label: 'Biblioteca', id: 'library' },
      { icon: 'shield', label: 'NOM', id: 'nom' },
    ];
    return e('nav', { className: 'rail' },
      e('div', { className: 'rail-logo' }, e('img', { src: (window.__resources && window.__resources.railLogo) || 'assets/svg/clineo-icon.svg', alt: 'Clineo' })),
      items.map((it) => e('button', { key: it.id, className: 'rail-item' + (active === it.id ? ' active' : '') },
        e(Icon, { name: it.icon, size: 20, stroke: 1.75 }), e('span', null, it.label))),
      e('div', { className: 'rail-spacer' }),
      e('div', { className: 'rail-avatar' }, window.DOCTOR.initials));
  };

  /* ── toast host ─────────────────────────────────────────────── */
  window.ToastHost = function () {
    const { toast } = window.useUF();
    if (!toast) return null;
    return e('div', { className: 'toast', key: toast.id },
      e('span', { className: 'ico' }, e(Icon, { name: 'checkCircle', size: 18 })),
      toast.msg);
  };

  /* ── a single rich patient row (the disambiguation unit) ───────── */
  window.PatientRow = function ({ p, q, onClick, active }) {
    const female = p.sex === 'F';
    return e('button', { type: 'button', className: 'prow' + (active ? ' kbd-active' : ''), onClick },
      e('span', { className: 'prow-av' + (female ? ' f' : '') }, U.initials(p)),
      e('span', { className: 'prow-main' },
        e('span', { className: 'prow-name' }, highlight(U.fullName(p), q)),
        e('span', { className: 'prow-meta' },
          e(Icon, { name: 'cake', size: 12 }),
          e('span', null, U.ageFrom(p.dob) + ' a · ' + U.fmtDOB(p.dob)),
          e('span', { className: 'dot-sep' }),
          e(Icon, { name: 'phone', size: 11 }),
          e('span', null, p.phone.slice(-9)),
          e('span', { className: 'dot-sep' }),
          e('span', { className: 'visit' }, 'Últ. visita ' + U.relVisit(p.lastVisit)))),
      e('span', { className: 'prow-tag ' + (p.recurrent ? 'rec' : 'new') }, p.recurrent ? 'Recurrente' : 'Nuevo'));
  };

  /* ── patient search (rich, disambiguating, w/ inline create) ───── */
  window.PatientSearch = function ({ autoFocus, onCreate, placeholder }) {
    const { st, patch } = window.useUF();
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [kb, setKb] = useState(0);
    const wrap = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
      if (autoFocus && inputRef.current) inputRef.current.focus();
    }, [autoFocus]);
    useEffect(() => {
      const onDoc = (ev) => { if (wrap.current && !wrap.current.contains(ev.target)) setOpen(false); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const results = useMemo(() => {
      const nq = norm(q.trim());
      if (!nq) return window.PATIENTS.slice(0, 6);
      return window.PATIENTS.filter((p) => norm(U.fullName(p)).includes(nq) || p.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) && q.replace(/\D/g, '').length >= 3);
    }, [q]);

    // detect same-name collisions among results
    const hasDupes = useMemo(() => {
      const seen = {};
      for (const p of results) { const k = norm(p.first + p.last + p.mat); seen[k] = (seen[k] || 0) + 1; if (seen[k] > 1) return true; }
      // also: same first+last (different materno) counts as ambiguous
      const fl = {};
      for (const p of results) { const k = norm(p.first + p.last); fl[k] = (fl[k] || 0) + 1; if (fl[k] > 1) return true; }
      return false;
    }, [results]);

    const pick = (p) => { patch({ selectedId: p.id, patientMode: 'search' }); setOpen(false); setQ(''); };
    const create = () => {
      // parse the typed query into name parts as a head-start
      const parts = q.trim().split(/\s+/);
      const draft = { first: parts[0] || '', last: parts[1] || '', mat: parts.slice(2).join(' ') || '' };
      onCreate && onCreate(draft);
      setOpen(false); setQ('');
    };

    const onKey = (ev) => {
      if (!open) return;
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setKb((k) => Math.min(k + 1, results.length)); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); setKb((k) => Math.max(k - 1, 0)); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (kb < results.length) pick(results[kb]); else create();
      } else if (ev.key === 'Escape') setOpen(false);
    };

    return e('div', { className: 'psearch', ref: wrap },
      e('div', { className: 'psearch-input' },
        e(Icon, { name: 'search', size: 18 }),
        e('input', {
          ref: inputRef, value: q, placeholder: placeholder || 'Busca por nombre, apellido o teléfono…',
          onChange: (ev) => { setQ(ev.target.value); setOpen(true); setKb(0); },
          onFocus: () => setOpen(true), onKeyDown: onKey,
        })),
      open && e('div', { className: 'psearch-pop' },
        e('div', { className: 'psearch-hint' },
          e('span', null, q.trim() ? results.length + ' coincidencia' + (results.length === 1 ? '' : 's') : 'Pacientes recientes'),
          e('span', null, '↑↓ navegar · ↵ elegir')),
        hasDupes && e('div', { className: 'dupe-warn' },
          e(Icon, { name: 'alert', size: 15 }),
          e('span', null, 'Hay pacientes con el mismo nombre. Verifica la ', e('b', null, 'fecha de nacimiento'), ' y el ', e('b', null, 'teléfono'), ' antes de elegir.')),
        results.map((p, i) => e(window.PatientRow, { key: p.id, p, q, active: kb === i, onClick: () => pick(p) })),
        e('button', { type: 'button', className: 'prow create', onClick: create },
          e('span', { className: 'prow-av' }, e(Icon, { name: 'plus', size: 18 })),
          e('span', { className: 'prow-main' },
            e('span', { className: 'prow-name' }, q.trim() ? 'Crear paciente “' + q.trim() + '”' : 'Crear paciente nuevo'),
            e('span', { className: 'prow-meta' }, e('span', null, 'Registra los datos y agenda en el mismo paso'))),
          e(Icon, { name: 'arrowRight', size: 16, style: { color: 'var(--brand-600)' } }))));
  };

  /* ── selected-patient summary chip ─────────────────────────────── */
  window.SelectedPatient = function ({ onClear }) {
    const { patient } = window.useUF();
    if (!patient) return null;
    const p = patient, female = p.sex === 'F';
    return e('div', { className: 'pchip' },
      e('span', { className: 'prow-av' + (female ? ' f' : '') }, U.initials(p)),
      e('span', { className: 'prow-main' },
        e('span', { className: 'prow-name' }, U.fullName(p)),
        e('span', { className: 'prow-meta' },
          e('span', null, U.ageFrom(p.dob) + ' a · ' + U.fmtDOB(p.dob)),
          e('span', { className: 'dot-sep' }),
          e('span', null, p.phone),
          e('span', { className: 'dot-sep' }),
          e('span', null, p.blood),
          e('span', { className: 'dot-sep' }),
          e('span', { className: 'visit' }, p.insurer))),
      e('span', { className: 'prow-tag ' + (p.recurrent ? 'rec' : 'new') }, p.recurrent ? 'Recurrente' : 'Nuevo'),
      e('button', { className: 'icon-btn pchip-x btn btn-ghost btn-sm', style: { minHeight: 32, padding: '0 8px' }, onClick: onClear, title: 'Cambiar paciente' },
        e(Icon, { name: 'x', size: 16 })));
  };

  /* ── phone field ────────────────────────────────────────────── */
  const DIAL = [
    { cc: '+52', flag: '🇲🇽' }, { cc: '+1', flag: '🇺🇸' }, { cc: '+34', flag: '🇪🇸' },
    { cc: '+54', flag: '🇦🇷' }, { cc: '+57', flag: '🇨🇴' }, { cc: '+56', flag: '🇨🇱' },
  ];
  window.PhoneField = function ({ value, cc, onValue, onCc }) {
    return e('div', { className: 'phone-grp' },
      e('select', { className: 'inp', value: cc, onChange: (ev) => onCc(ev.target.value) },
        DIAL.map((d) => e('option', { key: d.cc, value: d.cc }, d.flag + ' ' + d.cc))),
      e('input', { className: 'inp', type: 'tel', value, placeholder: '55 1234 5678', onChange: (ev) => onValue(ev.target.value.replace(/[^\d\s]/g, '')) }));
  };

  /* ── new-patient form fields ───────────────────────────────────── */
  window.NewPatientForm = function ({ compact }) {
    const { st, patchDraft } = window.useUF();
    const d = st.draft;
    const lbl = (t, req) => e('span', { className: 'f-label' }, t, req && e('span', { className: 'req' }, '*'));
    return e('div', { className: 'field-stack' },
      e('div', null, lbl('Nombre(s)', true),
        e('input', { className: 'inp', value: d.first, placeholder: 'Ej. Juan Carlos', onChange: (ev) => patchDraft({ first: ev.target.value }) })),
      e('div', { className: 'field-row' },
        e('div', null, lbl('Apellido paterno', true),
          e('input', { className: 'inp', value: d.last, placeholder: 'Ej. Pérez', onChange: (ev) => patchDraft({ last: ev.target.value }) })),
        e('div', null, lbl('Apellido materno'),
          e('input', { className: 'inp', value: d.mat, placeholder: 'Ej. Hernández', onChange: (ev) => patchDraft({ mat: ev.target.value }) }))),
      e('div', { className: 'field-row' },
        e('div', null, lbl('Teléfono', true),
          e(window.PhoneField, { value: d.phone, cc: d.cc, onValue: (v) => patchDraft({ phone: v }), onCc: (v) => patchDraft({ cc: v }) })),
        e('div', null, lbl('Fecha de nacimiento'),
          e('input', { className: 'inp', type: 'date', value: d.dob, onChange: (ev) => patchDraft({ dob: ev.target.value }) }))),
      !compact && e('div', null, lbl('Sexo'),
        e('div', { className: 'seg' },
          [['F', 'Mujer'], ['M', 'Hombre'], ['O', 'Otro']].map(([v, t]) =>
            e('button', { key: v, type: 'button', className: d.sex === v ? 'on' : '', onClick: () => patchDraft({ sex: v }) }, t)))));
  };

  /* ── duration selector ─────────────────────────────────────────── */
  window.DurationPicker = function () {
    const { st, patchAppt } = window.useUF();
    return e('div', { className: 'sugg' },
      window.DURATIONS.map((dd) => e('button', { key: dd.value, type: 'button', className: st.appt.durationMin === dd.value ? 'on' : '', onClick: () => patchAppt({ durationMin: dd.value }) }, dd.label)));
  };

  /* ── slot picker (day strip + time grid) ───────────────────────── */
  window.SlotPicker = function ({ days = 8, showDuration }) {
    const { st, patchAppt } = window.useUF();
    const NOW = window.NOW;
    const dayList = useMemo(() => {
      const out = [];
      for (let i = 0; i < days; i++) {
        const d = U.addDays(NOW, i);
        if (d.getDay() === 0) continue; // skip Sundays (clinic closed)
        out.push(d);
      }
      return out;
    }, [days]);

    const selDate = st.appt.dateISO ? new Date(st.appt.dateISO + 'T00:00:00') : null;
    const activeDate = selDate || dayList[0];
    const slots = useMemo(() => window.slotsForDay(activeDate), [activeDate && U.iso(activeDate)]);
    const dur = st.appt.durationMin;

    // a slot is selectable only if the whole duration window is free
    const isFree = (slot) => {
      const need = dur / window.CLINIC.step;
      const idx = slots.indexOf(slot);
      for (let k = 0; k < need; k++) { const s = slots[idx + k]; if (!s || s.busy) return false; }
      return true;
    };

    return e('div', { className: 'slotpick' },
      e('div', { className: 'daystrip' },
        dayList.map((d) => {
          const di = U.iso(d);
          const free = window.slotsForDay(d).filter((s) => !s.busy).length;
          const on = activeDate && U.iso(activeDate) === di;
          return e('button', { key: di, type: 'button', className: 'daybtn' + (on ? ' on' : '') + (U.isToday(d) ? ' today' : ''),
            onClick: () => patchAppt({ dateISO: di, timeMin: null }) },
            e('span', { className: 'dow' }, U.dayLabel(d, { relative: true }) === 'Hoy' ? 'Hoy' : U.dayLabel(d)),
            e('span', { className: 'dnum' }, d.getDate()),
            e('span', { className: 'dfree' }, free + ' libres'));
        })),
      e('div', { className: 'slotgrid-wrap' },
        e('div', { className: 'slotgrid-head' },
          e('span', { className: 'ttl' }, 'Horarios · ' + U.dayLabel(activeDate, { long: true }) + ' ' + activeDate.getDate() + ' ' + U.MON[activeDate.getMonth()]),
          e('span', { className: 'leg' },
            e('span', null, e('i', { style: { background: 'var(--surface-card)', border: '1px solid var(--line-strong)' } }), 'Libre'),
            e('span', null, e('i', { style: { background: 'var(--surface-raised)', border: '1px dashed var(--line-strong)' } }), 'Ocupado'))),
        showDuration && e('div', { style: { marginBottom: 12 } },
          e('span', { className: 'f-label' }, 'Duración'),
          e(window.DurationPicker)),
        e('div', { className: 'slotgrid' },
          slots.map((s) => {
            const free = isFree(s);
            const on = st.appt.timeMin === s.min;
            return e('button', { key: s.min, type: 'button',
              className: 'slot' + (s.busy ? ' busy' : '') + (on ? ' on' : ''),
              disabled: s.busy || !free,
              title: s.busy ? 'Ocupado · ' + s.who : (free ? 'Disponible' : 'No cabe ' + dur + ' min aquí'),
              onClick: () => patchAppt({ dateISO: U.iso(activeDate), timeMin: s.min }) },
              s.label,
              s.busy && e('span', { className: 'who' }, s.who));
          }))));
  };

  /* ── mini month calendar ───────────────────────────────────────── */
  window.MiniCalendar = function () {
    const { st, patchAppt } = window.useUF();
    const NOW = window.NOW;
    const [view, setView] = useState(() => new Date(NOW.getFullYear(), NOW.getMonth(), 1));
    const sel = st.appt.dateISO;
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7; // make Monday first
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let dnum = 1; dnum <= daysInMonth; dnum++) cells.push(new Date(view.getFullYear(), view.getMonth(), dnum));

    const dow = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return e('div', { className: 'mcal' },
      e('div', { className: 'mcal-head' },
        e('span', { className: 'mon' }, U.MON_LONG[view.getMonth()] + ' ' + view.getFullYear()),
        e('div', { className: 'mcal-nav' },
          e('button', { onClick: () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1)) }, e(Icon, { name: 'chevronLeft', size: 16 })),
          e('button', { onClick: () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1)) }, e(Icon, { name: 'chevronRight', size: 16 })))),
      e('div', { className: 'mcal-grid' },
        dow.map((d, i) => e('span', { key: 'h' + i, className: 'mcal-dow' }, d)),
        cells.map((c, i) => {
          if (!c) return e('span', { key: 'e' + i });
          const ci = U.iso(c);
          const past = c < new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
          const closed = c.getDay() === 0;
          const muted = past || closed;
          const booked = (window.AGENDA[ci] || []).filter((b) => b.who !== 'Comida').length;
          return e('button', { key: ci, className: 'mcal-day' + (U.isToday(c) ? ' today' : '') + (sel === ci ? ' on' : '') + (muted ? ' muted' : ''),
            disabled: muted, onClick: () => patchAppt({ dateISO: ci, timeMin: null }) },
            c.getDate(),
            booked > 0 && e('span', { className: 'bk' }, Array.from({ length: Math.min(booked, 3) }).map((_, k) => e('i', { key: k }))));
        })));
  };

  /* ── day timeline (for two-pane composer) ──────────────────────── */
  window.DayTimeline = function () {
    const { st, patchAppt } = window.useUF();
    const dateISO = st.appt.dateISO;
    if (!dateISO) return e('div', { style: { padding: '30px 6px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 } },
      e(Icon, { name: 'calendar', size: 26, style: { color: 'var(--paper-300)', marginBottom: 8 } }),
      e('div', null, 'Elige un día en el calendario'));
    const date = new Date(dateISO + 'T00:00:00');
    const slots = window.slotsForDay(date);
    const dur = st.appt.durationMin;
    const isFree = (i) => {
      const need = dur / window.CLINIC.step;
      for (let k = 0; k < need; k++) { const s = slots[i + k]; if (!s || s.busy) return false; }
      return true;
    };
    // collapse consecutive busy slots into one block
    const rows = [];
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (s.busy) {
        let j = i; while (j + 1 < slots.length && slots[j + 1].busy && slots[j + 1].who === s.who) j++;
        rows.push({ type: 'busy', from: s.min, to: slots[j].min + window.CLINIC.step, who: s.who });
        i = j;
      } else {
        rows.push({ type: 'free', min: s.min, idx: i });
      }
    }
    return e('div', { className: 'daytl' },
      e('div', { className: 'daytl-head' }, U.dayLabel(date, { long: true }) + ', ' + date.getDate() + ' ' + U.MON_LONG[date.getMonth()]),
      e('div', { className: 'daytl-scroll' },
        rows.map((r, i) => e('div', { className: 'tl-row', key: i },
          e('span', { className: 'tl-time' }, U.minsToHHMM(r.type === 'busy' ? r.from : r.min)),
          e('div', { className: 'tl-cell' },
            r.type === 'busy'
              ? e('div', { className: 'tl-busy' + (r.who === 'Comida' ? ' lunch' : '') },
                  e(Icon, { name: r.who === 'Comida' ? 'clock' : 'user', size: 13 }), r.who)
              : e('button', { type: 'button', className: 'tl-slot' + (st.appt.timeMin === r.min ? ' on' : ''),
                  disabled: !isFree(r.idx),
                  onClick: () => patchAppt({ timeMin: r.min }) },
                  st.appt.timeMin === r.min ? 'Cita aquí · ' + U.fmt12(r.min) : (isFree(r.idx) ? 'Disponible' : 'No cabe ' + dur + ' min')))))));
  };

})();
