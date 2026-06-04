/* Mock data + form schema for the Nota de Evolución structured form.
   Everything attaches to window for cross-script access. */

window.CLINEO_PATIENT = {
  firstName: 'María',
  lastName: 'García López',
  age: 54,
  gender: 'Mujer',
  bloodType: 'O+',
  initials: 'MG',
};

// Last recorded vitals (for the "copy last vitals" shortcut)
window.LAST_VITALS = {
  bp_sys: '128', bp_dia: '82',
  hr: '74', rr: '16', temp: '36.7', spo2: '97',
  weight: '68', height: '162',
  recordedAt: '14 may 2025',
};

window.PREVIOUS_NOTES = [
  { title: 'Nota de Evolución — 14 may 2025', date: '14 may 2025' },
  { title: 'Exploración Física — 2 abr 2025', date: '2 abr 2025' },
];

// Common symptoms for the toggle-chip demo
window.SYMPTOMS = [
  'Dolor', 'Fiebre', 'Fatiga', 'Náusea', 'Tos', 'Disnea',
  'Cefalea', 'Mareo', 'Insomnio', 'Palpitaciones',
];

// Diagnosis suggestions (multi-select chips)
window.DIAGNOSES = [
  'Hipertensión esencial (I10)',
  'Diabetes mellitus tipo 2 (E11)',
  'Dislipidemia (E78)',
  'Infección de vías respiratorias (J06)',
  'Ansiedad generalizada (F41.1)',
  'Lumbalgia (M54.5)',
];

/* Section + field schema. Field `kind`:
   richlite | symptoms | vitals | diagnoses | select | date | text  */
window.EVOLUTION_SCHEMA = {
  noteTypeLabel: 'Nota de Evolución',
  sections: [
    {
      id: 'evolucion', title: 'Evolución', icon: 'activity',
      hint: '¿Cómo ha evolucionado el paciente desde la última consulta?',
      fields: [
        { id: 'evolucion', kind: 'richlite', label: 'Evolución', required: true,
          placeholder: 'Describe la evolución del padecimiento…' },
      ],
    },
    {
      id: 'sintomas', title: 'Síntomas Actuales', icon: 'thermometer',
      hint: 'Marca los síntomas presentes y añade detalle si hace falta.',
      fields: [
        { id: 'sintomas_chips', kind: 'symptoms', label: 'Síntomas presentes' },
        { id: 'sintomas_notas', kind: 'richlite', label: 'Detalle / otros síntomas',
          placeholder: 'Cronología, intensidad, factores…' },
      ],
    },
    {
      id: 'vitales', title: 'Signos Vitales', icon: 'heart',
      hint: 'Captura numérica con unidades. El IMC se calcula automáticamente.',
      fields: [ { id: 'vitals', kind: 'vitals', label: 'Signos vitales', requiredKeys: ['bp_sys','bp_dia','hr'] } ],
    },
    {
      id: 'exploracion', title: 'Exploración Física', icon: 'search',
      hint: 'Hallazgos por aparatos y sistemas.',
      fields: [
        { id: 'exploracion', kind: 'richlite', label: 'Hallazgos', required: true,
          placeholder: 'Aspecto general, tórax, abdomen, extremidades…' },
      ],
    },
    {
      id: 'diagnostico', title: 'Impresión Diagnóstica', icon: 'clipboard',
      hint: 'Selecciona diagnósticos y su severidad.',
      fields: [
        { id: 'dx_chips', kind: 'diagnoses', label: 'Diagnósticos', required: true },
        { id: 'dx_severity', kind: 'select', label: 'Severidad',
          options: ['Leve', 'Moderada', 'Severa'], placeholder: 'Seleccionar…' },
        { id: 'dx_notas', kind: 'richlite', label: 'Notas diagnósticas',
          placeholder: 'Justificación clínica, diferenciales…' },
      ],
    },
    {
      id: 'plan', title: 'Plan de Tratamiento', icon: 'list',
      hint: 'Indicaciones, medicación y seguimiento.',
      fields: [
        { id: 'plan', kind: 'richlite', label: 'Plan', required: true,
          placeholder: 'Medicamentos, dosis, estudios, recomendaciones…' },
      ],
    },
    {
      id: 'cita', title: 'Próxima Cita', icon: 'calendar',
      hint: 'Agenda el seguimiento.',
      fields: [
        { id: 'cita_fecha', kind: 'date', label: 'Fecha de próxima cita' },
        { id: 'cita_modalidad', kind: 'select', label: 'Modalidad',
          options: ['Presencial', 'Teleconsulta'], placeholder: 'Seleccionar…' },
      ],
    },
  ],
};

// Vital field definitions
window.VITAL_FIELDS = [
  { key: 'bp', kind: 'bp', label: 'Presión Arterial', unit: 'mmHg' },
  { key: 'hr', label: 'Frecuencia Cardíaca', unit: 'lpm' },
  { key: 'rr', label: 'Frecuencia Respiratoria', unit: 'rpm' },
  { key: 'temp', label: 'Temperatura', unit: '°C' },
  { key: 'spo2', label: 'Saturación O₂', unit: '%' },
  { key: 'weight', label: 'Peso', unit: 'kg' },
  { key: 'height', label: 'Talla', unit: 'cm' },
  { key: 'bmi', label: 'IMC', unit: 'kg/m²', calc: true },
];
