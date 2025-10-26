import type {
  Doctor,
  Patient,
  Appointment,
  MedicalNote,
  NoteTemplate,
  Attachment,
  ConsentType,
  PatientConsent,
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
    name: 'Interrogatorio Inicial',
    type: 'initial_interrogation',
    content: `# Interrogatorio Inicial

## Datos Generales
- **Nombre del paciente:**
- **Edad:**
- **Sexo:**
- **Ocupación:**

## Motivo de Consulta
[Describir el motivo principal de la consulta]

## Antecedentes Heredofamiliares
- **Diabetes:**
- **Hipertensión:**
- **Cáncer:**
- **Otros:**

## Antecedentes Personales No Patológicos
- **Tabaquismo:**
- **Alcoholismo:**
- **Drogas:**
- **Actividad física:**
- **Alimentación:**

## Antecedentes Personales Patológicos
- **Enfermedades previas:**
- **Cirugías:**
- **Alergias:**
- **Medicamentos actuales:**

## Padecimiento Actual
[Descripción detallada del padecimiento actual]

## Interrogatorio por Aparatos y Sistemas
- **Cardiovascular:**
- **Respiratorio:**
- **Digestivo:**
- **Genitourinario:**
- **Nervioso:**
- **Musculoesquelético:**
- **Endocrino:**
`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
  {
    id: 'tpl-2',
    name: 'Nota de Evolución',
    type: 'evolution_note',
    content: `# Nota de Evolución

**Fecha:** [Fecha de la consulta]
**Hora:** [Hora de la consulta]

## Evolución
[Describir la evolución del paciente desde la última consulta]

## Síntomas Actuales
[Describir síntomas actuales]

## Signos Vitales
- **Presión Arterial:**
- **Frecuencia Cardíaca:**
- **Frecuencia Respiratoria:**
- **Temperatura:**
- **Saturación de O2:**
- **Peso:**
- **Talla:**

## Exploración Física
[Hallazgos relevantes en la exploración física]

## Impresión Diagnóstica
[Diagnóstico o impresión clínica]

## Plan de Tratamiento
[Medicamentos, estudios, indicaciones]

## Próxima Cita
[Fecha de próxima cita de seguimiento]
`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
  {
    id: 'tpl-3',
    name: 'Exploración Física',
    type: 'physical_examination',
    content: `# Exploración Física

**Fecha:** [Fecha del examen]
**Paciente:** [Nombre del paciente]

## Signos Vitales
- **Presión Arterial:** ___ / ___ mmHg
- **Frecuencia Cardíaca:** ___ lpm
- **Frecuencia Respiratoria:** ___ rpm
- **Temperatura:** ___ °C
- **Saturación de Oxígeno:** ___ %
- **Peso:** ___ kg
- **Talla:** ___ cm
- **IMC:** ___ kg/m²

## Aspecto General
[Describir aspecto general del paciente]

## Cabeza y Cuello
- **Cabeza:**
- **Ojos:**
- **Oídos:**
- **Nariz:**
- **Boca y garganta:**
- **Cuello:**
- **Tiroides:**

## Tórax
- **Inspección:**
- **Palpación:**
- **Percusión:**
- **Auscultación:**

## Sistema Cardiovascular
- **Inspección:**
- **Palpación:**
- **Auscultación:**

## Abdomen
- **Inspección:**
- **Palpación:**
- **Percusión:**
- **Auscultación:**

## Extremidades
- **Superiores:**
- **Inferiores:**
- **Pulsos:**
- **Edema:**

## Sistema Neurológico
- **Estado mental:**
- **Pares craneales:**
- **Función motora:**
- **Función sensorial:**
- **Reflejos:**
- **Coordinación:**

## Conclusiones
[Resumen de hallazgos relevantes]
`,
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
    title: 'Interrogatorio Inicial - Juan Pérez',
    type: 'initial_interrogation',
    content: mockNoteTemplates[0].content.replace(
      '[Describir el motivo principal de la consulta]',
      'Dolor abdominal recurrente desde hace 2 semanas'
    ),
    templateId: 'tpl-1',
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
    type: 'evolution_note',
    content: mockNoteTemplates[1].content.replace(
      '[Describir la evolución del paciente desde la última consulta]',
      'Paciente refiere mejoría notable después del tratamiento prescrito. Disminución de síntomas en un 80%.'
    ),
    templateId: 'tpl-2',
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
    type: 'physical_examination',
    content: mockNoteTemplates[2].content,
    templateId: 'tpl-3',
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
    type: 'evolution_note',
    content: mockNoteTemplates[1].content,
    templateId: 'tpl-2',
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
    type: 'physical_examination',
    content: mockNoteTemplates[2].content,
    templateId: 'tpl-3',
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
    type: 'evolution_note',
    content: mockNoteTemplates[1].content,
    templateId: 'tpl-2',
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
    type: 'evolution_note',
    content: mockNoteTemplates[1].content,
    templateId: 'tpl-2',
    isSigned: true,
    signedAt: '2024-10-15T17:30:00Z',
    signedBy: 'Dra. María García López',
    createdAt: '2024-10-15T17:00:00Z',
    updatedAt: '2024-10-15T17:30:00Z',
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
    description: 'Interrogatorio inicial y exploración física',
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
