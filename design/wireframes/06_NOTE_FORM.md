# Wireframe: Creación de Nota Clínica

**Ruta:** `/patients/:patientId/notes/new`
**User Stories:** 4.1, 4.2, 4.3, 4.4
**Prioridad:** Alta (Flujo más común)

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  NUEVA NOTA CLÍNICA                                            │
│         │                                                                  │
│         │  Dashboard > Pacientes > María García > Nueva Nota Clínica     │
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ Nueva Nota Clínica - María García López (45 años, F)       ││
│         │  │ EXP-2024-00123                                              ││
│         │  │                                                             ││
│         │  │ [📋 Usar Plantilla ▼]              Autoguardado hace 30s ⏺││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ INFORMACIÓN CRÍTICA DEL PACIENTE (Referencia rápida)       ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ 🔴 Alergias: Penicilina (Grave), Sulfonamidas              ││
│         │  │ 🟡 Enfermedades: Diabetes Tipo 2, Hipertensión             ││
│         │  │ 💊 Medicamentos: Metformina 850mg c/12h, Losartán 50mg/día ││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ━━━ SECCIÓN 1: INFORMACIÓN GENERAL ━━━                     ││
│         │  │                                                             ││
│         │  │ Fecha y Hora *                                              ││
│         │  │ [📅 07/12/2025] [🕐 14:30]                                 ││
│         │  │                                                             ││
│         │  │ Tipo de Nota *                                              ││
│         │  │ (●) Consulta General  ( ) Nota de Evolución                ││
│         │  │ ( ) Primera Consulta  ( ) Control                          ││
│         │  │                                                             ││
│         │  │ Título de la Nota *                                         ││
│         │  │ [Control mensual de diabetes                            ]  ││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ━━━ SECCIÓN 2: MOTIVO DE CONSULTA ━━━   ✓ Completo        ││
│         │  │                                                             ││
│         │  │ Motivo de Consulta * (Interrogatorio)                       ││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ [Toolbar: B I U • 1. → ⊕]                             │││
│         │  │ │                                                         │││
│         │  │ │ Paciente acude a control mensual de diabetes.          │││
│         │  │ │ Refiere buen apego al tratamiento. Sin síntomas        │││
│         │  │ │ de hipoglucemia o hiperglucemia.                       │││
│         │  │ │                                                         │││
│         │  │ │                                                         │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  │                                                             ││
│         │  │ 💡 Sugerencia: Describe el padecimiento actual del paciente││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ━━━ SECCIÓN 3: EXPLORACIÓN FÍSICA ━━━   ⚠️ Incompleto     ││
│         │  │                                                             ││
│         │  │ Signos Vitales                                              ││
│         │  │ ┌──────────┬──────────┬──────────┬──────────┐             ││
│         │  │ │ Presión  │ Frecuen. │ Frecuen. │ Temp.    │             ││
│         │  │ │ Arterial │ Cardíaca │ Respir.  │ Corporal │             ││
│         │  │ ├──────────┼──────────┼──────────┼──────────┤             ││
│         │  │ │ [120/80] │ [72   ]  │ [16   ]  │ [36.5 ]  │             ││
│         │  │ │ mmHg     │ lpm      │ rpm      │ °C       │             ││
│         │  │ └──────────┴──────────┴──────────┴──────────┘             ││
│         │  │                                                             ││
│         │  │ Peso         Talla        IMC (auto-calculado)             ││
│         │  │ [68.5  ] kg  [1.60  ] m   [26.8] (Sobrepeso)              ││
│         │  │                                                             ││
│         │  │ Exploración Física General * (Descripción)                  ││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ [Toolbar: B I U • 1. → ⊕]                             │││
│         │  │ │                                                         │││
│         │  │ │ Paciente consciente, orientado, cooperador.            │││
│         │  │ │ Buena coloración de piel y mucosas.                    │││
│         │  │ │ Cardiopulmonar sin compromiso.                         │││
│         │  │ │                                                         │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ━━━ SECCIÓN 4: DIAGNÓSTICO ━━━   ⚠️ Incompleto            ││
│         │  │                                                             ││
│         │  │ Diagnóstico Principal * (CIE-10)                            ││
│         │  │ [🔍 Buscar diagnóstico o código CIE-10...            ▼]   ││
│         │  │                                                             ││
│         │  │ Seleccionado:                                               ││
│         │  │ • E11.9 - Diabetes Mellitus Tipo 2 sin complicaciones      ││
│         │  │   [Eliminar]                                                ││
│         │  │                                                             ││
│         │  │ Diagnósticos Secundarios (Opcional)                         ││
│         │  │ • I10 - Hipertensión Arterial Esencial                      ││
│         │  │   [Eliminar]                                                ││
│         │  │ [+ Agregar diagnóstico secundario]                          ││
│         │  │                                                             ││
│         │  │ Notas del Diagnóstico (Opcional)                            ││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ Diabetes tipo 2 en buen control metabólico.            │││
│         │  │ │ HbA1c último mes: 6.8%                                 │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ━━━ SECCIÓN 5: TRATAMIENTO ━━━   ✓ Completo               ││
│         │  │                                                             ││
│         │  │ Medicamentos Prescritos                                     ││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ 💊 Metformina                                           │││
│         │  │ │    Dosis: 850mg | Vía: Oral | Frecuencia: Cada 12 hrs  │││
│         │  │ │    Duración: Continuar | Indicaciones: Con alimentos    │││
│         │  │ │    [Editar] [Eliminar]                                  │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ 💊 Losartán                                             │││
│         │  │ │    Dosis: 50mg | Vía: Oral | Frecuencia: Cada 24 hrs   │││
│         │  │ │    Duración: Continuar | Indicaciones: En ayunas        │││
│         │  │ │    [Editar] [Eliminar]                                  │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  │ [+ Agregar medicamento]                                     ││
│         │  │                                                             ││
│         │  │ Indicaciones y Recomendaciones *                            ││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ - Continuar con dieta baja en carbohidratos simples    │││
│         │  │ │ - Ejercicio 30 min diarios                             │││
│         │  │ │ - Monitoreo de glucosa capilar en ayunas              │││
│         │  │ │ - Acudir a laboratorio para HbA1c en 30 días          │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ━━━ SECCIÓN 6: PLAN Y SEGUIMIENTO ━━━                      ││
│         │  │                                                             ││
│         │  │ Próxima Cita (Opcional)                                     ││
│         │  │ ☑ Agendar cita de seguimiento                              ││
│         │  │ Fecha sugerida: [06/01/2026] (30 días)                     ││
│         │  │                                                             ││
│         │  │ Estudios Solicitados (Opcional)                             ││
│         │  │ ☑ Hemoglobina Glucosilada (HbA1c)                          ││
│         │  │ ☑ Química Sanguínea                                        ││
│         │  │ ☐ Perfil de lípidos                                        ││
│         │  │                                                             ││
│         │  │ Notas Adicionales                                           ││
│         │  │ ┌─────────────────────────────────────────────────────────┐││
│         │  │ │ Paciente con buen apego. Reforzar importancia de       │││
│         │  │ │ ejercicio y dieta.                                     │││
│         │  │ └─────────────────────────────────────────────────────────┘││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ PROGRESO: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 85%          ││
│         │  │ ⚠️ Faltan campos requeridos: Diagnóstico completo          ││
│         │  │                                                             ││
│         │  │ [Cancelar]  [Guardar Borrador]  [Guardar y Firmar]        ││
│         │  └────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Modal: Usar Plantilla

```
┌──────────────────────────────────────────────┐
│ Seleccionar Plantilla                   [X] │
├──────────────────────────────────────────────┤
│ 🔍 [Buscar plantilla...]                     │
│                                              │
│ MIS PLANTILLAS                               │
│ ┌──────────────────────────────────────────┐│
│ │ 📋 Control de Diabetes                   ││
│ │    Última actualización: hace 1 mes      ││
│ │    [Usar esta plantilla]                 ││
│ └──────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │ 📋 Consulta General                      ││
│ │    Última actualización: hace 2 meses    ││
│ │    [Usar esta plantilla]                 ││
│ └──────────────────────────────────────────┘│
│                                              │
│ PLANTILLAS DEL SISTEMA                       │
│ ┌──────────────────────────────────────────┐│
│ │ 📋 Primera Consulta                      ││
│ │    Plantilla estándar                    ││
│ │    [Usar esta plantilla]                 ││
│ └──────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │ 📋 Nota de Evolución                     ││
│ │    Plantilla estándar                    ││
│ │    [Usar esta plantilla]                 ││
│ └──────────────────────────────────────────┘│
│                                              │
│ [+ Crear nueva plantilla desde esta nota]   │
│                                              │
├──────────────────────────────────────────────┤
│                        [Cancelar] [Vacío]   │
└──────────────────────────────────────────────┘
```

---

## Modal: Confirmar Guardar y Firmar

```
┌──────────────────────────────────────────────┐
│ Guardar y Firmar Nota Clínica           [X] │
├──────────────────────────────────────────────┤
│                                              │
│ ⚠️ Una vez firmada, la nota no podrá ser    │
│    editada sin dejar registro de auditoría. │
│                                              │
│ Resumen de la nota:                          │
│ ─────────────────────────────────────────   │
│ Paciente: María García López                 │
│ Tipo: Control mensual de diabetes            │
│ Fecha: 7 de Diciembre, 2025 14:30           │
│ Diagnóstico: E11.9 - Diabetes Tipo 2         │
│                                              │
│ ☑ He revisado la nota y confirmo que la     │
│   información es correcta y completa         │
│                                              │
│ Firma Digital                                │
│ ┌──────────────────────────────────────────┐│
│ │ Dr. José López Martínez                  ││
│ │ Cédula Profesional: 12345678             ││
│ │ Certificado vigente hasta: 15/06/2026    ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Contraseña de firma *                        │
│ [●●●●●●●●●●●●●●●●]                          │
│                                              │
├──────────────────────────────────────────────┤
│                   [Cancelar] [Firmar Nota]  │
└──────────────────────────────────────────────┘
```

---

## Especificaciones de Componentes

### Rich Text Editor (TipTap)
```
Toolbar:
- Bold, Italic, Underline
- Bullet list, Numbered list
- Indent/Outdent
- Insert special characters

Features:
- Auto-save every 30s
- Undo/Redo (Ctrl+Z, Ctrl+Y)
- Character count
- Spell check
- Medical terminology autocomplete

Min Height: 120px
Border: 1px solid Border
Border Radius: 8px
Focus: 2px Primary 500
```

### Progress Indicator
```
Type: Linear progress bar
Height: 8px
Background: Gray 200
Fill: Primary 500
Border Radius: 4px

Calculation:
- Required fields filled: +points
- Optional sections filled: +bonus points
- Display percentage below bar
- Warning if < 100% and trying to save & sign
```

### Section Headers
```
Style: H4 (20px, Semibold)
Divider: Thick line (━━━)
Right indicator: Status
  ✓ Completo: Green
  ⚠️ Incompleto: Orange
  • Sin empezar: Gray

Collapsible: Click to expand/collapse
Default: All expanded
```

### Medication Card
```
Background: Surface
Border: 1px Border
Border Radius: 8px
Padding: 16px

Layout:
- Icon: 💊 (20px)
- Name: Body (16px, Medium)
- Details: Grid layout
  - Dosis | Vía | Frecuencia
  - Duración | Indicaciones
- Actions: [Editar] [Eliminar] (ghost buttons)

Hover: Elevated shadow
```

### Autoguardado Indicator
```
Position: Top right of form
States:
- "Guardando..." (with spinner)
- "Autoguardado hace Xs" (with checkmark)
- "Error al guardar" (with error icon)

Update: Every 30 seconds
Icon: Animated pulse when saving
```

### Validation
```
Real-time:
- On blur of required fields
- Show error message below field
- Red border on invalid field
- Red asterisk (*) on required labels

On Submit:
- Validate all required fields
- Scroll to first error
- Show summary of errors
- Prevent submit if incomplete
```

---

## Estados y Comportamientos

### Autoguardado
```
Trigger: Every 30 seconds of inactivity
Save: Draft to localStorage or backend
Indicator: "Autoguardado hace Xs"
Restore: On page reload if draft exists

Modal on reload:
┌────────────────────────────────────────┐
│ Restaurar Borrador                     │
├────────────────────────────────────────┤
│ Encontramos un borrador sin terminar   │
│ de hace 5 minutos.                     │
│                                        │
│ ¿Deseas recuperarlo?                   │
│                                        │
│ [Descartar] [Recuperar borrador]      │
└────────────────────────────────────────┘
```

### Advertencia al Salir
```
If unsaved changes:
┌────────────────────────────────────────┐
│ ⚠️ Cambios sin guardar                │
├────────────────────────────────────────┤
│ Tienes cambios sin guardar.            │
│ ¿Estás seguro de que quieres salir?   │
│                                        │
│ [Cancelar] [Salir sin guardar]        │
└────────────────────────────────────────┘
```

### Búsqueda de Diagnóstico CIE-10
```
Input: Type-ahead search
Debounce: 300ms
Results: Dropdown list

Format:
[Código] - [Descripción]
E11.9 - Diabetes Mellitus Tipo 2 sin complicaciones

Max results: 10
Click: Add to diagnosis
Multiple: Primary (1) + Secundarios (multiple)
```

---

## Tiempo Estimado de Completado

**Objetivo:** < 3 minutos para nota estándar
**Breakdown:**
- Información general: 30s
- Motivo: 45s
- Exploración física: 60s
- Diagnóstico: 30s
- Tratamiento: 45s
- Plan: 30s
Total: ~4 minutos (con plantilla: ~2 minutos)

---

## Validación NOM-004

**Campos Requeridos (Compliance):**
✅ Fecha y hora
✅ Tipo de nota
✅ Motivo de consulta
✅ Exploración física
✅ Diagnóstico (con CIE-10)
✅ Tratamiento e indicaciones
✅ Firma digital

**Opcionales pero Recomendados:**
- Signos vitales completos
- Diagnósticos secundarios
- Estudios solicitados
- Próxima cita
