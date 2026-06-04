/* Builder concept — design a custom note type (idea #2, marked CONCEPTO).
   Palette · canvas · inspector. Functional enough to feel real. */
const { createElement: d, useState: dS } = React;
const DIcon = window.Icon;

const FIELD_TYPES = [
  { type: 'text', name: 'Texto corto', desc: 'Una línea', icon: 'type' },
  { type: 'richlite', name: 'Texto largo', desc: 'Narrativa con formato', icon: 'list' },
  { type: 'number', name: 'Número + unidad', desc: 'p. ej. 36.7 °C', icon: 'hash' },
  { type: 'yesno', name: 'Sí / No', desc: 'Presente / ausente', icon: 'checkSquare' },
  { type: 'select', name: 'Selección', desc: 'Una opción', icon: 'chevronDown' },
  { type: 'multi', name: 'Selección múltiple', desc: 'Chips', icon: 'checkCircle' },
  { type: 'date', name: 'Fecha', desc: 'Selector de fecha', icon: 'calendar' },
  { type: 'signature', name: 'Firma', desc: 'Captura de firma', icon: 'pen' },
];
const TYPE_META = Object.fromEntries(FIELD_TYPES.map((t) => [t.type, t]));

let _uid = 100;
const uid = () => 'f' + (++_uid);

function seedBuilder() {
  return {
    name: 'Nota de Curación',
    sections: [
      { id: 's1', title: 'Datos de la herida', fields: [
        { id: uid(), type: 'select', label: 'Tipo de herida', required: true, options: ['Quirúrgica', 'Traumática', 'Úlcera'] },
        { id: uid(), type: 'number', label: 'Tamaño', required: false, unit: 'cm' },
        { id: uid(), type: 'yesno', label: 'Signos de infección', required: true },
      ] },
      { id: 's2', title: 'Procedimiento', fields: [
        { id: uid(), type: 'richlite', label: 'Descripción del procedimiento', required: true },
        { id: uid(), type: 'date', label: 'Próxima curación', required: false },
      ] },
    ],
  };
}

function BuilderField({ f, selected, onSelect, onMove, onDelete, isFirst, isLast }) {
  const meta = TYPE_META[f.type] || TYPE_META.text;
  return d('div', { className: 'bld-field' + (selected ? ' sel' : ''), onClick: onSelect },
    d('div', { className: 'bld-field-top' },
      d('span', { className: 'icon-btn', style: { cursor: 'grab', color: 'var(--text-faint)' } }, d(DIcon, { name: 'grip', size: 16 })),
      d('span', { className: 'bld-ico' }, d(DIcon, { name: meta.icon, size: 15 })),
      d('div', { style: { flex: 1, minWidth: 0 } },
        d('div', { style: { fontSize: 13.5, fontWeight: 600 } }, f.label || 'Campo sin título',
          f.required && d('span', { style: { color: 'var(--crit-fg)', marginLeft: 5 } }, '*')),
        d('div', { style: { fontSize: 11.5, color: 'var(--text-faint)' } },
          meta.name + (f.unit ? ' · ' + f.unit : '') + (f.options ? ' · ' + f.options.length + ' opciones' : ''))),
      d('button', { className: 'icon-btn', disabled: isFirst, onClick: (ev) => { ev.stopPropagation(); onMove(-1); }, title: 'Subir' }, d(DIcon, { name: 'chevronUp', size: 15 })),
      d('button', { className: 'icon-btn', disabled: isLast, onClick: (ev) => { ev.stopPropagation(); onMove(1); }, title: 'Bajar' }, d(DIcon, { name: 'chevronDown', size: 15 })),
      d('button', { className: 'icon-btn', onClick: (ev) => { ev.stopPropagation(); onDelete(); }, title: 'Eliminar', style: { color: 'var(--crit-fg)' } }, d(DIcon, { name: 'trash', size: 15 })),
    ));
}

window.Builder = function Builder() {
  const [model, setModel] = dS(seedBuilder);
  const [sel, setSel] = dS(null); // { sId, fId }
  const [activeSection, setActiveSection] = dS('s1');

  const addField = (type) => {
    const sId = activeSection;
    const nf = { id: uid(), type, label: '', required: false };
    if (type === 'number') nf.unit = '';
    if (type === 'select' || type === 'multi') nf.options = ['Opción 1', 'Opción 2'];
    setModel((m) => ({ ...m, sections: m.sections.map((s) => s.id === sId ? { ...s, fields: [...s.fields, nf] } : s) }));
    setSel({ sId, fId: nf.id });
  };
  const updateField = (patch) => {
    if (!sel) return;
    setModel((m) => ({ ...m, sections: m.sections.map((s) => s.id === sel.sId ? { ...s, fields: s.fields.map((f) => f.id === sel.fId ? { ...f, ...patch } : f) } : s) }));
  };
  const moveField = (sId, fId, dir) => setModel((m) => ({ ...m, sections: m.sections.map((s) => {
    if (s.id !== sId) return s;
    const idx = s.fields.findIndex((f) => f.id === fId); const j = idx + dir;
    if (j < 0 || j >= s.fields.length) return s;
    const arr = s.fields.slice(); const [it] = arr.splice(idx, 1); arr.splice(j, 0, it);
    return { ...s, fields: arr };
  }) }));
  const deleteField = (sId, fId) => { setModel((m) => ({ ...m, sections: m.sections.map((s) => s.id === sId ? { ...s, fields: s.fields.filter((f) => f.id !== fId) } : s) })); if (sel && sel.fId === fId) setSel(null); };
  const addSection = () => { const id = 's' + uid(); setModel((m) => ({ ...m, sections: [...m.sections, { id, title: 'Nueva sección', fields: [] }] })); setActiveSection(id); };
  const renameSection = (sId, title) => setModel((m) => ({ ...m, sections: m.sections.map((s) => s.id === sId ? { ...s, title } : s) }));

  const selField = sel ? (model.sections.find((s) => s.id === sel.sId)?.fields.find((f) => f.id === sel.fId)) : null;

  const palette = d('div', null,
    d('div', { className: 'mono-label', style: { marginBottom: 12 } }, 'Tipos de campo'),
    FIELD_TYPES.map((t) => d('button', { key: t.type, className: 'palette-item', onClick: () => addField(t.type) },
      d('span', { className: 'pi-ico' }, d(DIcon, { name: t.icon, size: 16 })),
      d('div', null, d('div', { className: 'pi-name' }, t.name), d('div', { className: 'pi-desc' }, t.desc)),
      d('span', { style: { marginLeft: 'auto', color: 'var(--brand-600)' } }, d(DIcon, { name: 'plus', size: 16 })))),
  );

  const canvas = d('div', { className: 'editor-card', style: { padding: '20px 22px' } },
    d('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
      d('span', { className: 'badge badge-warn' }, 'Concepto'),
      d('span', { className: 'mono-label' }, 'Constructor de tipo de nota')),
    d('input', { className: 'note-title', style: { padding: '6px 0 4px', fontSize: 22 }, value: model.name, onChange: (ev) => setModel((m) => ({ ...m, name: ev.target.value })) }),
    d('div', { style: { fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 18 } }, 'Elige campos de la paleta. Cada tipo de nota se convierte en un formulario rígido como las propuestas A–C.'),
    model.sections.map((s) => d('div', { key: s.id, className: 'bld-section', onClick: () => setActiveSection(s.id), style: { borderColor: activeSection === s.id ? 'var(--brand-400)' : undefined } },
      d('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
        d('input', { value: s.title, onChange: (ev) => renameSection(s.id, ev.target.value),
          style: { border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', outline: 'none', flex: 1 } }),
        activeSection === s.id && d('span', { className: 'badge badge-brand' }, 'Activa · añade aquí')),
      s.fields.length === 0 && d('div', { style: { fontSize: 12.5, color: 'var(--text-faint)', padding: '8px 0' } }, 'Sección vacía — añade campos desde la paleta.'),
      s.fields.map((f, i) => d(BuilderField, { key: f.id, f, selected: sel && sel.fId === f.id,
        onSelect: () => { setSel({ sId: s.id, fId: f.id }); setActiveSection(s.id); },
        onMove: (dir) => moveField(s.id, f.id, dir), onDelete: () => deleteField(s.id, f.id),
        isFirst: i === 0, isLast: i === s.fields.length - 1 })))),
    d('button', { className: 'btn btn-outline btn-sm', onClick: addSection }, d(DIcon, { name: 'plus', size: 14 }), 'Añadir sección'),
  );

  const inspector = d('div', { className: 'side-col' },
    d('div', { className: 'side-card' },
      d('div', { className: 'mono-label', style: { marginBottom: 12 } }, 'Propiedades'),
      !selField
        ? d('div', { style: { fontSize: 12.5, color: 'var(--text-faint)' } }, 'Selecciona un campo para editar sus propiedades.')
        : d('div', null,
            d('div', { className: 'field' },
              d('label', { className: 'field-label' }, 'Etiqueta'),
              d('input', { className: 'inp', style: { minHeight: 40 }, value: selField.label, placeholder: 'Nombre del campo', onChange: (ev) => updateField({ label: ev.target.value }) })),
            selField.type === 'number' && d('div', { className: 'field' },
              d('label', { className: 'field-label' }, 'Unidad'),
              d('input', { className: 'inp', style: { minHeight: 40 }, value: selField.unit || '', placeholder: 'mmHg, kg, °C…', onChange: (ev) => updateField({ unit: ev.target.value }) })),
            (selField.type === 'select' || selField.type === 'multi') && d('div', { className: 'field' },
              d('label', { className: 'field-label' }, 'Opciones'),
              d('textarea', { className: 'inp', style: { minHeight: 80 }, value: (selField.options || []).join('\n'), onChange: (ev) => updateField({ options: ev.target.value.split('\n').filter(Boolean) }) }),
              d('div', { className: 'field-help', style: { marginTop: 4 } }, 'Una opción por línea.')),
            d('div', { className: 'field' },
              d('label', { className: 'field-label' }, 'Tipo'),
              d('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' } },
                d('span', { className: 'bld-ico' }, d(DIcon, { name: (TYPE_META[selField.type] || {}).icon || 'type', size: 15 })),
                (TYPE_META[selField.type] || {}).name)),
            d('div', { className: 'field', style: { marginTop: 4 } },
              d('button', { type: 'button', className: 'chip' + (selField.required ? ' on' : ''), style: { cursor: 'pointer' }, onClick: () => updateField({ required: !selField.required }) },
                selField.required && d('span', { className: 'chk' }, d(DIcon, { name: 'check', size: 14 })), 'Campo obligatorio')))),
    d('div', { className: 'note-callout' },
      'Al guardar, este tipo de nota aparece en el selector ', d('strong', null, 'Tipo'), ' y se rellena como formulario.'),
  );

  return d('div', { className: 'app' },
    d(window.AppRail),
    d('div', { className: 'content fade-in' },
      d('div', { className: 'page-head' },
        d('div', null,
          d('div', { className: 'mono-crumb' }, 'Biblioteca · Tipos de nota · Nuevo'),
          d('h1', null, 'Constructor de formularios')),
        d('div', { className: 'ph-actions' },
          d('button', { className: 'btn btn-ghost btn-sm' }, 'Vista previa'),
          d('button', { className: 'btn btn-primary btn-sm' }, 'Guardar tipo de nota'))),
      d('div', { className: 'builder-grid' },
        d('div', null, palette),
        d('div', { style: { minWidth: 0 } }, canvas),
        inspector)),
  );
};
