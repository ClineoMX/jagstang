# Arquitectura de Información - Jagstang

## Mapa del Sitio

```
Jagstang Medical App
│
├── 🏠 Dashboard (/)
│   ├── Resumen del día
│   ├── Citas de hoy
│   ├── Pacientes recientes
│   ├── Últimas notas médicas
│   └── Acciones rápidas
│
├── 👥 Pacientes (/patients)
│   ├── Lista de pacientes (/patients)
│   │   ├── Búsqueda y filtros
│   │   ├── Vista de tabla/cards
│   │   └── Ordenamiento
│   │
│   ├── Nuevo paciente (/patients/new)
│   │   └── Formulario de registro
│   │
│   └── Detalle de paciente (/patients/:id)
│       ├── Información general
│       │   ├── Datos personales
│       │   ├── Datos de contacto
│       │   └── Información médica crítica
│       │
│       ├── Historial médico (Tab)
│       │   ├── Timeline de consultas
│       │   ├── Notas clínicas anteriores
│       │   └── Búsqueda en historial
│       │
│       ├── Notas clínicas (Tab)
│       │   ├── Lista de notas
│       │   ├── Nueva nota (/patients/:id/notes/new)
│       │   └── Ver/Editar nota (/patients/:id/notes/:noteId)
│       │
│       ├── Citas (Tab)
│       │   ├── Próximas citas
│       │   ├── Historial de citas
│       │   └── Nueva cita
│       │
│       └── Documentos (Tab)
│           ├── Consentimientos
│           ├── Estudios/Imágenes
│           └── Archivos adjuntos
│
├── 📅 Calendario (/calendar)
│   ├── Vista mensual
│   ├── Vista semanal
│   ├── Vista diaria
│   ├── Lista de citas de hoy
│   ├── Nueva cita
│   └── Editar/Cancelar cita
│
├── 📊 Cumplimiento (/compliance) [NUEVO - Priority High]
│   ├── Dashboard de métricas
│   │   ├── NOM-004 compliance
│   │   ├── NOM-024 compliance
│   │   └── Métricas generales
│   │
│   ├── Detalles de requisitos
│   │   ├── Lista de requisitos
│   │   ├── Estado de cada uno
│   │   └── Recomendaciones
│   │
│   ├── Alertas y notificaciones
│   │   ├── Alertas críticas
│   │   ├── Advertencias
│   │   └── Resolución de issues
│   │
│   └── Reportes
│       ├── Históricos
│       ├── Tendencias
│       └── Exportar (PDF/Excel)
│
└── 👤 Perfil (/profile)
    ├── Información personal (solo lectura excepto foto)
    ├── Datos profesionales
    ├── Cambiar foto de perfil
    └── Cerrar sesión
```

---

## Estructura de Navegación

### Navegación Principal (Sidebar)

```
┌─────────────────────────┐
│ 🏥 Jagstang            │  ← Logo y nombre
│ [Collapse toggle]      │
├─────────────────────────┤
│                         │
│ 🏠 Dashboard           │  ← Siempre visible
│ 👥 Pacientes           │  ← Siempre visible
│ 📅 Calendario          │  ← Siempre visible
│ 📊 Cumplimiento        │  ← NUEVO - Siempre visible
│                         │
├─────────────────────────┤ ← Divider
│                         │
│ [Theme toggle]          │
│ [User profile menu]     │
│   ├─ Mi Perfil         │
│   └─ Cerrar Sesión     │
└─────────────────────────┘
```

### Navegación Secundaria

#### En Lista de Pacientes
```
Header:
├─ Título: "Pacientes"
├─ Búsqueda global
├─ Filtros
├─ Ordenamiento
└─ Botón: "+ Nuevo Paciente"
```

#### En Detalle de Paciente
```
Breadcrumb: Pacientes > [Nombre del paciente]

Tabs horizontales:
├─ Información General (default)
├─ Historial Médico
├─ Notas Clínicas
├─ Citas
└─ Documentos

Action Bar:
├─ Editar información
├─ Nueva nota clínica
├─ Nueva cita
└─ Más opciones [⋮]
```

#### En Calendario
```
Header:
├─ Título: "Calendario"
├─ Selector de vista: [Día | Semana | Mes]
├─ Navegación: [← Hoy →]
└─ Botón: "+ Nueva Cita"

Sidebar (si vista día/semana):
└─ Lista de citas del día seleccionado
```

---

## Flujos de Usuario Principales

### Flujo 1: Crear Nota Clínica (Más Común)

```
1. Dashboard / Pacientes
   ↓
2. Buscar paciente (o seleccionar de lista reciente)
   ↓
3. Click en paciente → Detalle de paciente
   ↓
4. Click en "Nueva Nota Clínica"
   ↓
5. Formulario de nota
   ├─ Seleccionar plantilla (opcional)
   ├─ Llenar secciones requeridas
   │  ├─ Motivo de consulta*
   │  ├─ Exploración física*
   │  ├─ Diagnóstico*
   │  └─ Tratamiento*
   ├─ Autoguardado continuo
   └─ Validación en tiempo real
   ↓
6. Click en "Guardar"
   ↓
7. Confirmación → Regresar a detalle de paciente
   └─ Nueva nota visible en historial

Tiempo objetivo: < 3 minutos
Clics requeridos: 4 clics
```

### Flujo 2: Buscar Paciente y Ver Historial

```
1. Dashboard / Pacientes
   ↓
2. Usar barra de búsqueda
   ├─ Tipear nombre/ID
   └─ Ver resultados en tiempo real
   ↓
3. Click en paciente → Detalle
   ↓
4. Ver información crítica (siempre visible):
   ├─ Alergias
   ├─ Enfermedades crónicas
   ├─ Medicamentos actuales
   └─ Cirugías previas
   ↓
5. Click en tab "Historial Médico"
   ↓
6. Ver timeline de consultas
   └─ Click en cualquier nota para expandir

Tiempo objetivo: < 1 minuto
Clics requeridos: 3 clics
```

### Flujo 3: Crear Cita

```
Opción A: Desde Dashboard
1. Dashboard
   ↓
2. Click en "+ Nueva Cita" (header)
   ↓
3. Formulario de cita
   ├─ Buscar/seleccionar paciente*
   ├─ Seleccionar fecha*
   ├─ Seleccionar hora*
   ├─ Duración (default: 30 min)
   ├─ Motivo de cita*
   └─ Notas (opcional)
   ↓
4. Click en "Agendar"
   ↓
5. Confirmación → Ver en calendario

Opción B: Desde Perfil de Paciente
1. Detalle de paciente
   ↓
2. Click en "Nueva Cita" (action bar)
   ↓
3. Formulario (paciente pre-seleccionado)
   ↓
4. Llenar fecha, hora, motivo
   ↓
5. Guardar → Confirmación

Tiempo objetivo: < 2 minutos
Clics requeridos: 3-4 clics
```

### Flujo 4: Registrar Nuevo Paciente

```
1. Dashboard / Pacientes
   ↓
2. Click en "+ Nuevo Paciente"
   ↓
3. Formulario de registro
   │
   ├─ Sección 1: Datos Personales*
   │  ├─ Nombre completo*
   │  ├─ Fecha de nacimiento*
   │  ├─ Sexo*
   │  ├─ CURP
   │  └─ RFC
   │
   ├─ Sección 2: Contacto
   │  ├─ Teléfono
   │  ├─ Email
   │  └─ Dirección
   │
   └─ Sección 3: Información Médica Básica
      ├─ Tipo de sangre
      ├─ Alergias conocidas
      ├─ Enfermedades crónicas
      └─ Medicamentos actuales
   ↓
4. Validación de campos requeridos
   ↓
5. Click en "Guardar"
   ├─ Sistema genera número de expediente
   └─ Confirmación
   ↓
6. Redirigir a detalle del nuevo paciente
   └─ Opción de crear primera nota

Tiempo objetivo: < 3 minutos (datos básicos)
Clics requeridos: 2 clics
```

### Flujo 5: Revisar Cumplimiento Normativo

```
1. Sidebar
   ↓
2. Click en "📊 Cumplimiento"
   ↓
3. Dashboard de cumplimiento
   ├─ Vista general de métricas
   │  ├─ % NOM-004: [Verde/Amarillo/Rojo]
   │  ├─ % NOM-024: [Verde/Amarillo/Rojo]
   │  └─ Issues pendientes: [Número]
   │
   ├─ Alertas críticas (si existen)
   │  └─ Lista de issues que requieren atención
   │
   └─ Breakdown por requisito
      ├─ Click en NOM-004 → Ver detalles
      └─ Click en NOM-024 → Ver detalles
   ↓
4. (Opcional) Ver detalles de requisito
   ├─ Descripción del requisito
   ├─ Estado actual
   ├─ Qué falta (si no cumple)
   └─ Recomendaciones
   ↓
5. (Opcional) Generar reporte
   └─ Exportar PDF/Excel

Tiempo objetivo: < 30 segundos (vista general)
Clics requeridos: 1 clic (dashboard), 2-3 clics (detalles)
```

---

## Acciones Rápidas

### Dashboard - Quick Actions (Siempre visible)

```
┌─────────────────────────────────────────┐
│  [+ Nuevo Paciente]  [+ Nueva Cita]    │
└─────────────────────────────────────────┘
```

### Detalle de Paciente - Action Bar

```
┌──────────────────────────────────────────────────────┐
│  [✏️ Editar]  [📝 Nueva Nota]  [📅 Nueva Cita]  [⋮] │
└──────────────────────────────────────────────────────┘
                                                    │
                                                    ├─ Ver expediente completo
                                                    ├─ Imprimir historia clínica
                                                    ├─ Archivar paciente
                                                    └─ Más opciones...
```

### Búsqueda Global (Siempre accesible)

```
Header derecho:
┌─────────────────────────────────────┐
│ 🔍 [Buscar paciente...]            │ ← Shortcut: Ctrl/Cmd + K
└─────────────────────────────────────┘
```

---

## Estados de la Aplicación

### Estado de Carga (Loading)

```
Página completa:
├─ Skeleton loader con estructura de la página
└─ Spinner centrado (solo si carga > 2s)

Componente individual:
├─ Skeleton del componente
└─ Mantener layout estable (sin shifts)

Acción (botón):
├─ Botón deshabilitado
├─ Texto cambia a "Guardando..." / "Cargando..."
└─ Spinner en el botón
```

### Estado Vacío (Empty State)

```
Sin pacientes:
┌────────────────────────────────────┐
│                                    │
│         [Icono grande]             │
│                                    │
│    No hay pacientes registrados    │
│                                    │
│  [+ Registrar primer paciente]    │
│                                    │
└────────────────────────────────────┘

Sin citas hoy:
┌────────────────────────────────────┐
│   📅  No hay citas programadas     │
│       para hoy                     │
│                                    │
│       [+ Nueva Cita]              │
└────────────────────────────────────┘
```

### Estado de Error

```
Error de carga:
┌────────────────────────────────────┐
│         [Icono error]              │
│                                    │
│  No se pudo cargar la información  │
│                                    │
│     [Reintentar]  [Volver]        │
└────────────────────────────────────┘

Error en formulario:
├─ Campo resaltado en rojo
├─ Mensaje específico debajo del campo
└─ Scroll automático al primer error
```

### Estado de Éxito

```
Guardado exitoso:
├─ Toast notification (esquina superior derecha)
│  ┌──────────────────────────────┐
│  │ ✓ Nota guardada exitosamente │
│  └──────────────────────────────┘
│  └─ Auto-dismiss después de 3s
│
└─ Botón cambia temporalmente a verde con ✓
   └─ Vuelve a estado normal después de 1s
```

---

## Breadcrumbs y Navegación Contextual

### Estructura de Breadcrumbs

```
Home: No breadcrumbs

Pacientes:
Dashboard > Pacientes

Nuevo Paciente:
Dashboard > Pacientes > Nuevo Paciente

Detalle Paciente:
Dashboard > Pacientes > [Nombre Apellido]

Nueva Nota:
Dashboard > Pacientes > [Nombre Apellido] > Nueva Nota

Calendario:
Dashboard > Calendario

Cumplimiento:
Dashboard > Cumplimiento

Perfil:
Dashboard > Mi Perfil
```

---

## Responsive Behavior

### Mobile (< 768px)

```
Navegación:
├─ Sidebar: Hidden by default
├─ Hamburger menu (top left)
└─ Bottom navigation bar (opcional)
   ├─ Dashboard
   ├─ Pacientes
   ├─ Calendario
   └─ Más

Content:
├─ Cards: Stack verticalmente
├─ Tables: Convertir a cards
├─ Forms: 1 columna
└─ Action buttons: Full width
```

### Tablet (768px - 1024px)

```
Navegación:
├─ Sidebar: Colapsado (iconos)
└─ Expandir on hover/tap

Content:
├─ Cards: 2 columnas
├─ Tables: Scroll horizontal
├─ Forms: 2 columnas para campos cortos
└─ Touch targets: 44x44px mínimo
```

### Desktop (> 1024px)

```
Navegación:
└─ Sidebar: Expandido por defecto

Content:
├─ Cards: 2-3 columnas
├─ Tables: Completas
├─ Forms: 2-3 columnas optimizadas
└─ Hover states: Habilitados
```

---

## Patrones de Interacción

### Búsqueda y Filtros

```
Búsqueda en tiempo real:
├─ Delay: 300ms después del último keystroke
├─ Mínimo 2 caracteres
├─ Resultados actualizados dinámicamente
└─ Indicador de "Buscando..."

Filtros:
├─ Panel lateral (desktop) o modal (mobile)
├─ Aplicar automáticamente o con botón "Aplicar"
├─ Contador de filtros activos
└─ Botón "Limpiar filtros"
```

### Ordenamiento

```
Click en header de columna:
├─ Primera vez: Orden ascendente ↑
├─ Segunda vez: Orden descendente ↓
└─ Tercera vez: Sin orden (default)

Indicador visual:
└─ Flecha ↑ o ↓ en header activo
```

### Paginación

```
Opciones:
├─ Infinite scroll (preferido para listas largas)
└─ Paginación clásica (para tables)
   ├─ [← Anterior] [1] [2] [3] ... [10] [Siguiente →]
   └─ Selector: Mostrar [20 ▼] por página
```

### Modales y Overlays

```
Trigger:
├─ Click en botón/enlace
└─ Keyboard shortcut (cuando aplique)

Comportamiento:
├─ Background overlay (semi-transparente)
├─ Modal centrado
├─ Cerrar: [X], Esc, click fuera (confirmar si hay cambios)
└─ Focus trap dentro del modal

Contenido:
├─ Header con título y [X]
├─ Body con contenido
└─ Footer con acciones [Cancelar] [Acción Principal]
```

---

## Consideraciones de Usabilidad

### Accesibilidad Keyboard

```
Tab order:
1. Logo/Home
2. Navegación principal (secuencial)
3. Búsqueda global
4. Contenido principal (secuencial)
5. Acciones primarias
6. Acciones secundarias

Shortcuts:
├─ Ctrl/Cmd + K: Búsqueda global
├─ Ctrl/Cmd + N: Nuevo paciente
├─ Ctrl/Cmd + S: Guardar (en formularios)
├─ Esc: Cerrar modal/cancelar
└─ ?: Mostrar ayuda de shortcuts
```

### Prevención de Errores

```
Formularios:
├─ Validación en tiempo real (después de blur)
├─ Mensajes específicos (no genéricos)
├─ Requeridos marcados claramente (*)
├─ Formateo automático (teléfonos, CURP, etc.)
└─ Confirmación antes de descartar cambios

Acciones destructivas:
├─ Confirmación en modal
├─ Botón de peligro (rojo)
├─ Requiere confirmar texto o doble-confirm
└─ Posibilidad de deshacer (cuando posible)
```

### Feedback del Sistema

```
Todas las acciones deben tener feedback:
├─ Visual: Cambio de estado, animación
├─ Textual: Mensaje de confirmación/error
└─ Temporal: 3s para éxitos, hasta dismiss para errores

Tiempo de espera:
├─ < 1s: No feedback necesario
├─ 1-3s: Indicador de progreso
└─ > 3s: Progress bar o mensaje de "Por favor espere..."
```

---

## Notas de Implementación

### Prioridad de Desarrollo

**Phase 1: Core (2-3 semanas)**
1. Sistema de diseño y componentes base
2. Layout y navegación
3. Dashboard básico
4. Lista de pacientes + búsqueda
5. Detalle de paciente
6. Formulario de nuevo paciente

**Phase 2: Features Críticas (2-3 semanas)**
7. Creación de notas clínicas
8. Historial médico
9. Calendario básico
10. Gestión de citas

**Phase 3: Cumplimiento y Extras (2-3 semanas)**
11. Dashboard de cumplimiento (NOM-004/024)
12. Sistema de alertas
13. Reportes
14. Perfil de doctor
15. Optimizaciones y pulido

### Stack Tecnológico
- React 19 + TypeScript
- Chakra UI (components)
- React Router (navigation)
- date-fns (date handling)
- TipTap (rich text editor)
- React Icons (Feather)

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Page transitions: < 200ms
- Form submissions: < 2s
- Search results: < 500ms
