# Wireframe: Expediente del Paciente

**Ruta:** `/patients/:id`
**User Stories:** 3.4, 5.1, 5.3
**Prioridad:** Alta

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  PATIENT DETAIL                                                │
│         │                                                                  │
│         │  Dashboard > Pacientes > María García López                    │
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ 👤 MARÍA GARCÍA LÓPEZ (45 años, F)                         ││
│         │  │    EXP-2024-00123 | CURP: GALM780515MDFRRR03              ││
│         │  │                                                             ││
│         │  │ [✏️ Editar] [📝 Nueva Nota] [📅 Nueva Cita] [⋮]         ││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ⚠️ INFORMACIÓN CRÍTICA (Siempre visible)                   ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ 🔴 ALERGIAS                                                ││
│         │  │    • Penicilina (Grave - Anafilaxia)                       ││
│         │  │    • Sulfonamidas                                          ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ 🟡 ENFERMEDADES CRÓNICAS                                   ││
│         │  │    • Diabetes Mellitus Tipo 2 (desde 2018)                ││
│         │  │    • Hipertensión Arterial (desde 2020)                    ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ 💊 MEDICAMENTOS ACTUALES                                   ││
│         │  │    • Metformina 850mg - Cada 12 hrs                        ││
│         │  │    • Losartán 50mg - Cada 24 hrs                           ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ 🏥 CIRUGÍAS PREVIAS                                        ││
│         │  │    • Apendicectomía (2015)                                 ││
│         │  │    • Cesárea (2010)                                        ││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ [Información] [Historial] [Notas] [Citas] [Documentos]    ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ INFORMACIÓN GENERAL (Tab activo)                            ││
│         │  │                                                             ││
│         │  │ Datos Personales                                           ││
│         │  │ ├─ Nombre completo: María García López                     ││
│         │  │ ├─ Fecha de nacimiento: 15/05/1978 (45 años)              ││
│         │  │ ├─ Sexo: Femenino                                          ││
│         │  │ ├─ CURP: GALM780515MDFRRR03                               ││
│         │  │ ├─ RFC: GALM780515XX3                                      ││
│         │  │ └─ Tipo de sangre: O+                                      ││
│         │  │                                                             ││
│         │  │ Contacto                                                    ││
│         │  │ ├─ Teléfono: +52 55 1234 5678                             ││
│         │  │ ├─ Email: maria.garcia@email.com                           ││
│         │  │ └─ Dirección: Av. Insurgentes Sur 123, Col. Roma Norte    ││
│         │  │              CDMX, 06700                                    ││
│         │  │                                                             ││
│         │  │ Información del Sistema                                     ││
│         │  │ ├─ Número de expediente: EXP-2024-00123                    ││
│         │  │ ├─ Fecha de registro: 15 de Enero, 2024                   ││
│         │  │ ├─ Última actualización: 5 de Dic, 2025                    ││
│         │  │ └─ Última consulta: 5 de Dic, 2025                        ││
│         │  └────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Tab: Historial Médico

```
┌────────────────────────────────────────────────────────────────────┐
│ [Información] [Historial ←] [Notas] [Citas] [Documentos]          │
├────────────────────────────────────────────────────────────────────┤
│ HISTORIAL MÉDICO                                                   │
│                                                                     │
│ 🔍 [Buscar en historial...] [📅 Filtrar por fecha ▼]             │
│                                                                     │
│ ━━━━━━━━━━━━━━━━━━━ TIMELINE ━━━━━━━━━━━━━━━━━━━━               │
│                                                                     │
│ ● 5 Dic 2025                                                       │
│ │ ┌──────────────────────────────────────────────────────────┐    │
│ │ │ Consulta General                                          │    │
│ │ │ Dr. José López | 10:30 hrs                               │    │
│ │ │ Diagnóstico: Control de Diabetes Mellitus Tipo 2         │    │
│ │ │ [Ver nota completa →]                                     │    │
│ │ └──────────────────────────────────────────────────────────┘    │
│ │                                                                  │
│ ● 20 Nov 2025                                                      │
│ │ ┌──────────────────────────────────────────────────────────┐    │
│ │ │ Control de Hipertensión                                   │    │
│ │ │ Dr. José López | 09:00 hrs                               │    │
│ │ │ Diagnóstico: HTA controlada                              │    │
│ │ │ [Ver nota completa →]                                     │    │
│ │ └──────────────────────────────────────────────────────────┘    │
│ │                                                                  │
│ ● 5 Nov 2025                                                       │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │ Primera Consulta de Diabetes                              │    │
│   │ Dr. José López | 11:00 hrs                               │    │
│   │ Diagnóstico: Diabetes Mellitus Tipo 2 - Recién dx       │    │
│   │ [Ver nota completa →]                                     │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                     │
│ [Cargar más consultas...]                                         │
└────────────────────────────────────────────────────────────────────┘
```

---

## Especificaciones

### Información Crítica Card (Sticky)
```
Position: Sticky (top: 0)
Background: Surface
Border: 2px solid Orange/Red (según criticidad)
Border Radius: 12px
Padding: 24px
Box Shadow: 0 4px 12px rgba(0,0,0,0.1)
Z-index: 10

Secciones:
- Alergias (🔴 Red, always highlighted)
- Enfermedades Crónicas (🟡 Orange)
- Medicamentos Actuales (💊 Blue)
- Cirugías Previas (🏥 Purple)
```

### Tabs Navigation
```
Style: Underline tabs
Active: Primary 500, 3px underline
Inactive: Gray 600
Hover: Primary 300

Layout: Horizontal scroll on mobile
```

### Timeline Item
```
Circle indicator: 12px, Primary 500
Line: 2px, Gray 300, vertical
Card on hover: Elevated shadow
Click: Navigate to note detail
```

### Action Bar Buttons
```
[✏️ Editar]: Ghost button
[📝 Nueva Nota]: Primary button
[📅 Nueva Cita]: Outline button
[⋮ Más]: Icon button → Dropdown menu
```
