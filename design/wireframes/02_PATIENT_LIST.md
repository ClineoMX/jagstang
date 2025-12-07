# Wireframe: Lista de Pacientes

**Ruta:** `/patients`
**User Stories:** 3.1, 3.2, 3.3, 6.5
**Prioridad:** Alta

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │                    PATIENT LIST                                │
│         │                                                                 │
│         │  ┌──────────────────────────────────────────────────────────┐ │
│         │  │ Pacientes                        [+ Nuevo Paciente]      │ │
│         │  ├──────────────────────────────────────────────────────────┤ │
│         │  │ 🔍 [Buscar por nombre, expediente o teléfono...    ]    │ │
│         │  │                                                          │ │
│         │  │ [⚙️ Filtros ▼] [📊 Ordenar: Nombre ▼]               │ │
│         │  └──────────────────────────────────────────────────────────┘ │
│         │                                                                 │
│         │  ┌──────────────────────────────────────────────────────────┐ │
│         │  │ 245 pacientes encontrados                                 │ │
│         │  ├──────────────────────────────────────────────────────────┤ │
│         │  │ ┌──────────────────────────────────────────────────────┐ │ │
│         │  │ │ 👤 GARCÍA LÓPEZ, María                               │ │ │
│         │  │ │    EXP-2024-00123 | 45 años | F                      │ │ │
│         │  │ │    Última consulta: 5 de Dic, 2025                   │ │ │
│         │  │ │    Diabetes Tipo 2 | 🔴 Alergia: Penicilina         │ │ │
│         │  │ └──────────────────────────────────────────────────────┘ │ │
│         │  │ ┌──────────────────────────────────────────────────────┐ │ │
│         │  │ │ 👤 LÓPEZ MARTÍNEZ, Pedro                             │ │ │
│         │  │ │    EXP-2024-00124 | 32 años | M                      │ │ │
│         │  │ │    Última consulta: 4 de Dic, 2025                   │ │ │
│         │  │ │    Hipertensión                                      │ │ │
│         │  │ └──────────────────────────────────────────────────────┘ │ │
│         │  │ ┌──────────────────────────────────────────────────────┐ │ │
│         │  │ │ 👤 MARTÍNEZ RUIZ, Ana                                │ │ │
│         │  │ │    EXP-2024-00125 | 28 años | F                      │ │ │
│         │  │ │    Última consulta: 3 de Dic, 2025                   │ │ │
│         │  │ └──────────────────────────────────────────────────────┘ │ │
│         │  │                                                           │ │
│         │  │ [Cargar más...]                                          │ │
│         │  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Especificaciones de Componentes

### Búsqueda en Tiempo Real
- Placeholder: "Buscar por nombre, expediente o teléfono..."
- Icon: Lupa (left side)
- Delay: 300ms después del último keystroke
- Mínimo: 2 caracteres
- Highlight: Coincidencias resaltadas en resultados

### Filtros Dropdown
```
⚙️ Filtros
├─ Estado
│  ├─ ☑ Activos
│  ├─ ☐ Archivados
│  └─ ☐ Todos
├─ Género
│  ├─ ☐ Masculino
│  ├─ ☐ Femenino
│  └─ ☐ Otro
├─ Rango de Edad
│  ├─ ☐ 0-18
│  ├─ ☐ 19-35
│  ├─ ☐ 36-60
│  └─ ☐ 60+
└─ [Aplicar] [Limpiar]
```

### Patient Card
```
Background: Surface
Border: 1px Border
Border Radius: 8px
Padding: 16px
Hover: Gray 50 bg + elevated shadow
Cursor: pointer

Layout:
- Avatar (48px) | Name (H4, Bold)
- Metadata line (Caption, Gray 500)
- Last visit (Body Small, Gray 600)
- Conditions/Allergies (Badges)
```

### Empty State
```
┌──────────────────────────────────┐
│           👥                     │
│   No se encontraron pacientes    │
│   que coincidan con tu búsqueda  │
│                                  │
│   [Limpiar búsqueda]            │
└──────────────────────────────────┘
```
