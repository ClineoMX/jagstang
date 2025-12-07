# Documentación de Diseño UX - Jagstang

Aplicación médica para gestión de consultorios privados en México.
Cumplimiento con NOM-004 (Expediente Clínico) y NOM-024 (Sistemas de Información).

---

## 📚 Índice de Documentación

### 1. Sistema de Diseño
📄 **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**
- Principios de diseño
- Paleta de colores completa
- Tipografía y escalas
- Componentes base (botones, cards, inputs, badges, etc.)
- Iconografía
- Interacciones y animaciones
- Responsive design
- Accesibilidad

### 2. Arquitectura de Información
📄 **[INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md)**
- Mapa del sitio completo
- Estructura de navegación
- Flujos de usuario principales
  - Crear nota clínica (flujo más común)
  - Buscar paciente y ver historial
  - Crear cita
  - Registrar nuevo paciente
  - Revisar cumplimiento normativo
- Acciones rápidas
- Estados de la aplicación
- Breadcrumbs y navegación contextual
- Responsive behavior
- Patrones de interacción

### 3. Wireframes Detallados

📁 **[wireframes/](./wireframes/)**

#### Pantallas Principales:

1. **[01_DASHBOARD.md](./wireframes/01_DASHBOARD.md)** - Dashboard Principal
   - Vista general del día
   - Métricas rápidas (citas, pacientes, notas)
   - Próximas citas
   - Pacientes recientes
   - Últimas notas médicas
   - User Stories: 2.1, 2.2, 2.3

2. **[02_PATIENT_LIST.md](./wireframes/02_PATIENT_LIST.md)** - Lista de Pacientes
   - Búsqueda en tiempo real
   - Filtros y ordenamiento
   - Cards de pacientes con información clave
   - User Stories: 3.1, 3.2, 3.3, 6.5

3. **[03_PATIENT_DETAIL.md](./wireframes/03_PATIENT_DETAIL.md)** - Expediente del Paciente
   - Información crítica (alergias, enfermedades, medicamentos)
   - Tabs: Información, Historial, Notas, Citas, Documentos
   - Timeline de consultas
   - Datos personales y contacto
   - User Stories: 3.4, 5.1, 5.3

4. **[04_CALENDAR.md](./wireframes/04_CALENDAR.md)** - Calendario de Citas
   - Vista mensual, semanal y diaria
   - Sidebar con lista de citas del día
   - Creación y edición de citas
   - Detalle de citas
   - User Stories: 7.1, 7.2, 7.3, 7.4

5. **[05_COMPLIANCE_DASHBOARD.md](./wireframes/05_COMPLIANCE_DASHBOARD.md)** - Dashboard de Cumplimiento ⭐ NUEVO
   - Métricas de cumplimiento NOM-004 y NOM-024
   - Alertas críticas y advertencias
   - Desglose detallado de requisitos
   - Tendencias históricas
   - Generación de reportes
   - User Stories: 8.1, 8.2, 8.3, 8.4

6. **[06_NOTE_FORM.md](./wireframes/06_NOTE_FORM.md)** - Creación de Nota Clínica
   - Formulario por secciones
   - Sistema de plantillas
   - Autoguardado
   - Rich text editor (TipTap)
   - Búsqueda de diagnósticos CIE-10
   - Prescripción de medicamentos
   - Firma digital
   - User Stories: 4.1, 4.2, 4.3, 4.4

---

## 🎯 Objetivos de Diseño

### Profesionalismo Médico
- Diseño sobrio y confiable
- Colores médicos profesionales (azul primario)
- Prioriza funcionalidad sobre decoración
- Transmite seguridad y confidencialidad

### Velocidad y Eficiencia
- Máximo 3 clics para acciones comunes
- Carga de páginas < 3 segundos
- Autoguardado automático
- Botones grandes (mínimo 44x44px)

### Cumplimiento Normativo
- NOM-004: Expediente Clínico Digital
- NOM-024: Sistemas de Información en Salud
- Dashboard automatizado de cumplimiento
- Validaciones en tiempo real
- Firma digital certificada

### Usabilidad
- Mobile-first responsive design
- Optimizado para tablets (uso en consultorio)
- Búsqueda en tiempo real
- Navegación clara y predecible
- Feedback inmediato en todas las acciones

---

## 🎨 Identidad Visual

### Colores Principales
- **Primary 500:** #007AFF (Azul médico - iOS blue)
- **Green 500:** #34C759 (Éxito)
- **Red 500:** #FF3B30 (Alertas críticas)
- **Orange 500:** #FF9500 (Advertencias)
- **Yellow 500:** #FFCC00 (Información)

### Tipografía
- **Familia:** SF Pro (Apple) con fallbacks
- **Heading 1:** 36px / Bold
- **Heading 2:** 30px / Bold
- **Body:** 16px / Regular
- **Caption:** 12px / Regular

### Espaciado
- **Base:** 8px
- **Estándar:** 16px
- **Entre secciones:** 24px
- **Grande:** 32px

---

## 📊 Métricas de Éxito

### Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Page transitions: < 200ms
- Form submissions: < 2s
- Search results: < 500ms

### Usabilidad
- Crear nota clínica: < 3 minutos
- Buscar paciente: < 30 segundos
- Crear cita: < 2 minutos
- Registrar paciente: < 3 minutos (datos básicos)

### Cumplimiento
- NOM-004 compliance: >= 95%
- NOM-024 compliance: >= 90%
- Notas firmadas digitalmente: 100%
- Respaldo de datos: diario

---

## 🚀 Implementación

### Stack Tecnológico
- **Frontend:** React 19 + TypeScript
- **UI Framework:** Chakra UI
- **Icons:** Feather Icons (react-icons/fi)
- **Routing:** React Router
- **Dates:** date-fns
- **Rich Text:** TipTap (WYSIWYG)
- **State:** Context API / Zustand

### Prioridad de Desarrollo

#### **Phase 1: Core (Alta Prioridad)**
1. Sistema de diseño y componentes base
2. Layout y navegación
3. Dashboard principal
4. Lista de pacientes + búsqueda
5. Detalle de paciente
6. Creación de notas clínicas
7. Calendario básico
8. **Dashboard de cumplimiento** ⭐

#### **Phase 2: Features (Media Prioridad)**
9. Gestión de citas completa
10. Historial médico timeline
11. Sistema de plantillas
12. Reportes de cumplimiento
13. Perfil de doctor

#### **Phase 3: Enhancements (Baja Prioridad)**
14. Búsqueda avanzada en historial
15. Archivo de pacientes
16. Estadísticas y analytics
17. Exportación de datos
18. Optimizaciones y pulido

---

## 📝 Notas de Diseño

### Inspiración
El diseño se basa en las imágenes de referencia proporcionadas:
- **Medtters:** Sidebar, cards con sombras, calendario integrado
- **KiviCare:** Diseño de formularios, tabs, perfil de usuario
- **Calendar App:** Vista de calendario, lista de eventos

### Adaptaciones para Contexto Mexicano
- Cumplimiento NOM-004 y NOM-024
- Campos específicos: CURP, RFC, NSS
- Búsqueda de diagnósticos CIE-10
- Firma digital certificada (FIEL/e.firma)
- Idioma: Español (México)
- Formato de fecha: DD/MM/YYYY
- Moneda: MXN

### Accesibilidad
- WCAG 2.1 AA compliance
- Contraste mínimo 4.5:1
- Navegación por teclado
- Screen reader friendly
- Focus states visibles
- No dependencia solo de color para información

---

## 🔄 Siguiente Pasos

1. ✅ Documentación de diseño completa
2. ⏳ Revisión y aprobación del diseño
3. ⏳ Implementación de componentes base
4. ⏳ Desarrollo de pantallas principales
5. ⏳ Testing de usabilidad
6. ⏳ Iteración y mejoras

---

## 📞 Contacto y Feedback

Para preguntas sobre el diseño o sugerencias de mejora:
- Revisar las user stories en `ux-stories.md`
- Consultar los wireframes detallados en la carpeta `wireframes/`
- Verificar el sistema de diseño en `DESIGN_SYSTEM.md`

---

**Última actualización:** 7 de Diciembre, 2025
**Versión:** 1.0
**Estado:** Diseño completo, listo para implementación
