# Informe de brechas API ↔ diseño (Clineo v2)

Este documento describe **qué datos faltan en las respuestas de los endpoints actuales** para alimentar el nuevo diseño sin placeholders, **qué endpoints o extensiones** convendría exponer en backend, y **qué contratos están documentados de forma inconsistente** entre `api.md` y el cliente (`src/services/api.ts`).

Referencia de rutas ya usadas en la app: `src/services/api.ts` y `api.md`.

---

## 1. Resumen ejecutivo

| Área UI / flujo | Estado hoy | Causa principal |
|----|----|----|
| **Barra de signos / resumen clínico** (VitalsBar) | Valores fijos (`No registradas`, `—`, `94%`) | No hay modelo agregado de alergias, crónicos, medicamentos, sangre ni NOM por paciente en una sola respuesta ligera |
| **Timeline** (filtros Recetas / Labs) | Solo notas + citas reales; rx/lab solo vía `getMockTimelineForPatient` | No hay entidades de receta/lab independientes del HTML de la nota |
| **Dashboard · franja NOM** | Valores estáticos (`94%`, `1 alerta`) | No se llama a `GET /doctor/compliance/` en home; haría falta resumen liviano |
| **Lista de pacientes (tabla)** | Edad, género, sangre, última visita, email suelen quedar vacíos | `GET /patients/` devuelve muy pocos campos |
| **Cumplimiento NOM (página)** | Datos reales del reporte | Botón “Exportar” sin endpoint |
| **Búsqueda global** (Dashboard) | UI sin acción | No hay búsqueda unificada pacientes/notas/citas |
| **Perfil médico** (`/profile`) | `handleSaveProfile` solo dispara un toast | No hay `GET/PATCH /doctor/profile/` ni upload de avatar |
| **Biblioteca · Documentos profesionales** | `INITIAL_DOCUMENTS` hardcoded en cliente | No existe CRUD de documentos del doctor |
| **Biblioteca · Plantillas de notas** | Store **en memoria** (`templatesStore.ts`) | `GET /doctor/templates/` existe, pero **no hay POST/PATCH/DELETE** ni `type`/`updated_at` |
| **Biblioteca · Formularios** | Funciona contra `GET /doctor/forms/` y `POST /doctor/forms/` | `POST`, `DELETE` y listado enriquecido (último uso, autor) **no documentados** en `api.md` |
| **Calendario** | `GET /doctor/appointments/` sin filtros de rango ni `patient_name` | Filtrado por paciente/fecha se hace en cliente |
| **Contratos** | Inconsistencias entre `api.md` y `api.ts` | Varios endpoints/headers divergen o faltan en la doc |

---

## 2. Datos faltantes por pantalla / componente

### 2.1 Detalle de paciente — `VitalsBar`

**UI esperada:** alergias, enfermedades crónicas, medicamentos activos, tipo de sangre, indicador NOM del paciente (o del expediente).

| Dato | ¿Existe hoy? | Notas |
|------|--------------|-------|
| Alergias | No en API dedicada | Hoy solo texto libre en notas; sin lista estructurada |
| Crónicos | No | Idem |
| Medicamentos activos | No | Idem |
| Tipo de sangre | Parcial | El tipo `Patient` en frontend contempla `bloodType`, pero **`usePatient` no mapea** sangre desde `GET /patients/<id>/` ni desde identidad |
| NOM % del paciente | No en VitalsBar | La página de cumplimiento expone scores por paciente vía `GET /doctor/compliance/`, pero **no se consume en detalle de paciente** para la barra |

`PatientDetail.tsx` renderiza literalmente:

```tsx
<VitalsBar
  items={[
    { label: 'Alergias', value: 'No registradas' },
    { label: 'Crónicas', value: '—' },
    { label: 'Medicamentos', value: '—' },
    { label: 'Tipo sangre', value: patient.bloodType || '—' },
    { label: 'NOM %', value: '94%' },
  ]}
/>
```

**Campos útiles en respuestas existentes (si se amplían):**

- `GET /patients/<id>/profile/` — hoy: teléfono, `is_recurrent`, `avatar_url`, `has_interrogatory`. Podría incluir **resumen clínico mínimo** o IDs a sub-recursos.
- `GET /patients/<id>/identity-sheet/` — útil para edad y género (se está usando); **no sustituye** alergias/medicación.

---

### 2.2 Detalle de paciente — `Timeline` (Recetas / Laboratorios)

**Hoy:** `PatientDetail.tsx` compone el timeline con `GET .../notes/` + citas del doctor filtradas por `patient_id` + `getMockTimelineForPatient(id)` para eventos rx/lab (mapa vacío por defecto).

**Falta para el diseño:**

- Identificador, fecha, título y cuerpo/resumen **estructurado** para eventos que **no** sean notas ni citas.
- Opcional: vínculo a PDF/orden, laboratorio, estado del estudio.

**Origen posible sin endpoint nuevo:** parsear bloques de notas (sección receta delimitada en HTML) — frágil y costoso en cliente.

---

### 2.3 Dashboard — `TodayStrip` (celda “Cumplimiento NOM”)

**Hoy:** celda con valores hardcodeados (`'94%'`, `'· 1 alerta'`) en `Dashboard.tsx`.

**Para alinear con datos reales:**

- Reutilizar `GET /doctor/compliance/`: `overall_score`, `alert_breakdown` (critical / warning / ok).
- Añadir endpoint **ligero** con solo `overall_score` y conteos para no traer la lista completa de pacientes en cada visita al home.

---

### 2.4 Lista de pacientes — tabla compacta

Columnas del diseño: paciente, edad·género, contacto, sangre, estado (recurrente), última visita.

| Columna | Fuente actual | Brecha |
|----|----|----|
| Paciente | `GET /patients/?limit=` | OK (nombre, apellidos, `is_recurrent`) |
| Edad / género | Lista | **`birthdate` y `gender` no vienen en el listado**; solo en identidad por paciente (`GET .../identity-sheet/`) → N+1 requests o celda vacía |
| Contacto (email / teléfono) | Lista | **Email no está** en `listPatients`; teléfono solo en `getPatient` / `profile`, no en la lista |
| Sangre | Lista | **`bloodType` no viene** en `listPatients` (ni siquiera en identidad) |
| Última visita | Lista | **`lastVisit` no viene**; la UI muestra “Sin visitas” siempre salvo que se rellene desde otro flujo |

---

### 2.5 Calendario / Citas

`GET /doctor/appointments/` funciona pero tiene limitaciones para el diseño:

| Brecha | Impacto |
|----|----|
| Sin filtros de rango (`?from=&to=`) | El calendario trae todo y filtra en cliente; no escala |
| Sin filtro por paciente | `PatientDetail.tsx` filtra `appointments` localmente para el timeline del expediente |
| No embebe `patient_name` | Requiere join con `listPatients` en Dashboard/Calendar para pintar nombres |
| Sin metadatos de sala / modalidad / color | Si el diseño los contempla, hoy se invalida |
| `POST /doctor/appointments/` devuelve `null` | El cliente no puede mostrar/enlazar a la cita recién creada sin un refetch |

---

### 2.6 Notas y adjuntos

- `attachments` en listado/detalle de notas: el cliente las tipa como `unknown[]`. **Sigue sin documentarse el shape** (id, url, mime, nombre, tamaño) en `api.md`, y no se garantiza paridad entre `GET .../notes/` y `GET .../notes/<id>/`.
- El componente `NoteAttachmentsList` asume una forma específica que solo vive en el cliente.
- Para timeline “receta”: si la receta solo vive como HTML dentro de la nota, hace falta **convención de extracción** en API (campo derivado) o entidad aparte (ver §3).
- **Endpoints no documentados en `api.md` pero usados por el cliente:**
  - `GET /patients/<id>/notes/` (listar)
  - `GET /patients/<id>/notes/<note_id>/`
  - `PATCH /patients/<id>/notes/<note_id>/` (multipart, editar)
  - `PATCH /patients/<id>/notes/<note_id>/sign/?save_anyway=<bool>` (firmar)
  - `PATCH /patients/<id>/notes/<note_id>/attach/` (adjuntar archivos)

---

### 2.7 Página NOM (`GET /doctor/compliance/`)

La respuesta actual cubre bien: score global, desglose de alertas, pacientes con métricas y `computed_at`.

**Brechas UX:**

- **Exportar** (CSV/PDF): el botón existe en `Compliance.tsx` pero no hay ruta en `api.md` / `apiService`.
- **Filtros server-side** (por nivel de alerta, búsqueda por nombre): hoy se hace en cliente tras mapear nombres con `listPatients`; aceptable a mediana escala, en gran escala conviene query en backend.

---

### 2.8 Perfil del médico (`/profile`)

**Hoy:** `DoctorProfile.tsx` monta campos (`speciality`, `licenseNumber`, `phone`, `email`, `avatar`) desde `useAuth().doctor`, que se rellena con el **payload del `id_token`** (decodificado en `AuthContext`). El botón “Guardar cambios” solo llama `toast(...)`; el upload del avatar usa `URL.createObjectURL` y no persiste.

**Falta:**

- `GET /doctor/profile/` (o equivalente) con `first_name`, `last_name`, `gender`, `speciality`, `license_number`, `phone`, `email`, `avatar_url`, `role`.
- `PATCH /doctor/profile/` con los mismos campos editables.
- Upload de avatar: `POST /doctor/avatar/` (multipart) o `PATCH /doctor/profile/` aceptando `avatar` como archivo.
- Hoy la única fuente de verdad del doctor es el JWT; cualquier cambio requeriría re‑login hasta que backend exponga un perfil editable.

---

### 2.9 Biblioteca · Documentos profesionales

**Hoy:** `src/pages/library/DocumentsList.tsx` muestra una lista **hardcoded** (`INITIAL_DOCUMENTS`: cédula y certificado). No hay endpoint asociado ni lógica de subida/eliminación/descarga.

**Falta:**

| Operación | Sugerencia |
|----|----|
| Listar | `GET /doctor/documents/` con `results[]` (id, name, type, uploaded_at, size, mime_type, url) |
| Subir | `POST /doctor/documents/` multipart (file + type) |
| Eliminar | `DELETE /doctor/documents/<id>/` |
| Descargar | `GET /doctor/documents/<id>/` o `/download/` (binario, `Content-Disposition`) |

Tipos previstos por UX: cédula profesional, certificado de especialidad, CURP, comprobantes, etc. Conviene catálogo `document_type` acordado con clínica.

---

### 2.10 Biblioteca · Plantillas de notas

**Hoy:** `TemplatesList.tsx` + `TemplateEditor.tsx` leen/escriben vía **`templatesStore.ts`**, un store **en memoria** (se pierde al recargar). El seed inicial viene de `mockData.ts` (`mockNoteTemplates`, `mockWellnessNoteTemplates`).

En `api.md` sí existe `GET /doctor/templates/` pero con un shape incompleto:

```json
{ "id": "...", "name": "...", "content": "Rich text content here" }
```

**Brechas:**

- Respuesta actual no incluye `type` (`interrogation | evolution | exploration | document | custom | psychology-*`) ni `updated_at` (ambos los usa el listado).
- **No existen** `POST /doctor/templates/`, `PATCH /doctor/templates/<id>/`, `DELETE /doctor/templates/<id>/`.
- El cliente nunca llama `apiService.listDoctorTemplates()` hoy; todo se resuelve con el mock.

---

### 2.11 Biblioteca · Formularios

`FormulariosEditor` / `FormNoteFiller` / `FormNoteForm` ya consumen en cliente:

- `GET /doctor/forms/` → listar (**documentado**)
- `GET /doctor/forms/<id>/` → detalle (**documentado**)
- `GET /doctor/assets/<id>/` → PDF binario (**documentado**, pero ambiguo: en `api.md` se describe como un asset de “forms”; no queda claro si el id se refiere a un `form.key` o a otro recurso)
- `POST /doctor/forms/` multipart (`files`, `name`, `fields` JSON) → **no documentado**
- `DELETE /doctor/forms/<form_id>/` → **no documentado**
- `GET/POST/PATCH/DELETE /doctor/fields/` (catálogo de campos del doctor) → **no documentado**

El detalle (`GET /doctor/forms/<id>/`) devuelve un solo campo de ejemplo; el cliente lee `name`, `type` (`TEXT|NUMBER|DATE|CHECKBOX|SIGNATURE`), `required`, `tag` y `position`. Conviene formalizar el contrato de `fields[]` porque el ejemplo en `api.md` solo incluye `id` y `position`.

---

## 3. Endpoints nuevos o extensiones recomendadas

### 3.1 Alto valor para el diseño actual

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Resumen clínico del paciente** | `GET /patients/<id>/clinical-summary/` | Una respuesta para VitalsBar: `allergies[]`, `conditions[]`, `medications[]`, `blood_type`, `last_vitals?`, `nom_patient_score?` |
| **Resumen NOM para dashboard** | `GET /doctor/compliance/summary/` | `overall_score`, `alert_breakdown`, `worst_metric`, `computed_at` sin array de pacientes |
| **Listado de pacientes enriquecido** | Ampliar `GET /patients/` o `GET /patients/table/` | Incluir en cada fila: `birthdate`/`age`, `gender`, `phone`, `email?`, `blood_type`, `last_visit_at`, `avatar_url` |
| **Perfil del doctor** | `GET /doctor/profile/`, `PATCH /doctor/profile/`, `POST /doctor/avatar/` | Editar identidad profesional (§2.8) |
| **Documentos profesionales** | `GET/POST/DELETE /doctor/documents/` | Cédula, certificados, etc. (§2.9) |
| **Plantillas de notas (CRUD)** | `POST/PATCH/DELETE /doctor/templates/` | Reemplazar `templatesStore.ts` (§2.10) |

### 3.2 Timeline: recetas y laboratorios

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Órdenes / estudios de laboratorio** | `GET /patients/<id>/lab-orders/` | Lista para filtro “Labs” del timeline |
| **Recetas emitidas** | `GET /patients/<id>/prescriptions/` o eventos `GET /patients/<id>/timeline-events/` | Lista unificada tipo-discriminado (`note`, `appointment`, `prescription`, `lab`) ordenada por fecha |

Alternativa más compacta: **un solo** `GET /patients/<id>/timeline/?from=&to=&kinds=` que devuelva items ya fusionados.

### 3.3 Exportación y reporting

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Export cumplimiento** | `GET /doctor/compliance/export?format=csv` | Respuesta archivo para el botón “Exportar” |

### 3.4 Búsqueda (si se mantiene el botón del prototipo)

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Búsqueda global** | `GET /doctor/search?q=&types=patients,notes,appointments` | Unificar resultados con snippets y deep links |

### 3.5 Calendario

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Citas por rango** | `GET /doctor/appointments/?from=&to=&patient_id=` | Evitar traer toda la agenda en cada vista |
| **Nombre del paciente embebido** | Campo `patient_name` en resultados | Evitar N+1 con `listPatients` |
| **Respuesta de `POST` completa** | Devolver el objeto creado (no `null`) | Evitar refetch posterior a crear |

---

## 4. Extensiones mínimas a contratos existentes (sin ruta nueva)

Si se prefieren menos endpoints:

1. **`GET /patients/`** — ampliar cada resultado con los campos de la tabla (§2.4).
2. **`GET /doctor/compliance/`** — añadir `summary_line` opcional o documentar que el cliente use solo las primeras claves para el dashboard.
3. **`GET /doctor/templates/`** — agregar `type` y `updated_at` al resultado (hoy solo `id`, `name`, `content`).
4. **`GET /patients/<id>/notes/` y `/<note_id>/`** — incluir `attachments[]` con shape formal `{id, url, mime_type, original_filename, file_size}` (misma forma que `GET /patients/<id>/assets/`) en vez de `unknown[]`.
5. **Notas** — campo opcional `has_prescription: boolean` o `extracted_prescription_summary: string` para alimentar filtros de timeline sin parsear HTML en cliente.
6. **`POST /doctor/appointments/`** — devolver el objeto creado, no `null`.

---

## 5. Inconsistencias entre `api.md` y `src/services/api.ts`

| Tema | `api.md` | `src/services/api.ts` | Acción sugerida |
|------|----------|----------------------|-----------------|
| Header de identidad | `X-Clineo-Id: login.id` | `X-Clineo-Identity: login.id` | Alinear **un** nombre oficial y actualizar el lado contrario |
| Login payload | Muestra comas faltantes en los ejemplos JSON (`"password" "password"`, `"username": "..."` sin coma) | OK | Arreglar JSON del ejemplo en `api.md` |
| Update contact | `PUT /doctor/contacts/` (sin id) | `PUT /doctor/contacts/<id>/` | Documentar el patrón real con id |
| Delete appointment | `DELET` (typo) | `DELETE /doctor/appointments/<id>/` | Corregir `api.md` |
| Identity sheet | Solo `POST` + `GET` | Además `PATCH /patients/<id>/identity-sheet/` | Documentar `PATCH` |
| Patient profile | Solo `GET` | Además `PATCH /patients/<id>/profile/` | Documentar `PATCH` |
| Nota: firmar | No aparece | `PATCH /patients/<id>/notes/<note_id>/sign/?save_anyway=<bool>` | Documentar |
| Nota: editar | No aparece | `PATCH /patients/<id>/notes/<note_id>/` (multipart) | Documentar |
| Nota: adjuntar | No aparece | `PATCH /patients/<id>/notes/<note_id>/attach/` (multipart) | Documentar |
| Notas contador | No aparece | `GET /doctor/notes/count/` | Documentar |
| Doctor fields | No aparece | `GET/POST/PATCH/DELETE /doctor/fields/` | Documentar |
| Crear formulario | No aparece | `POST /doctor/forms/` multipart (files, name, fields JSON) | Documentar |
| Eliminar formulario | No aparece | `DELETE /doctor/forms/<form_id>/` | Documentar |
| Restaurar contacto | `POST /doctor/contacts/<id>/restore/` | Igual | OK |
| Upload assets | `POST /patients/<id>/assets/` regresa `null` | Igual | Documentar el límite (30 MB por archivo) y si regresa los ids creados |
| Forms asset download | Ejemplo apunta a PDF bajo `/forms/...` | `GET /doctor/assets/<id>/` | Clarificar si `<id>` es `form.key` u otro recurso |
| Password reset | `method` solo parece admitir `email` | El cliente siempre envía `method: 'email'` | Documentar valores válidos de `method` |

---

## 6. Priorización sugerida (backend ↔ UX)

1. **P0 — Perfil del doctor (`GET/PATCH /doctor/profile/` + avatar):** hoy los cambios en `/profile` no persisten; bloquea usabilidad básica.
2. **P0 — Lista de pacientes:** enriquecer listado o endpoint tabla (impacto directo en columnas vacías, N+1 con identidad).
3. **P0 — Dashboard NOM:** `compliance` summary o segunda llamada liviana (eliminar números falsos).
4. **P0 — Plantillas de notas (POST/PATCH/DELETE + `type`/`updated_at` en GET):** hoy todo vive en memoria y se pierde al recargar.
5. **P1 — VitalsBar:** `clinical-summary` o campos en `profile`/identidad acordados con clínica.
6. **P1 — Timeline rx/lab:** timeline unificado o recursos por tipo.
7. **P1 — Calendario:** filtros `from/to`, `patient_name`, respuesta de `POST`.
8. **P1 — Documentos profesionales del doctor:** CRUD completo.
9. **P2 — Export NOM / búsqueda global / attachments formalizados:** según roadmap de producto.
10. **P2 — Alinear `api.md` con `api.ts`:** headers, endpoints no documentados, typos (sección §5).

---

## 7. Nota de implementación frontend

Los placeholders y mocks actuales están acotados y bien delimitados:

- `PatientDetail.tsx` — items fijos de `VitalsBar`.
- `Dashboard.tsx` — celda NOM en `TodayStrip`.
- `DoctorProfile.tsx` — `handleSaveProfile` (toast only) y upload de avatar con `URL.createObjectURL`.
- `library/DocumentsList.tsx` — `INITIAL_DOCUMENTS` hardcoded.
- `data/templatesStore.ts` — store en memoria seedeado con `mockData.ts`.
- `data/timelineMockData.ts` — mapa vacío para entradas rx/lab.

Cuando el backend exponga los datos y endpoints anteriores, el trabajo en frontend será principalmente **mapeo y eliminación de mocks**, no rediseño: cada punto de contacto ya está aislado detrás de un hook (`usePatients`, `usePatientIdentity`, `useNotes`, etc.) o de `apiService`.

---

*Documento generado para alinear equipo de producto/backend con el diseño prototipo v2. Actualizar cuando `api.md` incorpore nuevos contratos o se cierren los gaps listados arriba.*
