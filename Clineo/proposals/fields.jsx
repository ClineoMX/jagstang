/* Field component library + shared form state + completion logic.
   Exposes: window.FormProvider, window.useForm, window.FieldRenderer,
   window.completion helpers, and individual field components. */
const { createElement: e2, useState: uS, useEffect: uE, useRef: uR, useContext, createContext, useCallback: uCb } = React;
const Icon2 = window.Icon;

/* ── Form state ───────────────────────────────────────────────── */
const FormCtx = createContext(null);
const LS_KEY = 'clineo_evolution_form_v1';

function defaultValues() {
  return {
    _title: 'Nota de Evolución — ' + new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
    vitals: {},
    sintomas_chips: [],
    dx_chips: [],
  };
}

window.FormProvider = function FormProvider({ children }) {
  const [values, setValues] = uS(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return { ...defaultValues(), ...JSON.parse(saved) };
    } catch (_) {}
    return defaultValues();
  });
  uE(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(values)); } catch (_) {}
  }, [values]);
  const setValue = uCb((id, v) => setValues((p) => ({ ...p, [id]: v })), []);
  const setVital = uCb((key, v) => setValues((p) => ({ ...p, vitals: { ...p.vitals, [key]: v } })), []);
  const copyLastVitals = uCb(() => {
    const lv = window.LAST_VITALS;
    setValues((p) => ({ ...p, vitals: {
      bp_sys: lv.bp_sys, bp_dia: lv.bp_dia, hr: lv.hr, rr: lv.rr,
      temp: lv.temp, spo2: lv.spo2, weight: lv.weight, height: lv.height,
    } }));
  }, []);
  const reset = uCb(() => { setValues(defaultValues()); }, []);
  return e2(FormCtx.Provider, { value: { values, setValue, setVital, copyLastVitals, reset } }, children);
};
window.useForm = function useForm() { return useContext(FormCtx); };

/* ── Completion logic ─────────────────────────────────────────── */
function stripHtml(s) { return (s || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(); }

function fieldFilled(field, values) {
  const v = values[field.id];
  switch (field.kind) {
    case 'richlite': return stripHtml(v).length > 0;
    case 'symptoms':
    case 'diagnoses': return Array.isArray(v) && v.length > 0;
    case 'vitals': {
      const keys = field.requiredKeys || [];
      const vv = values.vitals || {};
      return keys.every((k) => String(vv[k] || '').trim() !== '');
    }
    default: return String(v || '').trim() !== '';
  }
}
function fieldRequired(field) { return !!(field.required || (field.requiredKeys && field.requiredKeys.length)); }

window.completion = {
  section(section, values) {
    const fields = section.fields;
    const filled = fields.filter((f) => fieldFilled(f, values)).length;
    if (filled === 0) return 'empty';
    if (filled === fields.length) return 'done';
    return 'partial';
  },
  // Required-field progress across the whole schema (for NOM-004 meter)
  required(schema, values) {
    let total = 0, done = 0;
    schema.sections.forEach((s) => s.fields.forEach((f) => {
      if (fieldRequired(f)) { total++; if (fieldFilled(f, values)) done++; }
    }));
    return { total, done, pct: total ? Math.round((done / total) * 100) : 100 };
  },
  fieldFilled, fieldRequired, stripHtml,
};

/* ── Field shell ──────────────────────────────────────────────── */
function FieldShell({ label, required, optional, help, children }) {
  return e2('div', { className: 'field' },
    e2('label', { className: 'field-label' },
      label,
      required && e2('span', { className: 'req', title: 'Obligatorio' }, '*'),
      optional && e2('span', { className: 'opt' }, 'opcional'),
    ),
    help && e2('div', { className: 'field-help' }, help),
    children,
  );
}

/* ── Rich-lite editor ─────────────────────────────────────────── */
function RichLite({ value, onChange, placeholder }) {
  const ref = uR(null);
  uE(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      if (document.activeElement !== ref.current) ref.current.innerHTML = value || '';
    }
  }, [value]);
  const cmd = (c) => { document.execCommand(c, false); ref.current && ref.current.focus(); emit(); };
  const emit = () => { onChange(ref.current ? ref.current.innerHTML : ''); };
  return e2('div', { className: 'richlite' },
    e2('div', { className: 'rl-bar' },
      e2('button', { type: 'button', className: 'rl-btn', title: 'Negrita', onMouseDown: (ev) => { ev.preventDefault(); cmd('bold'); } }, e2(Icon2, { name: 'bold', size: 15 })),
      e2('button', { type: 'button', className: 'rl-btn', title: 'Cursiva', onMouseDown: (ev) => { ev.preventDefault(); cmd('italic'); } }, e2(Icon2, { name: 'italic', size: 15 })),
      e2('button', { type: 'button', className: 'rl-btn', title: 'Lista', onMouseDown: (ev) => { ev.preventDefault(); cmd('insertUnorderedList'); } }, e2(Icon2, { name: 'bullet', size: 15 })),
    ),
    e2('div', {
      ref, className: 'rl-area', contentEditable: true, 'data-ph': placeholder || 'Escribe aquí…',
      suppressContentEditableWarning: true,
      onInput: emit, onBlur: emit,
    }),
  );
}

/* ── Number + unit ────────────────────────────────────────────── */
function NumberUnit({ value, onChange, unit, placeholder, calc, ariaLabel }) {
  return e2('div', { className: 'numunit' + (calc ? ' calc' : '') },
    e2('input', {
      type: calc ? 'text' : 'number', value: value || '', placeholder: placeholder || '—',
      readOnly: calc, 'aria-label': ariaLabel,
      onChange: (ev) => onChange(ev.target.value),
    }),
    e2('span', { className: 'unit' }, unit),
  );
}

function computeBMI(vitals) {
  const w = parseFloat(vitals.weight), hcm = parseFloat(vitals.height);
  if (!w || !hcm) return '';
  const m = hcm / 100;
  return (w / (m * m)).toFixed(1);
}

/* ── Vitals grid ──────────────────────────────────────────────── */
function VitalsGrid({ compact }) {
  const { values, setVital, copyLastVitals } = window.useForm();
  const vitals = values.vitals || {};
  const bmi = computeBMI(vitals);
  return e2('div', null,
    e2('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 } },
      e2('button', { type: 'button', className: 'btn btn-outline btn-sm', onClick: copyLastVitals },
        e2(Icon2, { name: 'copy', size: 14 }),
        'Copiar últimos (', window.LAST_VITALS.recordedAt, ')'),
    ),
    e2('div', { style: { display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 } },
      window.VITAL_FIELDS.map((vf) => {
        if (vf.kind === 'bp') {
          return e2('div', { key: vf.key },
            e2('div', { className: 'field-label' }, vf.label, e2('span', { className: 'req' }, '*')),
            e2('div', { className: 'numunit bp' },
              e2('input', { type: 'number', value: vitals.bp_sys || '', placeholder: 'Sis', 'aria-label': 'Sistólica', onChange: (ev) => setVital('bp_sys', ev.target.value) }),
              e2('span', { className: 'bp-sep' }, '/'),
              e2('input', { type: 'number', value: vitals.bp_dia || '', placeholder: 'Dia', 'aria-label': 'Diastólica', onChange: (ev) => setVital('bp_dia', ev.target.value) }),
              e2('span', { className: 'unit' }, vf.unit),
            ),
          );
        }
        const isCalc = vf.calc;
        const reqMark = (vf.key === 'hr');
        return e2('div', { key: vf.key },
          e2('div', { className: 'field-label' }, vf.label,
            reqMark && e2('span', { className: 'req' }, '*'),
            isCalc && e2('span', { className: 'opt' }, 'auto')),
          e2(NumberUnit, {
            value: isCalc ? bmi : (vitals[vf.key] || ''),
            onChange: (v) => setVital(vf.key, v),
            unit: vf.unit, calc: isCalc, ariaLabel: vf.label,
          }),
        );
      }),
    ),
  );
}

/* ── Chip group (multi-select) ────────────────────────────────── */
function ChipGroup({ options, value, onChange, allowCustom }) {
  const arr = Array.isArray(value) ? value : [];
  const [custom, setCustom] = uS('');
  const toggle = (opt) => {
    if (arr.includes(opt)) onChange(arr.filter((x) => x !== opt));
    else onChange([...arr, opt]);
  };
  const addCustom = () => { const t = custom.trim(); if (t && !arr.includes(t)) { onChange([...arr, t]); setCustom(''); } };
  const extras = arr.filter((x) => !options.includes(x));
  return e2('div', null,
    e2('div', { className: 'chips' },
      options.map((opt) => e2('button', {
        key: opt, type: 'button', className: 'chip' + (arr.includes(opt) ? ' on' : ''),
        onClick: () => toggle(opt),
      }, arr.includes(opt) && e2('span', { className: 'chk' }, e2(Icon2, { name: 'check', size: 14 })), opt)),
      extras.map((opt) => e2('button', {
        key: opt, type: 'button', className: 'chip on', onClick: () => toggle(opt),
      }, e2('span', { className: 'chk' }, e2(Icon2, { name: 'check', size: 14 })), opt)),
    ),
    allowCustom && e2('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
      e2('input', { className: 'inp', style: { minHeight: 38 }, placeholder: 'Añadir otro…', value: custom,
        onChange: (ev) => setCustom(ev.target.value), onKeyDown: (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); addCustom(); } } }),
      e2('button', { type: 'button', className: 'btn btn-outline btn-sm', onClick: addCustom }, e2(Icon2, { name: 'plus', size: 14 }), 'Añadir')),
  );
}

/* ── Generic field renderer (used by every proposal) ──────────── */
window.FieldRenderer = function FieldRenderer({ field, compact }) {
  const { values, setValue } = window.useForm();
  const v = values[field.id];
  switch (field.kind) {
    case 'vitals':
      return e2(FieldShell, { label: field.label },
        e2(VitalsGrid, { compact }));
    case 'richlite':
      return e2(FieldShell, { label: field.label, required: field.required, optional: !field.required },
        e2(RichLite, { value: v, onChange: (val) => setValue(field.id, val), placeholder: field.placeholder }));
    case 'symptoms':
      return e2(FieldShell, { label: field.label, optional: true, help: 'Toca para marcar los síntomas presentes.' },
        e2(ChipGroup, { options: window.SYMPTOMS, value: v, onChange: (val) => setValue(field.id, val), allowCustom: true }));
    case 'diagnoses':
      return e2(FieldShell, { label: field.label, required: field.required },
        e2(ChipGroup, { options: window.DIAGNOSES, value: v, onChange: (val) => setValue(field.id, val), allowCustom: true }));
    case 'select':
      return e2(FieldShell, { label: field.label, optional: !field.required },
        e2('select', { className: 'inp', value: v || '', onChange: (ev) => setValue(field.id, ev.target.value) },
          e2('option', { value: '', disabled: true }, field.placeholder || 'Seleccionar…'),
          field.options.map((o) => e2('option', { key: o, value: o }, o))));
    case 'date':
      return e2(FieldShell, { label: field.label, optional: !field.required },
        e2('input', { type: 'date', className: 'inp', style: { maxWidth: 240 }, value: v || '', onChange: (ev) => setValue(field.id, ev.target.value) }));
    default:
      return e2(FieldShell, { label: field.label, optional: !field.required },
        e2('input', { className: 'inp', value: v || '', placeholder: field.placeholder, onChange: (ev) => setValue(field.id, ev.target.value) }));
  }
};

Object.assign(window, { computeBMI, RichLite, VitalsGrid, ChipGroup, FieldShell, stripHtml });
