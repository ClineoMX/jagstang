import type {
  Doctor,
  Patient,
  Appointment,
  MedicalNote,
  NoteTemplate,
  Attachment,
  ConsentType,
  PatientConsent,
  Contact,
} from '../types';

// Mock Doctor
export const mockDoctor: Doctor = {
  id: 'doc-1',
  firstName: 'María',
  lastName: 'García López',
  email: 'maria.garcia@hospital.com',
  speciality: 'Medicina General',
  licenseNumber: 'MED-123456',
  phone: '+52 55 1234 5678',
  avatar: 'https://i.pravatar.cc/150?img=47',
};

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 'pat-1',
    firstName: 'Juan',
    lastName: 'Pérez Martínez',
    email: 'juan.perez@email.com',
    phone: '+52 55 9876 5432',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    bloodType: 'O+',
    address: 'Av. Insurgentes Sur 1234',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '03100',
    curp: 'PEMJ850315HDFRXN01',
    rfc: 'PEMJ850315ABC',
    socialSecurityNumber: '12345678901',
    insuranceProvider: 'IMSS',
    insuranceNumber: 'INS-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-20T14:30:00Z',
    lastVisit: '2024-10-15T11:00:00Z',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'pat-2',
    firstName: 'Ana',
    lastName: 'Rodríguez Silva',
    email: 'ana.rodriguez@email.com',
    phone: '+52 55 8765 4321',
    dateOfBirth: '1992-07-22',
    gender: 'female',
    bloodType: 'A+',
    address: 'Paseo de la Reforma 567',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '06600',
    curp: 'ROSA920722MDFRDN02',
    rfc: 'ROSA920722XYZ',
    socialSecurityNumber: '98765432109',
    insuranceProvider: 'Seguro Popular',
    insuranceNumber: 'INS-002',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-10-21T09:15:00Z',
    lastVisit: '2024-10-18T15:30:00Z',
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
  {
    id: 'pat-3',
    firstName: 'Carlos',
    lastName: 'Hernández Gómez',
    email: 'carlos.hernandez@email.com',
    phone: '+52 55 7654 3210',
    dateOfBirth: '1978-11-05',
    gender: 'male',
    bloodType: 'B+',
    address: 'Calle Reforma 890',
    city: 'Guadalajara',
    state: 'Jalisco',
    zipCode: '44100',
    curp: 'HEGC781105HJCRML03',
    rfc: 'HEGC781105DEF',
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-10-19T16:45:00Z',
    lastVisit: '2024-10-10T10:00:00Z',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 'pat-4',
    firstName: 'Laura',
    lastName: 'Martínez Torres',
    email: 'laura.martinez@email.com',
    phone: '+52 55 6543 2109',
    dateOfBirth: '1995-04-18',
    gender: 'female',
    bloodType: 'AB+',
    address: 'Av. Universidad 456',
    city: 'Monterrey',
    state: 'Nuevo León',
    zipCode: '64000',
    curp: 'MATL950418MNLRRL04',
    rfc: 'MATL950418GHI',
    createdAt: '2024-04-12T08:30:00Z',
    updatedAt: '2024-10-20T13:20:00Z',
    lastVisit: '2024-10-12T14:00:00Z',
    avatar: 'https://i.pravatar.cc/150?img=25',
  },
  {
    id: 'pat-5',
    firstName: 'Roberto',
    lastName: 'González Ramírez',
    email: 'roberto.gonzalez@email.com',
    phone: '+52 55 5432 1098',
    dateOfBirth: '1988-09-30',
    gender: 'male',
    bloodType: 'O-',
    address: 'Blvd. Adolfo López Mateos 321',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '01000',
    curp: 'GORR880930HDFNMT05',
    rfc: 'GORR880930JKL',
    createdAt: '2024-05-20T10:15:00Z',
    updatedAt: '2024-10-21T08:00:00Z',
    lastVisit: '2024-10-20T09:30:00Z',
    avatar: 'https://i.pravatar.cc/150?img=15',
  },
];

// Mock Note Templates
export const mockNoteTemplates: NoteTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Interrogatorio',
    type: 'interrogation',
    content: `<h1>Interrogatorio</h1>

<h2>Datos Generales</h2>
<ul>
<li><strong>Nombre del paciente:</strong></li>
<li><strong>Edad:</strong></li>
<li><strong>Sexo:</strong></li>
<li><strong>Ocupación:</strong></li>
</ul>

<h2>Motivo de Consulta</h2>

<h2>Antecedentes Heredofamiliares</h2>
<ul>
<li><strong>Diabetes:</strong></li>
<li><strong>Hipertensión:</strong></li>
<li><strong>Cáncer:</strong></li>
<li><strong>Otros:</strong></li>
</ul>

<h2>Antecedentes Personales No Patológicos</h2>
<ul>
<li><strong>Tabaquismo:</strong></li>
<li><strong>Alcoholismo:</strong></li>
<li><strong>Drogas:</strong></li>
<li><strong>Actividad física:</strong></li>
<li><strong>Alimentación:</strong></li>
</ul>

<h2>Antecedentes Personales Patológicos</h2>
<ul>
<li><strong>Enfermedades previas:</strong></li>
<li><strong>Cirugías:</strong></li>
<li><strong>Alergias:</strong></li>
<li><strong>Medicamentos actuales:</strong></li>
</ul>

<h2>Padecimiento Actual</h2>

<h2>Interrogatorio por Aparatos y Sistemas</h2>
<ul>
<li><strong>Cardiovascular:</strong></li>
<li><strong>Respiratorio:</strong></li>
<li><strong>Digestivo:</strong></li>
<li><strong>Genitourinario:</strong></li>
<li><strong>Nervioso:</strong></li>
<li><strong>Musculoesquelético:</strong></li>
<li><strong>Endocrino:</strong></li>
</ul>`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
  {
    id: 'tpl-2',
    name: 'Nota de Evolución',
    type: 'evolution',
    content: `<h1>Nota de Evolución</h1>
<h2>Evolución</h2>
<br />
<h2>Síntomas Actuales</h2>
<br />
<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong></li>
<li><strong>Frecuencia Cardíaca:</strong></li>
<li><strong>Frecuencia Respiratoria:</strong></li>
<li><strong>Temperatura:</strong></li>
<li><strong>Saturación de O2:</strong></li>
<li><strong>Peso:</strong></li>
<li><strong>Talla:</strong></li>
</ul>

<h2>Exploración Física</h2>
<br />
<h2>Impresión Diagnóstica</h2>
<br />
<h2>Plan de Tratamiento</h2>
<br />
<h2>Próxima Cita</h2>
`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
  {
    id: 'tpl-3',
    name: 'Exploración Física',
    type: 'exploration',
    content: `<h1>Exploración Física</h1>
<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong> ___ / ___ mmHg</li>
<li><strong>Frecuencia Cardíaca:</strong> ___ lpm</li>
<li><strong>Frecuencia Respiratoria:</strong> ___ rpm</li>
<li><strong>Temperatura:</strong> ___ °C</li>
<li><strong>Saturación de Oxígeno:</strong> ___ %</li>
<li><strong>Peso:</strong> ___ kg</li>
<li><strong>Talla:</strong> ___ cm</li>
<li><strong>IMC:</strong> ___ kg/m²</li>
</ul>

<h2>Aspecto General</h2>
<br />
<h2>Cabeza y Cuello</h2>
<ul>
<li><strong>Cabeza:</strong></li>
<li><strong>Ojos:</strong></li>
<li><strong>Oídos:</strong></li>
<li><strong>Nariz:</strong></li>
<li><strong>Boca y garganta:</strong></li>
<li><strong>Cuello:</strong></li>
<li><strong>Tiroides:</strong></li>
</ul>
<br />
<h2>Tórax</h2>
<ul>
<li><strong>Inspección:</strong></li>
<li><strong>Palpación:</strong></li>
<li><strong>Percusión:</strong></li>
<li><strong>Auscultación:</strong></li>
</ul>
<br />
<h2>Sistema Cardiovascular</h2>
<ul>
<li><strong>Inspección:</strong></li>
<li><strong>Palpación:</strong></li>
<li><strong>Auscultación:</strong></li>
</ul>
<br />
<h2>Abdomen</h2>
<ul>
<li><strong>Inspección:</strong></li>
<li><strong>Palpación:</strong></li>
<li><strong>Percusión:</strong></li>
<li><strong>Auscultación:</strong></li>
</ul>
<br />
<h2>Extremidades</h2>
<ul>
<li><strong>Superiores:</strong></li>
<li><strong>Inferiores:</strong></li>
<li><strong>Pulsos:</strong></li>
<li><strong>Edema:</strong></li>
</ul>
<br />
<h2>Sistema Neurológico</h2>
<ul>
<li><strong>Estado mental:</strong></li>
<li><strong>Pares craneales:</strong></li>
<li><strong>Función motora:</strong></li>
<li><strong>Función sensorial:</strong></li>
<li><strong>Reflejos:</strong></li>
<li><strong>Coordinación:</strong></li>
</ul>
<br />
<h2>Conclusiones</h2>
`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
];

export const mockWellnessNoteTemplates: NoteTemplate[] = [
  {
    id: 'tpl-psy-1',
    name: 'Historia Clínica Psicológica Inicial',
    type: 'psychology-interrogation',
    content: `<h1>Historia Clínica Psicológica Inicial</h1>
 
<h2>Motivo de Consulta</h2>
<br />
 
<h2>Historia del Problema Actual</h2>
<br />
 
<h2>Antecedentes Psicológicos y Psiquiátricos</h2>
<ul>
<li><strong>Atención psicológica previa:</strong></li>
<li><strong>Atención psiquiátrica previa:</strong></li>
<li><strong>Diagnósticos anteriores:</strong></li>
<li><strong>Medicación actual:</strong></li>
<li><strong>Hospitalizaciones psiquiátricas:</strong></li>
</ul>
 
<h2>Historia Personal Relevante</h2>
<br />
 
<h2>Estado Mental Actual</h2>
<ul>
<li><strong>Apariencia y actitud:</strong></li>
<li><strong>Estado de ánimo / Afecto:</strong></li>
<li><strong>Pensamiento:</strong></li>
<li><strong>Percepción:</strong></li>
<li><strong>Cognición / Orientación:</strong></li>
<li><strong>Juicio e introspección:</strong></li>
<li><strong>Ideación:</strong></li>
</ul>
 
<h2>Objetivos Terapéuticos y Plan de Intervención</h2>
<ul>
<li><strong>Enfoque terapéutico:</strong></li>
<li><strong>Frecuencia de sesiones:</strong></li>
<li><strong>Objetivos:</strong></li>
</ul>`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
  {
    id: 'tpl-psy-2',
    name: 'Nota de Sesión Psicológica',
    type: 'psychology-evolution',
    content: `<h1>Nota de Sesión Psicológica</h1>
 
<h2>Presentación del Paciente</h2>
<br />
 
<h2>Contenido de la Sesión</h2>
<br />
 
<h2>Intervenciones Terapéuticas</h2>
<br />
 
<h2>Respuesta del Paciente</h2>
<br />
 
<h2>Evaluación y Progreso</h2>
<br />
 
<h2>Plan y Acuerdos</h2>
<br />`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
];

// Mock Attachments
export const mockAttachments: Attachment[] = [
  {
    id: 'att-1',
    fileName: 'radiografia_torax.jpg',
    fileSize: 2048576,
    fileType: 'image',
    mimeType: 'image/jpeg',
    url: 'https://via.placeholder.com/800x600/007AFF/FFFFFF?text=Radiografía+de+Tórax',
    uploadedAt: '2024-10-15T11:30:00Z',
    uploadedBy: 'doc-1',
    patientId: 'pat-1',
  },
  {
    id: 'att-2',
    fileName: 'laboratorio_completo.pdf',
    fileSize: 512000,
    fileType: 'pdf',
    mimeType: 'application/pdf',
    url: '#',
    uploadedAt: '2024-10-18T15:45:00Z',
    uploadedBy: 'doc-1',
    patientId: 'pat-2',
  },
];

// Mock Medical Notes
export const mockMedicalNotes: MedicalNote[] = [
  {
    id: 'note-1',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Interrogatorio - Juan Pérez',
    type: 'interrogation',
    content: `<h1>Interrogatorio</h1>

<h2>Datos Generales</h2>
<ul>
<li><strong>Nombre del paciente:</strong> Juan Pérez Martínez</li>
<li><strong>Edad:</strong> 39 años</li>
<li><strong>Sexo:</strong> Masculino</li>
<li><strong>Ocupación:</strong> Ingeniero</li>
</ul>

<h2>Motivo de Consulta</h2>
<p>Dolor abdominal recurrente desde hace 2 semanas, localizado en epigastrio, de intensidad moderada a severa, que se exacerba después de las comidas.</p>

<h2>Antecedentes Heredofamiliares</h2>
<ul>
<li><strong>Diabetes:</strong> Padre con diabetes tipo 2</li>
<li><strong>Hipertensión:</strong> Madre hipertensa</li>
<li><strong>Cáncer:</strong> No</li>
<li><strong>Otros:</strong> Abuelo materno con enfermedad cardiovascular</li>
</ul>

<h2>Antecedentes Personales No Patológicos</h2>
<ul>
<li><strong>Tabaquismo:</strong> No</li>
<li><strong>Alcoholismo:</strong> Consumo social ocasional</li>
<li><strong>Drogas:</strong> No</li>
<li><strong>Actividad física:</strong> Regular, 3 veces por semana</li>
<li><strong>Alimentación:</strong> Regular, sin restricciones</li>
</ul>

<h2>Antecedentes Personales Patológicos</h2>
<ul>
<li><strong>Enfermedades previas:</strong> Gastritis diagnosticada hace 5 años</li>
<li><strong>Cirugías:</strong> Apendicectomía a los 12 años</li>
<li><strong>Alergias:</strong> Penicilina (rash cutáneo)</li>
<li><strong>Medicamentos actuales:</strong> Omeprazol 20mg diario</li>
</ul>

<h2>Padecimiento Actual</h2>
<p>Paciente refiere inicio de dolor abdominal hace aproximadamente 2 semanas, de inicio gradual, localizado en epigastrio. El dolor es de tipo ardoroso, de intensidad 6/10, que se exacerba después de las comidas y mejora parcialmente con antiácidos. Asocia náuseas ocasionales sin vómito. Niega fiebre, cambios en hábitos intestinales o pérdida de peso.</p>

<h2>Interrogatorio por Aparatos y Sistemas</h2>
<ul>
<li><strong>Cardiovascular:</strong> Sin alteraciones</li>
<li><strong>Respiratorio:</strong> Sin alteraciones</li>
<li><strong>Digestivo:</strong> Dolor epigástrico, náuseas ocasionales</li>
<li><strong>Genitourinario:</strong> Sin alteraciones</li>
<li><strong>Nervioso:</strong> Sin alteraciones</li>
<li><strong>Musculoesquelético:</strong> Sin alteraciones</li>
<li><strong>Endocrino:</strong> Sin alteraciones</li>
</ul>`,
    templateId: 'tpl-1',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-15T11:00:00Z',
    signedBy: 'Dra. María García López',
    attachments: [mockAttachments[0]],
    createdAt: '2024-10-15T10:30:00Z',
    updatedAt: '2024-10-15T11:00:00Z',
  },
  {
    id: 'note-2',
    patientId: 'pat-2',
    doctorId: 'doc-1',
    title: 'Nota de Evolución - Ana Rodríguez',
    type: 'evolution',
    content: `<h1>Nota de Evolución</h1>

<p><strong>Fecha:</strong> 18 de octubre de 2024<br>
<strong>Hora:</strong> 15:00 hrs</p>

<h2>Evolución</h2>
<p>Paciente refiere mejoría notable después del tratamiento prescrito. Disminución de síntomas en un 80%. El dolor abdominal ha disminuido significativamente y las náuseas han desaparecido completamente. Refiere mejor tolerancia a los alimentos.</p>

<h2>Síntomas Actuales</h2>
<p>Dolor epigástrico leve ocasional (2/10), principalmente después de comidas copiosas. Sin náuseas ni vómito. Buen apetito.</p>

<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong> 120/80 mmHg</li>
<li><strong>Frecuencia Cardíaca:</strong> 72 lpm</li>
<li><strong>Frecuencia Respiratoria:</strong> 16 rpm</li>
<li><strong>Temperatura:</strong> 36.5 °C</li>
<li><strong>Saturación de O2:</strong> 98%</li>
<li><strong>Peso:</strong> 65 kg</li>
<li><strong>Talla:</strong> 165 cm</li>
</ul>

<h2>Exploración Física</h2>
<p>Abdomen blando, depresible, sin dolor a la palpación superficial. No hay signos de irritación peritoneal. Ruidos hidroaéreos presentes y normales.</p>

<h2>Impresión Diagnóstica</h2>
<p>Gastritis en resolución. Mejoría clínica significativa con tratamiento.</p>

<h2>Plan de Tratamiento</h2>
<p>Continuar con Omeprazol 20mg antes del desayuno por 2 semanas más. Dieta blanda, evitar irritantes. Control en 2 semanas o antes si síntomas recurren.</p>

<h2>Próxima Cita</h2>
<p>1 de noviembre de 2024 a las 10:00 hrs</p>`,
    templateId: 'tpl-2',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-18T15:30:00Z',
    signedBy: 'Dra. María García López',
    attachments: [mockAttachments[1]],
    createdAt: '2024-10-18T15:00:00Z',
    updatedAt: '2024-10-18T15:30:00Z',
  },
  {
    id: 'note-3',
    patientId: 'pat-5',
    doctorId: 'doc-1',
    title: 'Exploración Física - Roberto González',
    type: 'exploration',
    content: `<h1>Exploración Física</h1>

<p><strong>Fecha:</strong> 20 de octubre de 2024<br>
<strong>Paciente:</strong> Roberto González</p>

<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong> 130/85 mmHg</li>
<li><strong>Frecuencia Cardíaca:</strong> 78 lpm</li>
<li><strong>Frecuencia Respiratoria:</strong> 18 rpm</li>
<li><strong>Temperatura:</strong> 36.8 °C</li>
<li><strong>Saturación de Oxígeno:</strong> 97%</li>
<li><strong>Peso:</strong> 78 kg</li>
<li><strong>Talla:</strong> 175 cm</li>
<li><strong>IMC:</strong> 25.5 kg/m²</li>
</ul>

<h2>Aspecto General</h2>
<p>Paciente en buen estado general, consciente, orientado, colaborador. Buen coloración de piel y mucosas.</p>

<h2>Cabeza y Cuello</h2>
<ul>
<li><strong>Cabeza:</strong> Normocéfalo, sin lesiones</li>
<li><strong>Ojos:</strong> Pupilas isocóricas, reactivas a la luz</li>
<li><strong>Oídos:</strong> Sin alteraciones</li>
<li><strong>Nariz:</strong> Permeable</li>
<li><strong>Boca y garganta:</strong> Mucosas húmedas, sin lesiones</li>
<li><strong>Cuello:</strong> Sin adenopatías, sin masas</li>
<li><strong>Tiroides:</strong> No aumentada de tamaño</li>
</ul>

<h2>Tórax</h2>
<ul>
<li><strong>Inspección:</strong> Simétrico, sin deformidades</li>
<li><strong>Palpación:</strong> Sin dolor, buena expansión</li>
<li><strong>Percusión:</strong> Sonido claro pulmonar</li>
<li><strong>Auscultación:</strong> Murmullo vesicular presente, sin ruidos agregados</li>
</ul>

<h2>Sistema Cardiovascular</h2>
<ul>
<li><strong>Inspección:</strong> Sin alteraciones</li>
<li><strong>Palpación:</strong> Choque de punta en 5to espacio intercostal</li>
<li><strong>Auscultación:</strong> Ruidos cardíacos rítmicos, sin soplos</li>
</ul>

<h2>Abdomen</h2>
<ul>
<li><strong>Inspección:</strong> Plano, sin cicatrices</li>
<li><strong>Palpación:</strong> Blando, depresible, sin dolor</li>
<li><strong>Percusión:</strong> Timpánico</li>
<li><strong>Auscultación:</strong> Ruidos hidroaéreos presentes</li>
</ul>

<h2>Extremidades</h2>
<ul>
<li><strong>Superiores:</strong> Sin alteraciones, movilidad completa</li>
<li><strong>Inferiores:</strong> Sin edema, pulsos presentes</li>
<li><strong>Pulsos:</strong> Presentes y simétricos</li>
<li><strong>Edema:</strong> No</li>
</ul>

<h2>Sistema Neurológico</h2>
<ul>
<li><strong>Estado mental:</strong> Consciente, orientado</li>
<li><strong>Pares craneales:</strong> Íntegros</li>
<li><strong>Función motora:</strong> Normal</li>
<li><strong>Función sensorial:</strong> Normal</li>
<li><strong>Reflejos:</strong> Presentes y simétricos</li>
<li><strong>Coordinación:</strong> Normal</li>
</ul>

<h2>Conclusiones</h2>
<p>Exploración física completa sin hallazgos patológicos relevantes. Paciente en buen estado general.</p>`,
    templateId: 'tpl-3',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-20T09:30:00Z',
    signedBy: 'Dra. María García López',
    createdAt: '2024-10-20T09:00:00Z',
    updatedAt: '2024-10-20T09:30:00Z',
  },
  // Multiple notes for same date (to demonstrate stacking)
  {
    id: 'note-4',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Nota de Evolución - Seguimiento Dolor Abdominal',
    type: 'evolution',
    content: `<h1>Nota de Evolución</h1>

<p><strong>Fecha:</strong> 15 de octubre de 2024<br>
<strong>Hora:</strong> 14:00 hrs</p>

<h2>Evolución</h2>
<p>Paciente refiere mejoría parcial del dolor abdominal después de iniciar tratamiento con Omeprazol. El dolor persiste pero con menor intensidad.</p>

<h2>Síntomas Actuales</h2>
<p>Dolor epigástrico moderado (4/10), que se exacerba después de las comidas. Náuseas ocasionales.</p>

<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong> 125/82 mmHg</li>
<li><strong>Frecuencia Cardíaca:</strong> 75 lpm</li>
<li><strong>Frecuencia Respiratoria:</strong> 16 rpm</li>
<li><strong>Temperatura:</strong> 36.6 °C</li>
<li><strong>Saturación de O2:</strong> 98%</li>
<li><strong>Peso:</strong> 82 kg</li>
<li><strong>Talla:</strong> 178 cm</li>
</ul>

<h2>Exploración Física</h2>
<p>Abdomen con dolor leve a la palpación en epigastrio. Sin signos de irritación peritoneal.</p>

<h2>Impresión Diagnóstica</h2>
<p>Gastritis aguda en evolución. Mejoría parcial con tratamiento.</p>

<h2>Plan de Tratamiento</h2>
<p>Continuar con Omeprazol. Agregar dieta blanda. Solicitar endoscopia digestiva alta para evaluación.</p>

<h2>Próxima Cita</h2>
<p>22 de octubre de 2024</p>`,
    templateId: 'tpl-2',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-15T14:30:00Z',
    signedBy: 'Dra. María García López',
    createdAt: '2024-10-15T14:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
  },
  {
    id: 'note-5',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Exploración Física - Juan Pérez',
    type: 'exploration',
    content: `<h1>Exploración Física</h1>

<p><strong>Fecha:</strong> 15 de octubre de 2024<br>
<strong>Paciente:</strong> Juan Pérez Martínez</p>

<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong> 125/82 mmHg</li>
<li><strong>Frecuencia Cardíaca:</strong> 75 lpm</li>
<li><strong>Frecuencia Respiratoria:</strong> 16 rpm</li>
<li><strong>Temperatura:</strong> 36.6 °C</li>
<li><strong>Saturación de Oxígeno:</strong> 98%</li>
<li><strong>Peso:</strong> 82 kg</li>
<li><strong>Talla:</strong> 178 cm</li>
<li><strong>IMC:</strong> 25.9 kg/m²</li>
</ul>

<h2>Aspecto General</h2>
<p>Paciente en buen estado general, consciente, orientado.</p>

<h2>Cabeza y Cuello</h2>
<ul>
<li><strong>Cabeza:</strong> Sin alteraciones</li>
<li><strong>Ojos:</strong> Pupilas normales</li>
<li><strong>Oídos:</strong> Sin alteraciones</li>
<li><strong>Nariz:</strong> Permeable</li>
<li><strong>Boca y garganta:</strong> Sin alteraciones</li>
<li><strong>Cuello:</strong> Sin masas</li>
<li><strong>Tiroides:</strong> Normal</li>
</ul>

<h2>Tórax</h2>
<ul>
<li><strong>Inspección:</strong> Normal</li>
<li><strong>Palpación:</strong> Normal</li>
<li><strong>Percusión:</strong> Normal</li>
<li><strong>Auscultación:</strong> Murmullo vesicular presente</li>
</ul>

<h2>Sistema Cardiovascular</h2>
<ul>
<li><strong>Inspección:</strong> Normal</li>
<li><strong>Palpación:</strong> Normal</li>
<li><strong>Auscultación:</strong> Ruidos cardíacos normales</li>
</ul>

<h2>Abdomen</h2>
<ul>
<li><strong>Inspección:</strong> Plano</li>
<li><strong>Palpación:</strong> Dolor leve en epigastrio</li>
<li><strong>Percusión:</strong> Timpánico</li>
<li><strong>Auscultación:</strong> Ruidos presentes</li>
</ul>

<h2>Extremidades</h2>
<ul>
<li><strong>Superiores:</strong> Sin alteraciones</li>
<li><strong>Inferiores:</strong> Sin edema</li>
<li><strong>Pulsos:</strong> Presentes</li>
<li><strong>Edema:</strong> No</li>
</ul>

<h2>Sistema Neurológico</h2>
<ul>
<li><strong>Estado mental:</strong> Normal</li>
<li><strong>Pares craneales:</strong> Íntegros</li>
<li><strong>Función motora:</strong> Normal</li>
<li><strong>Función sensorial:</strong> Normal</li>
<li><strong>Reflejos:</strong> Presentes</li>
<li><strong>Coordinación:</strong> Normal</li>
</ul>

<h2>Conclusiones</h2>
<p>Exploración física con dolor leve en epigastrio. Resto sin alteraciones.</p>`,
    templateId: 'tpl-3',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-15T16:00:00Z',
    signedBy: 'Dra. María García López',
    createdAt: '2024-10-15T15:30:00Z',
    updatedAt: '2024-10-15T16:00:00Z',
  },
  {
    id: 'note-6',
    patientId: 'pat-2',
    doctorId: 'doc-1',
    title: 'Nota de Seguimiento - Ana Rodríguez',
    type: 'evolution',
    content: `<h1>Nota de Evolución</h1>

<p><strong>Fecha:</strong> 18 de octubre de 2024<br>
<strong>Hora:</strong> 16:30 hrs</p>

<h2>Evolución</h2>
<p>Paciente continúa con mejoría. Asintomática desde la última consulta.</p>

<h2>Síntomas Actuales</h2>
<p>Sin síntomas. Refiere sentirse completamente bien.</p>

<h2>Signos Vitales</h2>
<ul>
<li><strong>Presión Arterial:</strong> 118/75 mmHg</li>
<li><strong>Frecuencia Cardíaca:</strong> 70 lpm</li>
<li><strong>Frecuencia Respiratoria:</strong> 16 rpm</li>
<li><strong>Temperatura:</strong> 36.5 °C</li>
<li><strong>Saturación de O2:</strong> 98%</li>
<li><strong>Peso:</strong> 65 kg</li>
<li><strong>Talla:</strong> 165 cm</li>
</ul>

<h2>Exploración Física</h2>
<p>Abdomen sin alteraciones. Sin dolor a la palpación.</p>

<h2>Impresión Diagnóstica</h2>
<p>Gastritis resuelta. Paciente asintomática.</p>

<h2>Plan de Tratamiento</h2>
<p>Continuar con medidas dietéticas. Suspender medicamento si permanece asintomática.</p>

<h2>Próxima Cita</h2>
<p>1 de noviembre de 2024</p>`,
    templateId: 'tpl-2',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-18T17:00:00Z',
    signedBy: 'Dra. María García López',
    createdAt: '2024-10-18T16:30:00Z',
    updatedAt: '2024-10-18T17:00:00Z',
  },
  {
    id: 'note-7',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Resultados de Laboratorio',
    type: 'evolution',
    content: `<h1>Nota de Evolución</h1>

<p><strong>Fecha:</strong> 15 de octubre de 2024<br>
<strong>Hora:</strong> 17:00 hrs</p>

<h2>Evolución</h2>
<p>Revisión de resultados de laboratorio solicitados.</p>

<h2>Resultados de Laboratorio</h2>
<ul>
<li><strong>Hemoglobina:</strong> 15.2 g/dL (Normal)</li>
<li><strong>Leucocitos:</strong> 7,200 /μL (Normal)</li>
<li><strong>Plaquetas:</strong> 250,000 /μL (Normal)</li>
<li><strong>Glucosa:</strong> 95 mg/dL (Normal)</li>
<li><strong>Creatinina:</strong> 0.9 mg/dL (Normal)</li>
<li><strong>Transaminasas:</strong> Dentro de límites normales</li>
</ul>

<h2>Impresión Diagnóstica</h2>
<p>Resultados de laboratorio dentro de parámetros normales. No hay alteraciones que sugieran patología sistémica.</p>

<h2>Plan de Tratamiento</h2>
<p>Continuar con tratamiento para gastritis. Los resultados de laboratorio no muestran alteraciones.</p>

<h2>Próxima Cita</h2>
<p>22 de octubre de 2024</p>`,
    templateId: 'tpl-2',
    status: 'signed',
    isSigned: true,
    signedAt: '2024-10-15T17:30:00Z',
    signedBy: 'Dra. María García López',
    createdAt: '2024-10-15T17:00:00Z',
    updatedAt: '2024-10-15T17:30:00Z',
  },
  // Draft notes for testing
  {
    id: 'note-draft-1',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Nota de Evolución - Borrador',
    type: 'evolution',
    content: `<h1>Nota de Evolución</h1>

<p><strong>Fecha:</strong> 22 de octubre de 2024<br>
<strong>Hora:</strong> 10:00 hrs</p>

<h2>Evolución</h2>
<p>Paciente refiere mejoría del dolor abdominal. El tratamiento está funcionando.</p>

<h2>Síntomas Actuales</h2>
<p>Dolor leve ocasional.</p>`,
    templateId: 'tpl-2',
    status: 'draft',
    isSigned: false,
    hash: 'mock-hash-draft-1',
    createdAt: '2024-10-22T10:00:00Z',
    updatedAt: '2024-10-22T10:00:00Z',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Consulta de seguimiento - Juan Pérez',
    description: 'Seguimiento de tratamiento para dolor abdominal',
    date: '2024-10-22',
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    status: 'confirmed',
    createdAt: '2024-10-15T12:00:00Z',
    updatedAt: '2024-10-16T08:00:00Z',
  },
  {
    id: 'apt-2',
    patientId: 'pat-2',
    doctorId: 'doc-1',
    title: 'Consulta general - Ana Rodríguez',
    description: 'Revisión general y actualización de estudios',
    date: '2024-10-23',
    startTime: '11:00',
    endTime: '11:30',
    duration: 30,
    status: 'pending',
    createdAt: '2024-10-18T16:00:00Z',
    updatedAt: '2024-10-18T16:00:00Z',
  },
  {
    id: 'apt-3',
    patientId: 'pat-3',
    doctorId: 'doc-1',
    title: 'Consulta de rutina - Carlos Hernández',
    description: 'Chequeo anual de rutina',
    date: '2024-10-24',
    startTime: '09:00',
    endTime: '09:30',
    duration: 30,
    status: 'confirmed',
    createdAt: '2024-10-10T14:00:00Z',
    updatedAt: '2024-10-12T10:00:00Z',
  },
  {
    id: 'apt-4',
    patientId: 'pat-4',
    doctorId: 'doc-1',
    title: 'Primera consulta - Laura Martínez',
    description: 'Interrogatorio y exploración física',
    date: '2024-10-25',
    startTime: '14:00',
    endTime: '14:30',
    duration: 30,
    status: 'pending',
    createdAt: '2024-10-20T09:00:00Z',
    updatedAt: '2024-10-20T09:00:00Z',
  },
  {
    id: 'apt-5',
    patientId: 'pat-5',
    doctorId: 'doc-1',
    title: 'Revisión de estudios - Roberto González',
    description: 'Revisar resultados de laboratorio',
    date: '2024-10-28',
    startTime: '15:00',
    endTime: '15:30',
    duration: 30,
    status: 'confirmed',
    createdAt: '2024-10-20T10:00:00Z',
    updatedAt: '2024-10-21T08:00:00Z',
  },
  {
    id: 'apt-6',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    title: 'Consulta urgente - Juan Pérez',
    description: 'Dolor abdominal intenso',
    date: '2024-10-21',
    startTime: '16:00',
    endTime: '16:30',
    duration: 30,
    status: 'confirmed',
    createdAt: '2024-10-21T10:00:00Z',
    updatedAt: '2024-10-21T10:30:00Z',
  },
];

// Mock Consent Types
export const mockConsentTypes: ConsentType[] = [
  {
    id: 'consent-1',
    name: 'Tratamiento de Datos Personales',
    description: 'Autorización para el tratamiento y almacenamiento de datos personales del paciente.',
    fullText: `# Consentimiento para el Tratamiento de Datos Personales

## Propósito
Este consentimiento autoriza a la institución médica para recopilar, almacenar, procesar y utilizar sus datos personales con fines médicos y administrativos.

## Datos que se recopilan
- Nombre completo
- Fecha de nacimiento
- Dirección y contacto
- Historia clínica
- Información de seguro médico
- Datos fiscales (CURP, RFC)

## Uso de los datos
Sus datos serán utilizados exclusivamente para:
1. Brindar atención médica de calidad
2. Mantener su expediente clínico actualizado
3. Gestionar citas y seguimientos
4. Facturación y cobros
5. Cumplimiento de obligaciones legales

## Protección
Todos sus datos están protegidos conforme a la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP).

## Derechos ARCO
Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales.`,
    isRequired: true,
    category: 'Privacidad',
    version: '1.0',
    effectiveDate: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'consent-2',
    name: 'Procedimientos Médicos',
    description: 'Consentimiento para realizar procedimientos médicos y tratamientos.',
    fullText: `# Consentimiento para Procedimientos Médicos

## Autorización General
Al otorgar este consentimiento, usted autoriza al personal médico a realizar los procedimientos diagnósticos y terapéuticos que consideren necesarios para su atención.

## Incluye
- Exámenes físicos y exploraciones
- Análisis de laboratorio
- Estudios de imagenología (rayos X, ultrasonido, etc.)
- Procedimientos menores ambulatorios
- Administración de medicamentos

## Información y Riesgos
El médico le informará específicamente sobre:
- El procedimiento a realizar
- Los riesgos asociados
- Las alternativas disponibles
- Los beneficios esperados

## Derecho a rechazar
Usted tiene el derecho de rechazar cualquier procedimiento específico en cualquier momento.

## Consentimiento informado específico
Para procedimientos quirúrgicos o invasivos, se requerirá un consentimiento informado adicional y específico.`,
    isRequired: false,
    category: 'Atención Médica',
    version: '1.0',
    effectiveDate: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'consent-3',
    name: 'Comunicaciones Electrónicas',
    description: 'Autorización para recibir comunicaciones por medios electrónicos.',
    fullText: `# Consentimiento para Comunicaciones Electrónicas

## Medios de Comunicación
Al otorgar este consentimiento, usted acepta recibir comunicaciones de la institución médica a través de:
- Correo electrónico
- Mensajes SMS
- Llamadas telefónicas
- WhatsApp u otras aplicaciones de mensajería

## Tipo de Comunicaciones
Las comunicaciones pueden incluir:
1. Recordatorios de citas
2. Resultados de estudios (cuando no requieran consulta presencial)
3. Notificaciones administrativas
4. Información sobre servicios y promociones
5. Encuestas de satisfacción

## Confidencialidad
Todas las comunicaciones se manejarán de forma confidencial y segura.

## Cancelación
Puede revocar este consentimiento en cualquier momento, notificando a la institución por escrito o correo electrónico.`,
    isRequired: false,
    category: 'Comunicación',
    version: '1.0',
    effectiveDate: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'consent-4',
    name: 'Compartir Información con Aseguradoras',
    description: 'Autorización para compartir información médica con compañías de seguros.',
    fullText: `# Consentimiento para Compartir Información con Aseguradoras

## Propósito
Este consentimiento autoriza a la institución médica a compartir su información de salud con su compañía de seguros médicos para fines de facturación y cobertura.

## Información Compartida
Se compartirá únicamente la información necesaria para:
- Procesamiento de reclamaciones
- Verificación de elegibilidad
- Autorización previa de procedimientos
- Facturación de servicios cubiertos

## Limitaciones
No se compartirá información no relacionada con los servicios que está reclamando.

## Revocación
Puede revocar este consentimiento, aunque esto puede afectar su capacidad de usar su seguro médico en esta institución.`,
    isRequired: false,
    category: 'Seguros',
    version: '1.0',
    effectiveDate: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Patient Consents (for patient p-1: Juan Pérez)
export const mockPatientConsents: PatientConsent[] = [
  {
    id: 'pc-1',
    patientId: 'p-1',
    consentTypeId: 'consent-1',
    status: 'granted',
    grantedAt: '2024-10-01T10:30:00Z',
    signedBy: 'Juan Pérez González',
    signature: 'signature-data-base64', // In real app, this would be base64 image
    version: '1.0',
    createdAt: '2024-10-01T10:30:00Z',
    updatedAt: '2024-10-01T10:30:00Z',
  },
  {
    id: 'pc-2',
    patientId: 'p-1',
    consentTypeId: 'consent-3',
    status: 'granted',
    grantedAt: '2024-10-01T10:32:00Z',
    signedBy: 'Juan Pérez González',
    signature: 'signature-data-base64',
    version: '1.0',
    createdAt: '2024-10-01T10:32:00Z',
    updatedAt: '2024-10-01T10:32:00Z',
  },
];

// Helper function to get patient by ID
export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find((p) => p.id === id);
};

// Helper function to get appointments by patient ID
export const getAppointmentsByPatientId = (
  patientId: string
): Appointment[] => {
  return mockAppointments.filter((a) => a.patientId === patientId);
};

// Helper function to get notes by patient ID
export const getNotesByPatientId = (patientId: string): MedicalNote[] => {
  return mockMedicalNotes.filter((n) => n.patientId === patientId);
};

// Helper function to search patients
export const searchPatients = (query: string): Patient[] => {
  const lowerQuery = query.toLowerCase();
  return mockPatients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.email?.toLowerCase().includes(lowerQuery) ||
      p.phone?.includes(query)
  );
};

// Helper function to get all consent types
export const getConsentTypes = (): ConsentType[] => {
  return mockConsentTypes;
};

// Helper function to get patient consents by patient ID
export const getPatientConsentsByPatientId = (
  patientId: string
): PatientConsent[] => {
  return mockPatientConsents.filter((pc) => pc.patientId === patientId);
};

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: 'cont-1',
    firstName: 'Dr. Carlos',
    lastName: 'Méndez',
    alias: 'Cardiólogo Carlos',
    email: 'carlos.mendez@hospital.com',
    phone: '+52 55 1111 2222',
    type: 'colleague',
    company: 'Hospital General',
    position: 'Cardiólogo',
    notes: 'Especialista en arritmias',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
  },
  {
    id: 'cont-2',
    firstName: 'Laboratorio',
    lastName: 'Clínico ABC',
    alias: 'Lab ABC',
    email: 'contacto@lababc.com',
    phone: '+52 55 2222 3333',
    type: 'provider',
    company: 'Laboratorio Clínico ABC',
    position: 'Atención al Cliente',
    notes: 'Resultados en 24 horas',
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: 'cont-3',
    firstName: 'María',
    lastName: 'González',
    alias: 'María - Farmacia',
    email: 'maria.gonzalez@farmacia.com',
    phone: '+52 55 3333 4444',
    type: 'supplier',
    company: 'Farmacia del Centro',
    position: 'Gerente',
    notes: 'Descuentos para médicos',
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-10-18T16:00:00Z',
  },
  {
    id: 'cont-4',
    firstName: 'Dr. Ana',
    lastName: 'López',
    alias: 'Ana - Pediatra',
    email: 'ana.lopez@clinica.com',
    phone: '+52 55 4444 5555',
    type: 'colleague',
    company: 'Clínica Infantil',
    position: 'Pediatra',
    notes: 'Referencias de pacientes pediátricos',
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-10-19T12:00:00Z',
  },
  {
    id: 'cont-5',
    firstName: 'Equipos',
    lastName: 'Médicos SA',
    alias: 'Equipos Médicos',
    email: 'ventas@equiposmedicos.com',
    phone: '+52 55 5555 6666',
    type: 'supplier',
    company: 'Equipos Médicos SA',
    position: 'Ventas',
    notes: 'Proveedor de equipos de diagnóstico',
    createdAt: '2024-04-10T08:00:00Z',
    updatedAt: '2024-10-17T09:30:00Z',
  },
  {
    id: 'cont-6',
    firstName: 'Dr. Roberto',
    lastName: 'Sánchez',
    alias: 'Roberto - Ortopedista',
    email: 'roberto.sanchez@hospital.com',
    phone: '+52 55 6666 7777',
    type: 'colleague',
    company: 'Hospital Regional',
    position: 'Ortopedista',
    notes: 'Especialista en columna',
    createdAt: '2024-05-15T14:00:00Z',
    updatedAt: '2024-10-16T15:00:00Z',
  },
  {
    id: 'cont-7',
    firstName: 'Imagenología',
    lastName: 'Avanzada',
    alias: 'Imagenología',
    email: 'contacto@imagenologia.com',
    phone: '+52 55 7777 8888',
    type: 'provider',
    company: 'Centro de Imagenología Avanzada',
    position: 'Recepción',
    notes: 'Resonancia y tomografía',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-10-15T11:00:00Z',
  },
];

// Helper function to get contact by ID
export const getContactById = (id: string): Contact | undefined => {
  return mockContacts.find((c) => c.id === id);
};

// Helper function to search contacts
export const searchContacts = (query: string): Contact[] => {
  const lowerQuery = query.toLowerCase();
  return mockContacts.filter(
    (c) =>
      c.firstName.toLowerCase().includes(lowerQuery) ||
      c.lastName.toLowerCase().includes(lowerQuery) ||
      c.alias?.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query)
  );
};
