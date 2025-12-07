# Wireframe: Dashboard de Cumplimiento Normativo

**Ruta:** `/compliance`
**User Stories:** 8.1, 8.2, 8.3, 8.4
**Prioridad:** Alta (NUEVO)

---

## Layout Principal

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  COMPLIANCE DASHBOARD                                           │
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ Dashboard de Cumplimiento Normativo                         ││
│         │  │ Última actualización: 7 de Dic 2025, 14:30                 ││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌──────────────────────┬──────────────────────┬──────────────┐│
│         │  │ 📊 GENERAL           │ 📋 NOM-004           │ 🔒 NOM-024   ││
│         │  ├──────────────────────┼──────────────────────┼──────────────┤│
│         │  │  Cumplimiento        │  Expediente Clínico  │  Sistemas    ││
│         │  │     Global           │                      │  de Info.    ││
│         │  │                      │                      │              ││
│         │  │      92%             │       95%            │     88%      ││
│         │  │  ────────────        │  ────────────        │ ──────────── ││
│         │  │  🟢 Cumple           │  🟢 Cumple           │ 🟡 En Riesgo││
│         │  │                      │                      │              ││
│         │  │  2 issues            │  1 issue             │  3 issues    ││
│         │  │  pendientes          │  pendiente           │  pendientes  ││
│         │  └──────────────────────┴──────────────────────┴──────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ⚠️ ALERTAS ACTIVAS (3)                  [Ver todas →]     ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ ┌────────────────────────────────────────────────────────┐││
│         │  │ │ 🔴 CRÍTICO                                             │││
│         │  │ │ Faltan firmas digitales en 5 notas del último mes     │││
│         │  │ │ NOM-004 • Hace 2 días                                  │││
│         │  │ │ [Ver detalles →]                                       │││
│         │  │ └────────────────────────────────────────────────────────┘││
│         │  │ ┌────────────────────────────────────────────────────────┐││
│         │  │ │ 🟡 ADVERTENCIA                                         │││
│         │  │ │ 8 pacientes sin actualización de consentimientos      │││
│         │  │ │ NOM-024 • Hace 5 días                                  │││
│         │  │ │ [Ver detalles →]                                       │││
│         │  │ └────────────────────────────────────────────────────────┘││
│         │  │ ┌────────────────────────────────────────────────────────┐││
│         │  │ │ 🟡 ADVERTENCIA                                         │││
│         │  │ │ Backup de datos pendiente desde hace 48 horas         │││
│         │  │ │ NOM-024 • Hace 2 días                                  │││
│         │  │ │ [Ver detalles →]                                       │││
│         │  │ └────────────────────────────────────────────────────────┘││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌──────────────────────┬──────────────────────────────────────┐│
│         │  │ NOM-004 DETALLE      │ NOM-024 DETALLE                      ││
│         │  │ [Ver todo →]         │ [Ver todo →]                         ││
│         │  ├──────────────────────┼──────────────────────────────────────┤│
│         │  │ 📝 Requisitos        │ 🔒 Requisitos                        ││
│         │  │                      │                                      ││
│         │  │ ✅ Identificación    │ ✅ Seguridad de acceso               ││
│         │  │    paciente          │                                      ││
│         │  │    100% completo     │    98% completo                      ││
│         │  │                      │                                      ││
│         │  │ ✅ Datos generales   │ ✅ Trazabilidad                      ││
│         │  │    98% completo      │    95% completo                      ││
│         │  │                      │                                      ││
│         │  │ ⚠️ Firma digital     │ ⚠️ Respaldo de datos                ││
│         │  │    92% completo      │    85% completo                      ││
│         │  │    [Acción req.]     │    [Acción req.]                     ││
│         │  │                      │                                      ││
│         │  │ ✅ Historia clínica  │ ✅ Cifrado                           ││
│         │  │    96% completo      │    90% completo                      ││
│         │  │                      │                                      ││
│         │  │ ✅ Consentimiento    │ ⚠️ Auditoría                        ││
│         │  │    informado         │    82% completo                      ││
│         │  │    94% completo      │    [Acción req.]                     ││
│         │  └──────────────────────┴──────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ 📈 TENDENCIA DE CUMPLIMIENTO (Últimos 6 meses)             ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ 100%│                                              ●        ││
│         │  │  95%│                                      ●───●───         ││
│         │  │  90%│                          ●───●───●                    ││
│         │  │  85%│                  ●───●                                ││
│         │  │  80%│          ●───●                                        ││
│         │  │     └──────────────────────────────────────────────────    ││
│         │  │      Jul  Ago  Sep  Oct  Nov  Dic                          ││
│         │  │                                                             ││
│         │  │ ● NOM-004   ● NOM-024   ● General                          ││
│         │  └────────────────────────────────────────────────────────────┘│
│         │                                                                  │
│         │  ┌────────────────────────────────────────────────────────────┐│
│         │  │ ACCIONES RÁPIDAS                                            ││
│         │  ├────────────────────────────────────────────────────────────┤│
│         │  │ [📄 Generar Reporte Completo]  [📊 Exportar Métricas]     ││
│         │  │ [📋 Ver Requisitos Completos]   [⚙️ Configurar Alertas]   ││
│         │  └────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Desglose: Vista de Requisito Individual

```
┌──────────────────────────────────────────────────────────────┐
│ ← Volver al Dashboard                                        │
├──────────────────────────────────────────────────────────────┤
│ NOM-004: Firma Digital de Notas Clínicas                    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ESTADO ACTUAL                                            ││
│ │ ────────────────────                                     ││
│ │     92% Cumplido                                         ││
│ │ ⚠️ ADVERTENCIA: Requiere atención                       ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ 📋 ¿Qué requiere esta norma?                                │
│ ──────────────────────────────────────────────────────────  │
│ Todas las notas clínicas deben estar firmadas digitalmente  │
│ por el médico que las elaboró, con firma electrónica       │
│ certificada que garantice la autenticidad y no repudio.     │
│                                                              │
│ ⚠️ ¿Qué está faltando?                                      │
│ ──────────────────────────────────────────────────────────  │
│ • 5 notas del último mes sin firma digital                  │
│ • 2 notas con firma pendiente de certificación              │
│                                                              │
│ 💡 Recomendaciones                                          │
│ ──────────────────────────────────────────────────────────  │
│ 1. Firmar las 5 notas pendientes antes de fin de mes       │
│ 2. Renovar certificado de firma electrónica (vence en 30d) │
│ 3. Activar recordatorio automático para firmar notas       │
│                                                              │
│ 📊 Detalles                                                  │
│ ──────────────────────────────────────────────────────────  │
│ Total de notas este mes: 62                                 │
│ Notas firmadas: 57 (92%)                                    │
│ Notas sin firmar: 5 (8%)                                    │
│ Última revisión: 7 de Dic, 2025                            │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ NOTAS SIN FIRMAR (5)                                   │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ • Consulta General - María García (5 Dic)             │ │
│ │   [Ver nota →] [Firmar ahora]                         │ │
│ │                                                        │ │
│ │ • Control Diabetes - Pedro López (4 Dic)              │ │
│ │   [Ver nota →] [Firmar ahora]                         │ │
│ │                                                        │ │
│ │ • Primera Consulta - Ana Martínez (3 Dic)             │ │
│ │   [Ver nota →] [Firmar ahora]                         │ │
│ │                                                        │ │
│ │ [Ver todas →]                                          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [Marcar como revisado] [Exportar reporte de requisito]│ │
│ └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Modal: Generar Reporte de Cumplimiento

```
┌──────────────────────────────────────────────┐
│ Generar Reporte de Cumplimiento         [X] │
├──────────────────────────────────────────────┤
│                                              │
│ Periodo del reporte *                        │
│ (○) Último mes                               │
│ (●) Último trimestre                         │
│ (○) Último año                               │
│ (○) Personalizado                            │
│                                              │
│ Incluir en el reporte                        │
│ ☑ Resumen ejecutivo                         │
│ ☑ Métricas NOM-004                          │
│ ☑ Métricas NOM-024                          │
│ ☑ Alertas y recomendaciones                 │
│ ☑ Tendencias históricas                     │
│ ☐ Desglose detallado por requisito          │
│                                              │
│ Formato de exportación                       │
│ (●) PDF  (○) Excel  (○) Ambos               │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │ Vista previa:                        │    │
│ │                                      │    │
│ │ Reporte de Cumplimiento Normativo    │    │
│ │ Octubre - Diciembre 2025             │    │
│ │ Dr. José López                       │    │
│ │                                      │    │
│ │ Cumplimiento General: 92%            │    │
│ │ • NOM-004: 95%                       │    │
│ │ • NOM-024: 88%                       │    │
│ │ ...                                  │    │
│ └──────────────────────────────────────┘    │
│                                              │
├──────────────────────────────────────────────┤
│           [Cancelar]  [Generar Reporte]     │
└──────────────────────────────────────────────┘
```

---

## Especificaciones de Componentes

### Métricas Cards (3 columnas)
```
Layout: Grid 3 columnas (desktop), stack (mobile)

Card Structure:
- Icon: 24px, Primary color
- Title: H6 (16px, Semibold, Gray 700)
- Percentage: H1 (36px, Bold)
- Progress bar: Visual indicator
- Status badge: Color-coded
- Issues count: Caption (12px, Gray 500)

Status Colors:
- 🟢 Cumple (>= 90%): Green 500
- 🟡 En Riesgo (70-89%): Orange 500
- 🔴 No Cumple (< 70%): Red 500
```

### Alertas Card
```
Background: Surface
Border: 1px Border
Border Radius: 12px
Padding: 24px

Alert Item:
- Severity icon: 20px
  🔴 Crítico: Red background
  🟡 Advertencia: Orange background
  🔵 Info: Blue background
- Title: Body (16px, Medium)
- Category: Caption (12px, Gray 500)
- Timestamp: Caption (12px, Gray 400)
- Action button: Link style, Primary color

Layout: Stack vertically
Spacing: 12px between items
```

### Requisitos List (NOM-004/024)
```
Each Requirement:
- Status icon: Checkmark (green) or Warning (orange)
- Title: Body (16px, Medium)
- Percentage: Body Small (14px, Gray 600)
- Progress bar: Mini (4px height)
- Action link: "Acción req." (visible only if incomplete)

Color Coding:
- ✅ >= 95%: Green
- ⚠️ 85-94%: Orange
- ❌ < 85%: Red
```

### Gráfico de Tendencia
```
Type: Line chart
Lines: 3 (General, NOM-004, NOM-024)
Colors:
- General: Gray 700
- NOM-004: Primary 500
- NOM-024: Purple 500

Axes:
- Y: 0-100% (percentage)
- X: Last 6 months

Points: Visible on hover
Tooltip: Show exact percentage on hover
Grid: Subtle horizontal lines
```

### Action Buttons
```
Style: Outline buttons
Icon + Text
Spacing: 12px between buttons
Responsive: Stack on mobile

Hierarchy:
1. Generar Reporte (Primary outline)
2. Exportar Métricas (Secondary outline)
3. Ver Requisitos (Ghost)
4. Configurar Alertas (Ghost)
```

---

## Estados y Comportamientos

### Loading State
```
┌────────────────────────────────────────┐
│ Dashboard de Cumplimiento Normativo    │
├────────────────────────────────────────┤
│ [Skeleton cards - 3 columnas]          │
│ [Skeleton alert list]                  │
│ [Skeleton requirements sections]       │
└────────────────────────────────────────┘
```

### Empty State (Sin Issues)
```
┌────────────────────────────────────────┐
│ ⚠️ ALERTAS ACTIVAS (0)                │
├────────────────────────────────────────┤
│                                        │
│          ✅                            │
│                                        │
│   ¡Todo en orden!                      │
│   No hay alertas activas               │
│                                        │
└────────────────────────────────────────┘
```

### Auto-refresh
```
- Actualización automática cada 5 minutos
- Indicador: "Última actualización: hace X minutos"
- Botón manual: [🔄 Actualizar ahora]
```

---

## Notificaciones y Alertas

### Bell Icon (Sidebar o Header)
```
🔔 [3] ← Badge con count de alertas activas

Click → Dropdown:
┌────────────────────────────────────┐
│ Alertas de Cumplimiento            │
├────────────────────────────────────┤
│ 🔴 5 notas sin firmar              │
│    Hace 2 días                     │
├────────────────────────────────────┤
│ 🟡 8 consentimientos pendientes    │
│    Hace 5 días                     │
├────────────────────────────────────┤
│ 🟡 Backup pendiente                │
│    Hace 2 días                     │
├────────────────────────────────────┤
│ [Ver todas las alertas →]         │
└────────────────────────────────────┘
```

---

## User Story Compliance

**8.1: View compliance metrics overview** ✅
- Dashboard con métricas generales
- NOM-004 y NOM-024 separados
- Indicadores visuales claros
- Actualización automática

**8.2: View detailed compliance breakdown** ✅
- Lista detallada de requisitos
- Estado de cada uno
- Vista expandida por requisito
- Recomendaciones específicas

**8.3: View compliance alerts** ✅
- Sección dedicada de alertas
- Clasificación por severidad
- Notificaciones en tiempo real
- Acciones directas desde alertas

**8.4: View compliance reports** ✅
- Generación de reportes
- Múltiples formatos (PDF/Excel)
- Históricos y tendencias
- Exportación fácil
