# Wireframe: Calendario de Citas

**Ruta:** `/calendar`
**User Stories:** 7.1, 7.2, 7.3, 7.4
**Prioridad:** Alta

---

## Layout - Vista Mensual

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  CALENDAR                                                        │
│         │                                                                   │
│   (80px)│  ┌────────────────────────────────────────────────────────────┐ │
│         │  │ Calendario                                                  │ │
│         │  │                                                             │ │
│         │  │ [← Anterior]  DICIEMBRE 2025  [Siguiente →]  [Hoy]        │ │
│         │  │                                                             │ │
│         │  │ [Día] [Semana] [Mes ←] [+ Nueva Cita]                     │ │
│         │  └────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │  ┌─────────┬─────────────────────────────────────────────────┐  │
│         │  │ SIDEBAR │           CALENDAR GRID                         │  │
│         │  │  List   │                                                 │  │
│         │  │ (300px) │  Lun  Mar  Mié  Jue  Vie  Sáb  Dom            │  │
│         │  ├─────────┼─────────────────────────────────────────────────┤  │
│         │  │ Hoy:    │  1    2    3    4    5    6    7              │  │
│         │  │ Vie 7   │       8    9   10   11   12   13   14             │  │
│         │  │         │      15   16   17   18   19   20   21             │  │
│         │  │ ┌─────┐ │      22   23   24   25   26   27   28             │  │
│         │  │ │10:00│ │      29   30   31                                  │  │
│         │  │ │María│ │                                                    │  │
│         │  │ │García│ │  ┌─────┐                                          │  │
│         │  │ └─────┘ │  │  7  │ ← Día actual (destacado)                │  │
│         │  │         │  │ ●●● │ ← 3 citas hoy                            │  │
│         │  │ ┌─────┐ │  └─────┘                                          │  │
│         │  │ │11:30│ │                                                    │  │
│         │  │ │Pedro│ │  Ejemplos de días con citas:                      │  │
│         │  │ │López│ │                                                    │  │
│         │  │ └─────┘ │  ┌─────┐  ┌─────┐  ┌─────┐                       │  │
│         │  │         │  │ 10  │  │ 15  │  │ 20  │                       │  │
│         │  │ ┌─────┐ │  │  ●  │  │ ●●  │  │  ●  │                       │  │
│         │  │ │14:00│ │  └─────┘  └─────┘  └─────┘                       │  │
│         │  │ │Ana  │ │  1 cita   2 citas  1 cita                        │  │
│         │  │ │Mart.│ │                                                    │  │
│         │  │ └─────┘ │                                                    │  │
│         │  │         │                                                    │  │
│         │  │ [+ Cita]│                                                    │  │
│         │  └─────────┴─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Vista Semanal

```
┌────────────────────────────────────────────────────────────────────┐
│  [← Anterior]  7 - 13 de Diciembre 2025  [Siguiente →]  [Hoy]    │
│  [Día] [Semana ←] [Mes] [+ Nueva Cita]                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Hora │ Lun 7  │ Mar 8  │ Mié 9  │ Jue 10 │ Vie 11 │ Sáb 12│ Dom 13│
├──────┼────────┼────────┼────────┼────────┼────────┼────────┼───────┤
│ 8:00 │        │        │        │        │        │        │       │
│ 8:30 │        │        │        │        │        │        │       │
│ 9:00 │        │ ┌────┐ │        │        │        │        │       │
│ 9:30 │        │ │Ana │ │        │        │        │        │       │
│10:00 │ ┌────┐ │ │Ruiz│ │        │ ┌────┐ │        │        │       │
│10:30 │ │María│ │ └────┘ │        │ │Luis│ │        │        │       │
│11:00 │ │G.  │ │        │        │ │H.  │ │        │        │       │
│11:30 │ └────┘ │ ┌────┐ │        │ └────┘ │        │        │       │
│12:00 │ ┌────┐ │ │Pedro│ │        │        │        │        │       │
│12:30 │ │Ana │ │ │L.  │ │        │        │        │        │       │
│13:00 │ │M.  │ │ └────┘ │        │        │        │        │       │
│ ...  │ └────┘ │        │        │        │        │        │       │
└──────┴────────┴────────┴────────┴────────┴────────┴────────┴───────┘
```

---

## Modal: Nueva Cita

```
┌──────────────────────────────────────────────┐
│ Nueva Cita                              [X]  │
├──────────────────────────────────────────────┤
│                                               │
│ Paciente *                                    │
│ [🔍 Buscar paciente...               ▼]     │
│                                               │
│ Fecha *                                       │
│ [📅 07/12/2025                       📅]     │
│                                               │
│ Hora de inicio *          Duración            │
│ [🕐 10:00    ▼]          [⏱️ 30 min ▼]      │
│                                               │
│ Motivo de la cita *                           │
│ [Consulta general                    ▼]     │
│                                               │
│ Notas adicionales (opcional)                  │
│ ┌───────────────────────────────────────┐    │
│ │                                       │    │
│ │                                       │    │
│ │                                       │    │
│ └───────────────────────────────────────┘    │
│                                               │
│ Estado                                        │
│ (●) Confirmada  ( ) Pendiente                │
│                                               │
├──────────────────────────────────────────────┤
│              [Cancelar]  [Guardar Cita]     │
└──────────────────────────────────────────────┘
```

---

## Modal: Detalle de Cita (Click en cita existente)

```
┌──────────────────────────────────────────────┐
│ Detalles de la Cita                     [X]  │
├──────────────────────────────────────────────┤
│                                               │
│ 👤 María García López                        │
│    EXP-2024-00123                            │
│                                               │
│ 📅 Viernes, 7 de Diciembre de 2025          │
│ 🕐 10:00 - 10:30 hrs (30 minutos)           │
│                                               │
│ 📋 Motivo: Consulta General                  │
│                                               │
│ 🟢 Estado: Confirmada                        │
│                                               │
│ ───────────────────────────────────────────  │
│                                               │
│ Notas:                                        │
│ Control mensual de diabetes                   │
│                                               │
│ ───────────────────────────────────────────  │
│                                               │
│ [Ver Expediente]                             │
│                                               │
├──────────────────────────────────────────────┤
│ [Cancelar Cita] [Editar] [Nueva Nota]       │
└──────────────────────────────────────────────┘
```

---

## Especificaciones

### Calendario - Día del Mes
```
Size: 60px x 60px (desktop), 40px (mobile)
Border Radius: 8px
Padding: 8px

Estados:
- Hoy: Border 2px Primary 500, Background Primary 50
- Con citas: Dots/indicators debajo del número
- Hover: Background Gray 50
- Seleccionado: Background Primary 100

Indicators:
● = 1 cita
●● = 2 citas
●●● = 3+ citas
Color: Primary 500
```

### Sidebar - Lista del Día
```
Background: Surface
Border Right: 1px Border
Width: 300px (desktop), colapsable
Padding: 24px

Appointment Card:
- Time: H5 (18px, Semibold, Primary 500)
- Patient: Body (16px, Medium)
- Duration: Caption (12px, Gray 500)
- Status badge: Colored pill
- Hover: Elevated shadow, Background Gray 50
```

### Vista Semanal - Time Slots
```
Row Height: 60px (per 30 min slot)
Appointment Block:
- Background: Primary 50
- Border Left: 4px Primary 500
- Padding: 8px
- Text: Patient name + reason
- Hover: Darken background
- Click: Open detail modal
```

### Estados de Citas
```
🟢 Confirmada: Green
🟡 Pendiente: Orange
🔴 Cancelada: Red (tachado)
```
