# Sistema de Diseño - Jagstang (Aplicación Médica)

## Tabla de Contenidos
1. [Principios de Diseño](#principios-de-diseño)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado y Grid](#espaciado-y-grid)
5. [Componentes Base](#componentes-base)
6. [Iconografía](#iconografía)
7. [Interacciones y Animaciones](#interacciones-y-animaciones)

---

## Principios de Diseño

### 1. Profesionalismo Médico
- El diseño debe transmitir confianza, seguridad y profesionalismo
- Colores sobrios pero modernos
- Evitar elementos decorativos innecesarios
- Priorizar la funcionalidad sobre la estética

### 2. Velocidad y Eficiencia
- Todas las acciones comunes deben completarse en máximo 3 clics
- Tiempo de carga < 3 segundos
- Autoguardado automático
- Botones grandes y fáciles de presionar (mínimo 44x44px)

### 3. Claridad y Jerarquía Visual
- Información más importante primero
- Uso consistente de jerarquía tipográfica
- Espaciado generoso para facilitar lectura
- Colores con propósito (no decorativos)

### 4. Seguridad y Confidencialidad
- Indicadores claros de sesión activa
- Confirmaciones para acciones importantes
- Mensajes de error que no revelen información sensible
- Diseño que transmite protección de datos

### 5. Responsividad
- Diseño móvil primero (mobile-first)
- Optimizado especialmente para tablets (uso en consultorio)
- Funcional en desktop
- Touch-friendly en todos los dispositivos

---

## Paleta de Colores

### Colores Primarios

#### Azul Médico (Principal)
```
Primary 50:  #E6F2FF  (Fondos sutiles)
Primary 100: #BAE0FF  (Hover states claros)
Primary 200: #8DCDFF
Primary 300: #61BAFF
Primary 400: #34A7FF
Primary 500: #007AFF  (Color principal - Acción primaria)
Primary 600: #0062CC  (Hover de botones primarios)
Primary 700: #004999
Primary 800: #003166
Primary 900: #001933  (Textos sobre fondos claros)
```

**Uso:**
- Botones de acción primaria
- Enlaces y elementos interactivos
- Indicadores de estado activo/seleccionado
- Iconos importantes

#### Verde (Éxito/Confirmación)
```
Green 500: #34C759  (iOS Green)
```

**Uso:**
- Indicadores de éxito
- Confirmaciones guardadas
- Estados "completado"
- Pacientes vistos/citas confirmadas

#### Rojo (Alertas Críticas)
```
Red 500: #FF3B30  (iOS Red)
```

**Uso:**
- Alertas médicas críticas (alergias severas)
- Errores importantes
- Información de emergencia
- Cancelaciones

#### Naranja (Advertencias)
```
Orange 500: #FF9500  (iOS Orange)
```

**Uso:**
- Advertencias moderadas
- Información que requiere atención
- Citas pendientes de confirmar
- Alertas de cumplimiento normativo

#### Amarillo (Información)
```
Yellow 500: #FFCC00  (iOS Yellow)
```

**Uso:**
- Información importante pero no urgente
- Recordatorios
- Elementos destacados

### Colores Neutrales

#### Grises (Estructura y Contenido)
```
Gray 50:  #F9FAFB  (Fondos muy claros)
Gray 100: #F3F4F6  (Fondos de sección)
Gray 200: #E5E7EB  (Bordes)
Gray 300: #D1D5DB  (Bordes activos, divisores)
Gray 400: #9CA3AF  (Texto deshabilitado)
Gray 500: #6B7280  (Texto secundario)
Gray 600: #4B5563  (Texto terciario)
Gray 700: #374151  (Texto secundario importante)
Gray 800: #1F2937  (Texto principal)
Gray 900: #111827  (Headings, texto muy importante)
```

### Fondos y Superficies

#### Modo Claro (Predeterminado)
```
Background:     #F2F2F7  (Fondo general de la app)
Surface:        #FFFFFF  (Cards, modales, sidebar)
Surface Hover:  #F9FAFB  (Hover sobre elementos de lista)
Border:         #E5E7EB  (Bordes de cards y divisores)
```

#### Modo Oscuro
```
Background:     #000000  (Fondo general)
Surface:        #1C1C1E  (Cards, modales)
Surface Alt:    #2C2C2E  (Sidebar, áreas alternativas)
Surface Hover:  #3A3A3C  (Hover sobre elementos)
Border:         #3A3A3C  (Bordes)
```

### Colores Semánticos Médicos

```
Allergy Red:    #FF3B30  (Alergias - siempre visible)
Medication:     #5AC8FA  (Teal - medicamentos)
Diagnosis:      #AF52DE  (Purple - diagnósticos)
Examination:    #34C759  (Verde - exámenes)
Follow-up:      #FF9500  (Naranja - seguimiento)
```

---

## Tipografía

### Familia Tipográfica

**Sistema:** SF Pro (Apple) con fallbacks universales
```css
Font Family Heading:
  -apple-system, BlinkMacSystemFont, 'SF Pro Display',
  'Segoe UI', 'Roboto', sans-serif

Font Family Body:
  -apple-system, BlinkMacSystemFont, 'SF Pro Text',
  'Segoe UI', 'Roboto', sans-serif
```

### Escala Tipográfica

#### Headings (Display)
```
H1: 36px / 2.25rem  - Font Weight: 700 (Bold)    - Line Height: 1.2
H2: 30px / 1.875rem - Font Weight: 700 (Bold)    - Line Height: 1.3
H3: 24px / 1.5rem   - Font Weight: 600 (Semibold)- Line Height: 1.4
H4: 20px / 1.25rem  - Font Weight: 600 (Semibold)- Line Height: 1.4
H5: 18px / 1.125rem - Font Weight: 600 (Semibold)- Line Height: 1.5
H6: 16px / 1rem     - Font Weight: 600 (Semibold)- Line Height: 1.5
```

#### Body Text
```
Body Large:  18px / 1.125rem - Font Weight: 400 (Regular) - Line Height: 1.6
Body:        16px / 1rem     - Font Weight: 400 (Regular) - Line Height: 1.6
Body Small:  14px / 0.875rem - Font Weight: 400 (Regular) - Line Height: 1.5
Caption:     12px / 0.75rem  - Font Weight: 400 (Regular) - Line Height: 1.4
```

#### Emphasis
```
Bold:         Font Weight: 600 (Semibold)
Strong:       Font Weight: 700 (Bold)
Link:         Font Weight: 500 (Medium) + Color: Primary 500
```

### Uso Contextual

**Dashboard Headings:** H2 (30px)
**Section Titles:** H3 (24px)
**Card Titles:** H4 (20px)
**Form Labels:** Body (16px) + Font Weight: 500
**Body Text:** Body (16px)
**Metadata:** Body Small (14px) + Color: Gray 500
**Captions:** Caption (12px) + Color: Gray 500

---

## Espaciado y Grid

### Sistema de Espaciado (8px base)

```
Space 0:  0px
Space 1:  4px   (0.25rem)  - Espaciado mínimo
Space 2:  8px   (0.5rem)   - Espaciado entre elementos relacionados
Space 3:  12px  (0.75rem)  - Espaciado pequeño
Space 4:  16px  (1rem)     - Espaciado estándar
Space 5:  20px  (1.25rem)  - Espaciado medio
Space 6:  24px  (1.5rem)   - Espaciado entre secciones
Space 8:  32px  (2rem)     - Espaciado grande
Space 10: 40px  (2.5rem)   - Espaciado muy grande
Space 12: 48px  (3rem)     - Separación de secciones mayores
Space 16: 64px  (4rem)     - Espaciado máximo
```

### Container y Layout

```
Container Max Width:  1280px (container.xl)
Sidebar Width:        280px (expandido) / 80px (colapsado)
Header Height:        72px
Content Padding:      32px (desktop) / 16px (mobile)
Card Padding:         24px (desktop) / 16px (mobile)
```

### Grid System

**Columns:** 12 columnas
**Gutter:** 24px (desktop) / 16px (mobile)
**Breakpoints:**
```
sm:  640px   (Móvil landscape)
md:  768px   (Tablet portrait)
lg:  1024px  (Tablet landscape / Desktop pequeño)
xl:  1280px  (Desktop)
2xl: 1536px  (Desktop grande)
```

---

## Componentes Base

### Botones

#### Botón Primario
```
Background:      Primary 500 (#007AFF)
Text Color:      White
Padding:         12px 24px
Border Radius:   8px
Font Weight:     600 (Semibold)
Min Height:      44px
Hover:           Primary 600 (#0062CC)
Active:          Primary 700 (#004999)
Disabled:        Gray 300 (bg) + Gray 500 (text)
```

#### Botón Secundario (Outline)
```
Background:      Transparent
Border:          2px solid Primary 500
Text Color:      Primary 500
Padding:         12px 24px
Border Radius:   8px
Font Weight:     600
Min Height:      44px
Hover:           Primary 50 (bg) + Primary 600 (text)
```

#### Botón Terciario (Ghost)
```
Background:      Transparent
Text Color:      Primary 500
Padding:         12px 24px
Border Radius:   8px
Font Weight:     500
Min Height:      44px
Hover:           Primary 50 (bg)
```

#### Botón de Peligro
```
Background:      Red 500 (#FF3B30)
Text Color:      White
Padding:         12px 24px
Border Radius:   8px
Font Weight:     600
Min Height:      44px
Hover:           Darken 10%
```

### Cards

#### Card Estándar
```
Background:      Surface (#FFFFFF light / #1C1C1E dark)
Border:          1px solid Border color
Border Radius:   12px
Padding:         24px
Box Shadow:      0 1px 3px rgba(0, 0, 0, 0.1)
```

#### Card Interactivo (Clickable)
```
Base:            Card Estándar
Cursor:          pointer
Hover:           Background → Surface Hover
                 Box Shadow → 0 4px 12px rgba(0, 0, 0, 0.15)
Transition:      all 0.2s ease
```

#### Card con Header
```
Header:
  - Padding: 20px 24px
  - Border Bottom: 1px solid Border color
  - Font: H4 (20px, Semibold)

Body:
  - Padding: 24px
```

### Inputs

#### Text Input
```
Height:          44px
Padding:         12px 16px
Border:          1px solid Gray 300
Border Radius:   8px
Font Size:       16px
Background:      Surface

Focus:
  - Border: 2px solid Primary 500
  - Box Shadow: 0 0 0 3px Primary 50
  - Outline: none

Error:
  - Border: 2px solid Red 500
  - Box Shadow: 0 0 0 3px rgba(255, 59, 48, 0.1)

Disabled:
  - Background: Gray 100
  - Border: Gray 300
  - Color: Gray 500
  - Cursor: not-allowed
```

#### Label
```
Font Size:       14px
Font Weight:     500
Color:           Gray 700
Margin Bottom:   8px

Required (asterisco):
  - Color: Red 500
  - Font Weight: 700
```

#### Search Input
```
Base:            Text Input
Icon:            Magnifying glass (left side)
Padding Left:    40px (para el icono)
Placeholder:     "Buscar por nombre, expediente..."
```

### Badges

#### Badge Estándar
```
Padding:         4px 12px
Border Radius:   12px (pill shape)
Font Size:       12px
Font Weight:     600
Text Transform:  uppercase
Letter Spacing:  0.5px
```

#### Badge Variantes
```
Success (Verde):
  - Background: Green 50
  - Text: Green 700
  - Border: 1px solid Green 200

Warning (Naranja):
  - Background: Orange 50
  - Text: Orange 700
  - Border: 1px solid Orange 200

Error (Rojo):
  - Background: Red 50
  - Text: Red 700
  - Border: 1px solid Red 200

Info (Azul):
  - Background: Primary 50
  - Text: Primary 700
  - Border: 1px solid Primary 200

Neutral (Gris):
  - Background: Gray 100
  - Text: Gray 700
  - Border: 1px solid Gray 300
```

### Avatares

```
Sizes:
  - xs:  24px
  - sm:  32px
  - md:  40px
  - lg:  64px
  - xl:  96px
  - 2xl: 128px

Border Radius: 50% (circular)
Border:        2px solid Surface (para destacar sobre fondos)

Fallback:      Iniciales del nombre
               Background: Primary 100
               Color: Primary 700
```

### Alerts

#### Alert Informativo
```
Background:      Primary 50
Border Left:     4px solid Primary 500
Padding:         16px
Border Radius:   8px
Icon:            ℹ️ (info circle) - Primary 500
Title:           Font Weight 600, Primary 900
Message:         Body Small, Gray 700
```

#### Alert Éxito
```
Background:      Green 50
Border Left:     4px solid Green 500
Icon:            ✓ (checkmark) - Green 500
```

#### Alert Advertencia
```
Background:      Orange 50
Border Left:     4px solid Orange 500
Icon:            ⚠️ (warning) - Orange 500
```

#### Alert Error
```
Background:      Red 50
Border Left:     4px solid Red 500
Icon:            ✕ (x circle) - Red 500
```

---

## Iconografía

### Librería de Iconos
**Feather Icons** (react-icons/fi)
- Estilo minimalista y profesional
- Consistente con diseño médico
- Tamaño base: 20px

### Iconos Principales

#### Navegación
```
Dashboard:        FiHome
Pacientes:        FiUsers
Calendario:       FiCalendar
Perfil:           FiUser
Configuración:    FiSettings
Ayuda:            FiHelpCircle
Cerrar Sesión:    FiLogOut
```

#### Acciones
```
Crear/Nuevo:      FiPlus
Editar:           FiEdit, FiEdit2
Eliminar:         FiTrash, FiTrash2
Guardar:          FiSave
Buscar:           FiSearch
Filtrar:          FiFilter
Descargar:        FiDownload
Subir:            FiUpload
Compartir:        FiShare2
Imprimir:         FiPrinter
```

#### Estados
```
Éxito:            FiCheckCircle, FiCheck
Advertencia:      FiAlertTriangle
Error:            FiXCircle, FiX
Info:             FiInfo
Alerta:           FiBell
```

#### Médicos
```
Nota Clínica:     FiFileText
Expediente:       FiFile
Medicamento:      FiActivity (ECG line)
Examen:           FiClipboard
Cita:             FiCalendar
Paciente:         FiUser
Doctor:           FiUserCheck
```

#### UI
```
Menú:             FiMenu
Cerrar:           FiX
Expandir:         FiChevronDown, FiChevronRight
Colapsar:         FiChevronUp, FiChevronLeft
Ver:              FiEye
Ocultar:          FiEyeOff
Más opciones:     FiMoreVertical, FiMoreHorizontal
```

---

## Interacciones y Animaciones

### Principios de Animación
1. **Sutiles:** Animaciones deben ser apenas perceptibles
2. **Rápidas:** Duración máxima 300ms
3. **Funcionales:** Solo animar cuando mejore la experiencia
4. **Naturales:** Usar easing curves naturales

### Transiciones Estándar

```css
/* Transición general */
transition: all 0.2s ease-in-out;

/* Hover sobre elementos interactivos */
transition: background-color 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.15s ease;

/* Expansión/Colapso */
transition: height 0.3s ease-in-out,
            opacity 0.2s ease;

/* Cambio de página/ruta */
transition: opacity 0.2s ease-in-out;
```

### Efectos Hover

#### Cards y Elementos Interactivos
```css
hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

#### Botones
```css
hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Estados de Carga

#### Spinner
```
Size:      24px (inline) / 48px (page)
Color:     Primary 500
Thickness: 3px
Animation: Rotate 0.8s linear infinite
```

#### Skeleton Loader
```
Background:    Linear gradient animado
               Gray 100 → Gray 200 → Gray 100
Animation:     Shimmer 1.5s ease-in-out infinite
Border Radius: Igual al elemento que reemplaza
```

#### Progress Bar
```
Height:        4px
Background:    Gray 200
Fill:          Primary 500
Border Radius: 2px
Animation:     Width transition 0.3s ease
```

### Feedback Visual

#### Guardado Exitoso
```
1. Botón cambia a verde con checkmark
2. Mensaje toast aparece (0.2s fade in)
3. Toast desaparece después de 3s (0.3s fade out)
```

#### Error
```
1. Campo con error: shake animation (0.4s)
2. Border cambia a rojo
3. Mensaje de error aparece debajo (0.2s slide down)
```

#### Focus States
```
All interactive elements:
  - Ring: 3px Primary 50
  - Border: 2px Primary 500
  - Transition: 0.15s ease
```

---

## Responsive Design

### Mobile First Approach

#### Mobile (< 768px)
```
- Sidebar: Overlay (desplegable)
- Cards: Stack verticalmente
- Padding: 16px
- Font sizes: Reducir 10%
- Tables: Convertir a cards
- Forms: Una columna
```

#### Tablet (768px - 1024px)
```
- Sidebar: 80px colapsado por defecto
- Cards: 2 columnas cuando posible
- Padding: 24px
- Font sizes: Estándar
- Touch targets: Mínimo 44x44px
```

#### Desktop (> 1024px)
```
- Sidebar: 280px expandido
- Cards: 2-3 columnas según contenido
- Padding: 32px
- Hover states: Activados
- Focus: Keyboard navigation optimizada
```

### Touch Targets
```
Minimum Size: 44x44px (iOS/Android guideline)
Spacing:      8px entre targets
Padding:      Suficiente para toque cómodo
```

---

## Accesibilidad

### Contraste
- WCAG AA compliance mínimo (4.5:1 para texto normal)
- WCAG AAA preferido (7:1)

### Keyboard Navigation
- Tab order lógico
- Focus visible en todos los elementos interactivos
- Shortcuts para acciones comunes

### Screen Readers
- Labels semánticos en todos los inputs
- Alt text en imágenes
- ARIA labels donde sea necesario
- Headings jerárquicos (h1, h2, h3...)

### Color
- No usar solo color para transmitir información
- Iconos + texto en alerts
- Patterns adicionales cuando sea necesario

---

## Referencias de Diseño

### Inspiración de las Imágenes Proporcionadas

#### Medtters App
- Sidebar izquierda con navegación clara
- Cards con bordes suaves y sombras sutiles
- Paleta de colores morado/azul (adaptada a azul médico)
- Calendario integrado en dashboard
- Lista de visitas con avatares
- Uso de badges para estados

#### KiviCare App
- Diseño limpio de formularios
- Tabs para navegación de secciones
- Avatar circular con upload
- Layout de dos columnas en formularios
- Espaciado generoso

#### Calendar App
- Vista de calendario mensual clara
- Lista de visitas del día en sidebar
- Tarjetas de eventos en días
- Botón de acción primario destacado
- Navegación lateral oscura con iconos

### Aplicación a Jagstang
- Combinar lo mejor de cada referencia
- Adaptar a contexto médico mexicano
- Priorizar funcionalidad y velocidad
- Mantener profesionalismo
- Cumplir con NOM-004 y NOM-024

---

## Notas de Implementación

### Tecnologías
- **Framework:** React 19 + TypeScript
- **UI Library:** Chakra UI
- **Icons:** Feather Icons (react-icons/fi)
- **Dates:** date-fns
- **Rich Text:** TipTap (WYSIWYG editor)

### Orden de Implementación
1. Sistema de diseño base (este documento)
2. Componentes compartidos (buttons, cards, inputs)
3. Layout y navegación
4. Dashboard
5. Pacientes (lista, detalle, formulario)
6. Notas clínicas
7. Calendario
8. Dashboard de cumplimiento
9. Perfil de doctor

### Consideraciones Especiales
- **Autoguardado:** Implementar en formularios largos
- **Validación:** En tiempo real pero no intrusiva
- **Performance:** Lazy loading para listas largas
- **Offline:** Considerar modo offline para consultas
- **Seguridad:** Timeouts de sesión, cifrado de datos sensibles
