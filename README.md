# Aplicación de Expediente Médico

Una aplicación web moderna para la gestión de expedientes médicos, construida con React, TypeScript, Vite y Chakra UI, con un diseño inspirado en iOS.

## Características

### Diseño y UI
- **Diseño inspirado en iOS** con colores azules claros y esquinas redondeadas
- **Modo claro/oscuro** con soporte completo en toda la aplicación
- **Sidebar colapsable** para una navegación moderna e intuitiva
- **Diseño responsivo** que se adapta a diferentes tamaños de pantalla

### Funcionalidades Principales

#### Dashboard
- Resumen de citas del día con estados (pendiente, confirmada, cancelada)
- Listado de pacientes recientes con última visita
- Últimas notas médicas creadas
- Estadísticas generales (total de pacientes, citas, notas)
- Accesos rápidos a funciones principales

#### Gestión de Pacientes
- **Listado de pacientes** con búsqueda en tiempo real
- **Tarjetas (cards)** con información básica y visual atractiva
- **Vista detallada** que incluye:
  - Información personal y de contacto
  - Datos legales/fiscales (CURP, RFC, NSS, seguros)
  - Expediente médico completo
  - Vista previa de última nota médica
  - Archivos adjuntos
  - Accesos rápidos a funciones
- **Formulario de creación** con validación de campos obligatorios
- **Capacidad de edición** de toda la información del paciente

#### Calendario de Citas
- **Vista mensual** con visualización clara de citas
- **Citas codificadas por color** según su estado:
  - Verde: Confirmada
  - Naranja: Pendiente
  - Rojo: Cancelada
- **Click en cita** para ver detalles del paciente
- **Enlace directo** al perfil del paciente desde el calendario
- **Acciones** para confirmar o cancelar citas

#### Notas Médicas
- **Tipos de nota predefinidos**:
  - Interrogatorio Inicial
  - Nota de Evolución
  - Exploración Física
  - Nota Personalizada
- **Templates automáticos** que se cargan según el tipo de nota
- **Editor de Markdown** con vista previa en tiempo real
- **Adjuntar archivos** con soporte para múltiples formatos médicos
- **Firmado automático** al guardar (implementado en backend)
- **Notas inmutables** después de ser firmadas
- **Badge de firma** con nombre del doctor y fecha

#### Archivos Soportados
- Imágenes (JPG, PNG, etc.)
- Videos
- Audio
- PDF
- Microsoft Office (Word, Excel, PowerPoint)
- Archivos médicos especializados: DICOM, HL7, XML

## Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Chakra UI v3** - Sistema de diseño y componentes
- **React Router v7** - Navegación y rutas
- **React Big Calendar** - Componente de calendario
- **React Markdown** - Renderizado de Markdown
- **date-fns** - Manejo de fechas
- **React Icons** - Iconos
- **ESLint + Prettier** - Linting y formateo de código

## Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## Uso

### Iniciar Sesión
La aplicación incluye un sistema de autenticación básico. En desarrollo, usa cualquier email y contraseña para ingresar (usa mock data).

### Datos de Prueba
La aplicación incluye datos mock para desarrollo:
- 5 pacientes de ejemplo
- 6 citas médicas
- 3 notas médicas
- 3 templates de notas predefinidos
- 2 archivos adjuntos de ejemplo

### Navegación
- **Dashboard**: Página principal con resumen de actividad
- **Pacientes**: Gestión completa de pacientes
- **Calendario**: Vista mensual de citas médicas

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.tsx      # Layout principal con sidebar
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Gestión de autenticación
├── data/              # Datos mock para desarrollo
│   └── mockData.ts
├── pages/             # Páginas de la aplicación
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── PatientList.tsx
│   ├── PatientDetail.tsx
│   ├── PatientForm.tsx
│   ├── Calendar.tsx
│   └── NoteForm.tsx
├── theme/             # Configuración de tema Chakra UI
│   └── index.ts
├── types/             # Definiciones de tipos TypeScript
│   └── index.ts
├── App.tsx            # Componente raíz con routing
└── main.tsx          # Punto de entrada
```

## Próximos Pasos

### Integración con API
La aplicación está preparada para integrarse con una API REST. Los servicios necesarios están en:
- `src/services/` (por crear)

Endpoints recomendados:
- `POST /api/auth/login` - Autenticación
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `GET /api/patients/:id` - Obtener paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `GET /api/notes` - Listar notas
- `POST /api/notes` - Crear nota
- `POST /api/files/upload` - Subir archivos

### Funcionalidades Adicionales
- Implementar búsqueda avanzada de pacientes
- Agregar filtros en el calendario
- Crear sistema de notificaciones
- Implementar firma digital RSA (backend)
- Agregar exportación de reportes en PDF
- Implementar sistema de permisos por rol
- Agregar gráficas y estadísticas
- Implementar chat entre doctor y paciente

## Configuración de API

Para conectar con tu API, modifica las variables de entorno:

```env
VITE_API_URL=https://tu-api.com/api
VITE_API_TIMEOUT=10000
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Soporte

Para preguntas o soporte, contacta al equipo de desarrollo.
