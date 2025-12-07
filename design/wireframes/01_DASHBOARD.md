# Wireframe: Dashboard Principal

**Ruta:** `/`
**User Stories:** 2.1, 2.2, 2.3
**Prioridad:** Alta

---

## Layout General

```
┌─────────────────────────────────────────────────────────────────────┐
│  SIDEBAR  │                    MAIN CONTENT                         │
│  (280px)  │                                                          │
│           │                                                          │
│   🏥      │  ┌──────────────────────────────────────────────────┐  │
│ Jagstang  │  │  HEADER                                          │  │
│  [≡]      │  │  Dashboard                                       │  │
│           │  │  Viernes, 7 de diciembre de 2025                │  │
│           │  │                                                  │  │
│ ┌───────┐ │  │  [+ Nuevo Paciente]  [+ Nueva Cita]            │  │
│ │🏠 Dash│ │  └──────────────────────────────────────────────────┘  │
│ └───────┘ │                                                          │
│           │  ┌──────────────────────────────────────────────────┐  │
│ 👥 Pac... │  │  MÉTRICAS RÁPIDAS (3 columnas)                   │  │
│           │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│ 📅 Cal... │  │  │📅 Citas │ │👥 Pac.. │ │📝 Notas│            │  │
│           │  │  │  Hoy    │ │  Total  │ │ Creadas│            │  │
│ 📊 Cum... │  │  │   8     │ │   245   │ │  1,234 │            │  │
│           │  │  │ 6 conf. │ │En sist. │ │ Total  │            │  │
│           │  │  └─────────┘ └─────────┘ └─────────┘            │  │
│───────────│  └──────────────────────────────────────────────────┘  │
│           │                                                          │
│ 🌙        │  ┌─────────────────────┬────────────────────────────┐  │
│           │  │ PRÓXIMAS CITAS      │ PACIENTES RECIENTES        │  │
│ ┌───────┐ │  │ Ver calendario →    │ Ver todos →                │  │
│ │ Dr.   │ │  │                     │                            │  │
│ │ José  │ │  │ ┌─────────────────┐ │ ┌────────────────────────┐ │  │
│ │ López │ │  │ │ 👤 María García │ │ │ 👤 Carlos Ruiz         │ │  │
│ │       │ │  │ │ 7 Dic, 10:00    │ │ │ Última: 5 de Dic       │ │  │
│ │ ⚙️ Mi │ │  │ │ 🟢 Confirmada   │ │ └────────────────────────┘ │  │
│ │ 🚪Salir│ │  │ └─────────────────┘ │ ┌────────────────────────┐ │  │
│ └───────┘ │  │ ┌─────────────────┐ │ │ 👤 Ana Martínez        │ │  │
│           │  │ │ 👤 Pedro López  │ │ │ Última: 4 de Dic       │ │  │
│           │  │ │ 7 Dic, 11:30    │ │ └────────────────────────┘ │  │
│           │  │ │ 🟡 Pendiente    │ │ ┌────────────────────────┐ │  │
│           │  │ └─────────────────┘ │ │ 👤 Luis Hernández      │ │  │
│           │  │                     │ │ Última: 3 de Dic       │ │  │
│           │  │ [Ver todas...]      │ │ └────────────────────────┘ │  │
│           │  └─────────────────────┴────────────────────────────┘  │
│           │                                                          │
│           │  ┌──────────────────────────────────────────────────┐  │
│           │  │ ÚLTIMAS NOTAS MÉDICAS                             │  │
│           │  │                                                   │  │
│           │  │ ┌──────────────────────────────────────────────┐ │  │
│           │  │ │ 👤 Consulta General - María García           │ │  │
│           │  │ │    7 de Dic, 09:45                           │ │  │
│           │  │ │    ✅ Firmado por Dr. José López el 7/12     │ │  │
│           │  │ └──────────────────────────────────────────────┘ │  │
│           │  │ ┌──────────────────────────────────────────────┐ │  │
│           │  │ │ 👤 Control Diabetes - Pedro López            │ │  │
│           │  │ │    6 de Dic, 16:30                           │ │  │
│           │  │ │    ✅ Firmado por Dr. José López el 6/12     │ │  │
│           │  │ └──────────────────────────────────────────────┘ │  │
│           │  │ ┌──────────────────────────────────────────────┐ │  │
│           │  │ │ 👤 Primera Consulta - Ana Martínez           │ │  │
│           │  │ │    6 de Dic, 11:00                           │ │  │
│           │  │ └──────────────────────────────────────────────┘ │  │
│           │  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Componentes Detallados

### 1. Header Section

```
┌──────────────────────────────────────────────────────────┐
│ Dashboard                                                 │
│ Viernes, 7 de diciembre de 2025                          │
│                                                           │
│ [+ Nuevo Paciente]  [+ Nueva Cita]                       │
└──────────────────────────────────────────────────────────┘

Especificaciones:
- Background: Surface (#FFFFFF)
- Border Bottom: 1px solid Border (#E5E7EB)
- Padding: 32px
- Title: H2 (30px, Bold, Gray 900)
- Date: Body (16px, Regular, Gray 500)
- Buttons: Primary (Nuevo Paciente), Outline (Nueva Cita)
```

### 2. Métricas Rápidas (Stats Cards)

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ 📅 Citas Hoy  │  │ 👥 Pacientes   │  │ 📝 Notas      │
│                │  │    Total       │  │    Creadas    │
│      8         │  │     245        │  │    1,234      │
│  6 confirmadas │  │  En sistema    │  │    Total      │
└────────────────┘  └────────────────┘  └────────────────┘

Cada Card:
- Background: Surface (#FFFFFF)
- Border: 1px solid Border
- Border Radius: 12px
- Padding: 24px
- Box Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Icon: 20px, Primary 500
- Label: Body Small (14px, Gray 600)
- Value: H1 (36px, Bold, Gray 900)
- Sub-text: Caption (12px, Gray 500)
```

### 3. Próximas Citas Card

```
┌─────────────────────────────────────────┐
│ Próximas Citas            Ver todo →    │
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  María García                    │ │
│ │     7 Dic, 10:00 hrs                │ │
│ │                   🟢 Confirmada     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Pedro López                     │ │
│ │     7 Dic, 11:30 hrs                │ │
│ │                   🟡 Pendiente      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Ana Martínez                    │ │
│ │     7 Dic, 14:00 hrs                │ │
│ │                   🟢 Confirmada     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Ver todas las citas]                   │
└─────────────────────────────────────────┘

Card Container:
- Background: Surface
- Border: 1px solid Border
- Border Radius: 12px
- Padding: 24px

Header:
- Title: H4 (20px, Semibold)
- Link: Body Small (14px, Primary 500)
- Border Bottom: 1px solid Border
- Padding Bottom: 16px

Appointment Item:
- Padding: 12px
- Border: 1px solid Border
- Border Radius: 8px
- Margin: 12px 0
- Hover: Background → Gray 50
- Cursor: pointer

Avatar:
- Size: 32px
- Border Radius: 50%

Badge (Estado):
- Confirmada: Green background, Green text
- Pendiente: Orange background, Orange text
- Cancelada: Red background, Red text
```

### 4. Pacientes Recientes Card

```
┌─────────────────────────────────────────┐
│ Pacientes Recientes       Ver todos →   │
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Carlos Ruiz                     │ │
│ │     Última visita: 5 de Dic         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Ana Martínez                    │ │
│ │     Última visita: 4 de Dic         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Luis Hernández                  │ │
│ │     Última visita: 3 de Dic         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Sofía Torres                    │ │
│ │     Última visita: 2 de Dic         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤  Miguel Ángel Sánchez            │ │
│ │     Última visita: 1 de Dic         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Especificaciones similares a "Próximas Citas"
- Patient Item es clickable → Navega a /patients/:id
```

### 5. Últimas Notas Médicas Card

```
┌───────────────────────────────────────────────────────┐
│ Últimas Notas Médicas                                 │
├───────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ 👤  Consulta General - María García                ││
│ │     7 de Dic, 09:45                                ││
│ │                                                     ││
│ │     ✅ Firmado por Dr. José López el 7 de Dic     ││
│ └────────────────────────────────────────────────────┘│
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ 👤  Control Diabetes - Pedro López                 ││
│ │     6 de Dic, 16:30                                ││
│ │                                                     ││
│ │     ✅ Firmado por Dr. José López el 6 de Dic     ││
│ └────────────────────────────────────────────────────┘│
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ 👤  Primera Consulta - Ana Martínez                ││
│ │     6 de Dic, 11:00                                ││
│ └────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────┘

Note Item:
- Padding: 16px
- Border: 1px solid Border
- Border Radius: 8px
- Margin: 12px 0
- Hover: Background → Gray 50, Box Shadow elevado
- Cursor: pointer

Title: Body (16px, Medium, Gray 900)
Date: Body Small (14px, Gray 500)
Signed Badge: Badge with green checkmark
```

---

## Estados y Comportamientos

### Estado de Carga (Loading)

```
┌──────────────────────────────────────┐
│ Dashboard                             │
│ [Skeleton de fecha]                  │
│                                       │
│ [Skeleton button] [Skeleton button]  │
├──────────────────────────────────────┤
│                                       │
│ [Skeleton Card] [Skeleton Card] [...]│
│                                       │
│ ┌──────────┬─────────────────────┐   │
│ │[Skeleton]│[Skeleton de lista]  │   │
│ │[lines]   │                     │   │
│ └──────────┴─────────────────────┘   │
└──────────────────────────────────────┘
```

### Estado Vacío - Sin Citas Hoy

```
┌─────────────────────────────────────────┐
│ Próximas Citas            Ver todo →    │
├─────────────────────────────────────────┤
│                                          │
│         📅                               │
│                                          │
│    No hay citas programadas para hoy    │
│                                          │
│         [+ Nueva Cita]                  │
│                                          │
└─────────────────────────────────────────┘
```

### Estado Vacío - Sin Pacientes

```
┌─────────────────────────────────────────┐
│ Pacientes Recientes       Ver todos →   │
├─────────────────────────────────────────┤
│                                          │
│         👥                               │
│                                          │
│     No hay pacientes registrados        │
│                                          │
│      [+ Nuevo Paciente]                 │
│                                          │
└─────────────────────────────────────────┘
```

### Interacciones

#### Click en Cita
```
Acción: Navegar a /patients/:patientId
Efecto Hover: Background Gray 50, Box Shadow sube
```

#### Click en Paciente
```
Acción: Navegar a /patients/:id
Efecto Hover: Background Gray 50, Box Shadow sube
```

#### Click en Nota
```
Acción: Navegar a /patients/:patientId (scroll to notes)
Efecto Hover: Background Gray 50, Box Shadow sube
```

#### Click en "Nuevo Paciente"
```
Acción: Navegar a /patients/new
Botón: Primary style
```

#### Click en "Nueva Cita"
```
Acción: Abrir modal de nueva cita
Botón: Outline style
```

---

## Responsive Behavior

### Desktop (> 1024px)
```
- Sidebar: 280px expandido
- Métricas: 3 columnas
- Próximas Citas + Pacientes: 2 columnas (50/50)
- Últimas Notas: Full width
```

### Tablet (768px - 1024px)
```
- Sidebar: 80px colapsado
- Métricas: 3 columnas (más compactas)
- Próximas Citas + Pacientes: Stack verticalmente
- Últimas Notas: Full width
```

### Mobile (< 768px)
```
- Sidebar: Hidden (hamburger menu)
- Header: Compacto, botones full width
- Métricas: 1 columna
- Todas las secciones: Stack verticalmente
- Padding reducido a 16px
```

---

## Datos de Ejemplo

### Citas de Hoy
```javascript
[
  {
    id: "apt-001",
    patient: "María García",
    time: "10:00",
    status: "confirmed", // 🟢
    reason: "Consulta general"
  },
  {
    id: "apt-002",
    patient: "Pedro López",
    time: "11:30",
    status: "pending", // 🟡
    reason: "Control diabetes"
  },
  {
    id: "apt-003",
    patient: "Ana Martínez",
    time: "14:00",
    status: "confirmed", // 🟢
    reason: "Revisión postoperatoria"
  }
]
```

### Pacientes Recientes
```javascript
[
  {
    id: "pat-001",
    name: "Carlos Ruiz",
    lastVisit: "2025-12-05",
    avatar: "url..."
  },
  // ...
]
```

---

## Métricas y KPIs

**User Story Compliance:**
- ✅ 2.1: Overview of consultation day
- ✅ 2.2: Quick access to frequent actions
- ✅ 2.3: Critical information always visible

**Performance Targets:**
- Load time: < 2s
- Time to interactive: < 3s
- Smooth animations: 60fps

**Usability:**
- Clics para crear nota: 3 (desde paciente reciente)
- Clics para nueva cita: 1
- Clics para ver paciente: 1
