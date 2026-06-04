/* Mock data for the unified Patient + Appointment proposals.
   Everything attaches to window for cross-script access. */
(function () {
  // Anchor "today" to a fixed weekday so the prototype is deterministic.
  // Monday, 9 June 2025, 10:30.
  window.NOW = new Date(2025, 5, 9, 10, 30, 0);

  window.DOCTOR = {
    name: 'Dra. María García López',
    speciality: 'Medicina General',
    initials: 'MG',
  };

  // Patients — note the DELIBERATE name collisions to exercise disambiguation:
  //  · two "Juan Pérez Hernández"
  //  · two "Ana Torres" (differ by apellido materno)
  //  · "José Luis" twins
  window.PATIENTS = [
    { id: 'p1', first: 'Juan', last: 'Pérez', mat: 'Hernández', dob: '1985-03-15', sex: 'M', phone: '+52 55 9871 5432', blood: 'O+', lastVisit: '2025-05-21', recurrent: true,  insurer: 'IMSS' },
    { id: 'p2', first: 'Juan', last: 'Pérez', mat: 'Hernández', dob: '1991-11-02', sex: 'M', phone: '+52 81 2244 9080', blood: 'A+', lastVisit: '2024-12-03', recurrent: true,  insurer: 'GNP' },
    { id: 'p3', first: 'Ana', last: 'Torres', mat: 'Vega',      dob: '1992-07-22', sex: 'F', phone: '+52 55 8765 4321', blood: 'A+', lastVisit: '2025-06-02', recurrent: true,  insurer: 'AXA' },
    { id: 'p4', first: 'Ana', last: 'Torres', mat: 'Salas',     dob: '1979-01-09', sex: 'F', phone: '+52 33 1190 7766', blood: 'B-', lastVisit: '2025-04-18', recurrent: false, insurer: '—' },
    { id: 'p5', first: 'José Luis', last: 'Ramírez', mat: 'Castro', dob: '1968-09-30', sex: 'M', phone: '+52 55 5432 1098', blood: 'B+', lastVisit: '2025-05-30', recurrent: true,  insurer: 'IMSS' },
    { id: 'p6', first: 'José Luis', last: 'Ramírez', mat: 'Cano',  dob: '2001-02-14', sex: 'M', phone: '+52 55 7001 3322', blood: 'O-', lastVisit: null,       recurrent: false, insurer: '—' },
    { id: 'p7', first: 'Laura', last: 'Martínez', mat: 'Torres',  dob: '1995-04-18', sex: 'F', phone: '+52 81 6543 2109', blood: 'AB+', lastVisit: '2025-05-12', recurrent: true,  insurer: 'Seguros Monterrey' },
    { id: 'p8', first: 'Carlos', last: 'Hernández', mat: 'Gómez', dob: '1978-11-05', sex: 'M', phone: '+52 33 7654 3210', blood: 'B+', lastVisit: '2025-03-28', recurrent: true,  insurer: 'IMSS' },
    { id: 'p9', first: 'Sofía', last: 'Mendoza', mat: 'Ríos',     dob: '1988-06-25', sex: 'F', phone: '+52 55 3322 1144', blood: 'O+', lastVisit: '2025-06-04', recurrent: true,  insurer: 'AXA' },
    { id: 'p10', first: 'Diego', last: 'Flores', mat: 'Aguilar',  dob: '2010-10-12', sex: 'M', phone: '+52 55 9090 1212', blood: 'A-', lastVisit: '2025-05-19', recurrent: false, insurer: 'GNP' },
    { id: 'p11', first: 'Valentina', last: 'Cruz', mat: 'Ibarra', dob: '1999-12-01', sex: 'F', phone: '+52 81 4567 8899', blood: 'AB-', lastVisit: null,      recurrent: false, insurer: '—' },
    { id: 'p12', first: 'Roberto', last: 'González', mat: 'Paz',  dob: '1955-08-08', sex: 'M', phone: '+52 55 2468 1357', blood: 'O+', lastVisit: '2025-02-11', recurrent: true,  insurer: 'IMSS' },
  ];

  window.DURATIONS = [
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 h' },
    { value: 120, label: '2 horas' },
  ];

  window.APPT_REASONS = [
    'Consulta de primera vez', 'Seguimiento', 'Revisión de estudios',
    'Control de crónico', 'Certificado médico', 'Urgencia',
  ];

  // Clinic hours: 09:00–18:00, 30-min granularity.
  window.CLINIC = { startMin: 9 * 60, endMin: 18 * 60, step: 30 };

  // Pre-booked appointments per day (date 'YYYY-MM-DD' → list of {start 'HH:MM', mins, who}).
  window.AGENDA = {
    '2025-06-09': [
      { start: '09:00', mins: 30, who: 'Sofía Mendoza' },
      { start: '09:30', mins: 60, who: 'Carlos Hernández' },
      { start: '11:00', mins: 30, who: 'Juan Pérez (1991)' },
      { start: '13:00', mins: 60, who: 'Comida' },
      { start: '16:00', mins: 90, who: 'Roberto González' },
    ],
    '2025-06-10': [
      { start: '10:00', mins: 30, who: 'Laura Martínez' },
      { start: '12:00', mins: 60, who: 'Ana Torres Vega' },
      { start: '13:00', mins: 60, who: 'Comida' },
    ],
    '2025-06-11': [
      { start: '09:00', mins: 90, who: 'Diego Flores' },
      { start: '13:00', mins: 60, who: 'Comida' },
      { start: '15:30', mins: 30, who: 'José Luis Ramírez' },
      { start: '16:00', mins: 30, who: 'Valentina Cruz' },
    ],
    '2025-06-12': [
      { start: '11:30', mins: 30, who: 'Juan Pérez (1985)' },
      { start: '13:00', mins: 60, who: 'Comida' },
    ],
    '2025-06-13': [
      { start: '13:00', mins: 60, who: 'Comida' },
      { start: '17:00', mins: 60, who: 'Sofía Mendoza' },
    ],
  };

  // ── Date helpers shared by all proposals ───────────────────────
  const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const DOW_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MON_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function minsToHHMM(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function hhmmToMins(s) { const [h, m] = s.split(':').map(Number); return h * 60 + m; }
  function fmt12(min) {
    let h = Math.floor(min / 60); const m = min % 60;
    const ap = h >= 12 ? 'p.m.' : 'a.m.'; let hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + String(m).padStart(2, '0') + ' ' + ap;
  }
  function ageFrom(dobStr) {
    const dob = new Date(dobStr + 'T00:00:00');
    let a = window.NOW.getFullYear() - dob.getFullYear();
    const mm = window.NOW.getMonth() - dob.getMonth();
    if (mm < 0 || (mm === 0 && window.NOW.getDate() < dob.getDate())) a--;
    return a;
  }
  function fmtDOB(dobStr) {
    const d = new Date(dobStr + 'T00:00:00');
    return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
  }
  function relVisit(dateStr) {
    if (!dateStr) return 'Sin visitas';
    const d = new Date(dateStr + 'T00:00:00');
    const days = Math.round((window.NOW - d) / 86400000);
    if (days <= 0) return 'hoy';
    if (days === 1) return 'ayer';
    if (days < 30) return 'hace ' + days + ' días';
    if (days < 60) return 'hace 1 mes';
    if (days < 365) return 'hace ' + Math.round(days / 30) + ' meses';
    return 'hace ' + Math.round(days / 365) + ' año' + (days >= 730 ? 's' : '');
  }
  function fullName(p) { return p.first + ' ' + p.last + ' ' + p.mat; }
  function initials(p) { return (p.first[0] + p.last[0]).toUpperCase(); }
  function dayLabel(d, opt) {
    opt = opt || {};
    const today = iso(d) === iso(window.NOW);
    const tmrw = iso(d) === iso(addDays(window.NOW, 1));
    if (opt.relative && today) return 'Hoy';
    if (opt.relative && tmrw) return 'Mañana';
    return (opt.long ? DOW_LONG[d.getDay()] : DOW[d.getDay()]);
  }

  window.dateUtils = {
    iso, addDays, minsToHHMM, hhmmToMins, fmt12, ageFrom, fmtDOB, relVisit,
    fullName, initials, dayLabel, DOW, DOW_LONG, MON, MON_LONG,
    isToday: (d) => iso(d) === iso(window.NOW),
  };

  // Returns slot objects for a given Date across clinic hours.
  window.slotsForDay = function slotsForDay(date) {
    const key = iso(date);
    const booked = (window.AGENDA[key] || []).map((b) => ({
      s: hhmmToMins(b.start), e: hhmmToMins(b.start) + b.mins, who: b.who,
    }));
    const slots = [];
    for (let m = window.CLINIC.startMin; m < window.CLINIC.endMin; m += window.CLINIC.step) {
      const hit = booked.find((b) => m >= b.s && m < b.e);
      slots.push({ min: m, label: minsToHHMM(m), busy: !!hit, who: hit ? hit.who : null });
    }
    return slots;
  };
})();
