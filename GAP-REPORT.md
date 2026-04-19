# Informe de brechas API ↔ diseño (Clineo v2)

Este documento describe **qué datos faltan en las respuestas de los endpoints actuales** para alimentar el nuevo diseño sin placeholders, y **qué endpoints o extensiones** convendría exponer en backend.

Referencia de rutas ya usadas en la app: `src/services/api.ts` y `api.md`.

---

## 1. Resumen ejecutivo

| Área UI | Estado hoy | Causa principal |
|--------|-------------|-----------------|
| **Barra de signos / resumen clínico** (VitalsBar) | Texto fijo o genérico | No hay modelo agregado de alergias, crónicos, medicamentos ni NOM por paciente en una sola respuesta ligera |
| **Timeline** (filtros Recetas / Labs) | Solo notas + citas reales; rx/lab opcionales vía mock vacío | No hay entidades de receta/lab independientes del HTML de la nota |
| **Dashboard · franja NOM** | Valores estáticos (`94%`, `1 alerta`) | No se llama a `GET /doctor/compliance/` en home; además haría falta un resumen “de una línea” o reusar el reporte completo |
| **Lista de pacientes (tabla)** | Edad, género, sangre, última visita, email suelen quedar vacíos | `GET /patients/` devuelve pocos campos; identidad y perfil no se incluyen en el listado |
| **Cumplimiento NOM (página)** | Datos reales del reporte | Botón “Exportar” sin endpoint |
| **Búsqueda global** (Dashboard) | UI sin acción | No hay búsqueda unificada pacientes/notas/citas |

---

## 2. Datos faltantes por pantalla / componente

### 2.1 Detalle de paciente — `VitalsBar`

**UI esperada:** alergias, enfermedades crónicas, medicamentos activos, tipo de sangre, indicador NOM del paciente (o del expediente).

| Dato | ¿Existe hoy? | Notas |
|------|----------------|-------|
| Alergias | No en API dedicada | Hoy solo texto libre en notas; no hay lista estructurada |
| Crónicos | No | Idem |
| Medicamentos activos | No | Idem |
| Tipo de sangre | Parcial | El tipo `Patient` en frontend contempla `bloodType`, pero **`usePatient` no mapea** sangre desde `GET /patients/<id>/` ni desde identidad documentada en `api.md` para ese campo |
| NOM % del paciente | No en VitalsBar | La página de cumplimiento expone scores por paciente vía `GET /doctor/compliance/`, pero **no se consume en detalle de paciente** para la barra |

**Campos útiles en respuestas existentes (si se amplían):**

- `GET /patients/<id>/profile/` — hoy: teléfono, `is_recurrent`, `avatar_url`. Podría incluir **resumen clínico mínimo** o IDs a sub-recursos.
- `GET /patients/<id>/identity/` — útil para edad (derivada de `birthdate`) y género en lista/detalle, pero **no sustituye** alergias/medicación.

---

### 2.2 Detalle de paciente — `Timeline` (Recetas / Laboratorios)

**Hoy:** el timeline mezcla `GET .../notes/` + citas del doctor filtradas por `patient_id`. Las entradas **rx** y **lab** solo aparecen si se rellena `timelineMockData.ts` (mapa vacío por defecto).

**Falta para el diseño:**

- Identificador, fecha, título y cuerpo/resumen **estructurado** para eventos que **no** sean notas ni citas.
- Opcional: vínculo a PDF/orden, laboratorio, estado del estudio.

**Origen posible sin endpoint nuevo:** parsear bloques de notas (p. ej. sección receta delimitada en HTML) — frágil y costoso en cliente.

---

### 2.3 Dashboard — `TodayStrip` (celda “Cumplimiento NOM”)

**Hoy:** valores hardcodeados (`94%`, `· 1 alerta`).

**Para alinear con datos reales:**

- Reutilizar `GET /doctor/compliance/` (ya documentado): `overall_score`, `alert_breakdown` (critical / warning / ok).
- Opcional: endpoint **ligero** solo con `overall_score` y conteos de alertas para no cargar la lista de pacientes en cada visita al home.

---

### 2.4 Lista de pacientes — tabla compacta

Columnas del diseño: paciente, edad·género, contacto, sangre, estado (recurrente), última visita.

| Columna | Fuente actual | Brecha |
|---------|----------------|--------|
| Paciente | `GET /patients/?limit=` | OK (nombre, apellidos, `is_recurrent`) |
| Edad / género | Lista | **`birthdate` y `gender` no vienen en el listado**; solo en identidad por paciente (`GET .../identity/`) → N+1 requests o lista incompleta |
| Contacto (email / teléfono) | Lista | **Email no está en** `listPatients` según tipos actuales; teléfono a veces en `getPatient` / profile, no en lista |
| Sangre | Lista | **`bloodType` no viene** en `listPatients` |
| Última visita | Lista | **`lastVisit` no viene**; la UI muestra “Sin visitas” siempre salvo que se rellene el objeto en otro flujo |

---

### 2.5 Calendario

Citas: `GET /doctor/appointments/` — alineado con el diseño.

Posibles mejoras documentales (no bloquean el diseño):

- Metadatos de sala / modalidad / color por tipo de cita (si el prototipo los muestra).
- `patient_name` embebido en la cita para evitar join con lista de pacientes en vistas densas.

---

### 2.6 Notas y adjuntos

- `attachments` en listado/detalle de notas: la app ya contempla el array; conviene **documentar formalmente** el shape (id, url, mime, nombre, tamaño) en `api.md` y garantizar paridad entre `GET .../notes/` y `GET .../notes/<id>/`.
- Para timeline “receta”: si la receta solo vive como HTML dentro de la nota, hace falta **convención de extracción** en API (campo derivado) o entidad aparte (ver §3).

---

### 2.7 Página NOM (`GET /doctor/compliance/`)

La respuesta actual cubre bien: score global, desglose de alertas, pacientes con métricas y `computed_at`.

**Brechas UX:**

- **Exportar** (CSV/PDF): no hay ruta en `api.md` / `apiService`.
- **Filtros server-side** (por nivel de alerta, búsqueda por nombre): hoy se hace en cliente tras mapear nombres con `listPatients`; aceptable a mediana escala; a gran escala conviene query en backend.

---

## 3. Endpoints nuevos o extensiones recomendadas

### 3.1 Alto valor para el diseño actual

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Resumen clínico del paciente** | `GET /patients/<id>/clinical-summary/` | Una respuesta para VitalsBar: alergias[], conditions[], medications[], blood_type, optional last_vitals{}, optional nom_patient_score |
| **Resumen NOM para dashboard** | `GET /doctor/compliance/summary/` | `overall_score`, `alert_breakdown`, `worst_metric`, `computed_at` sin array de pacientes |
| **Listado de pacientes enriquecido** | Ampliar `GET /patients/` o `GET /patients/table/` | Incluir en cada fila: `birthdate` o `age`, `gender`, `phone`, `email?`, `blood_type`, `last_visit_at`, `avatar_url` para evitar N+1 |

### 3.2 Timeline: recetas y laboratorios

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Órdenes / estudios de laboratorio** | `GET /patients/<id>/lab-orders/` | Lista para filtro “Labs” del timeline |
| **Recetas emitidas** | `GET /patients/<id>/prescriptions/` o eventos `GET /patients/<id>/timeline-events/` | Lista unificada tipo-discriminado (`note`, `appointment`, `prescription`, `lab`) ordenada por fecha |

Alternativa más compacta: **un solo** `GET /patients/<id>/timeline/?from=&to=&kinds=` que devuelva items ya fusionados para la UI.

### 3.3 Exportación y reporting

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Export cumplimiento** | `GET /doctor/compliance/export?format=csv` | Respuesta archivo para el botón “Exportar” |

### 3.4 Búsqueda (si se mantiene el botón del prototipo)

| Propuesta | Método y ruta (sugerencia) | Objetivo |
|-----------|---------------------------|----------|
| **Búsqueda global** | `GET /doctor/search?q=&types=patients,notes,appointments` | Unificar resultados con snippets y deep links |

---

## 4. Extensiones mínimas a contratos existentes (sin ruta nueva)

Si se prefieren menos endpoints:

1. **`GET /patients/`** — ampliar cada resultado con los campos de la tabla (§2.4).
2. **`GET /doctor/compliance/`** — añadir campo opcional `summary_line` o documentar que el cliente use solo las primeras claves para el dashboard.
3. **Notas** — campo opcional `has_prescription: boolean` o `extracted_prescription_summary: string` para alimentar filtros de timeline sin parsear HTML en cliente.

---

## 5. Priorización sugerida (backend ↔ UX)

1. **P0 — Lista de pacientes:** enriquecer listado o endpoint tabla (impacto directo en columnas vacías).
2. **P0 — Dashboard NOM:** `compliance` summary o segunda llamada liviana (eliminar números falsos).
3. **P1 — VitalsBar:** `clinical-summary` o campos en profile/identity acordados con clínica.
4. **P1 — Timeline rx/lab:** timeline unificado o recursos por tipo.
5. **P2 — Export / búsqueda global** según roadmap de producto.

---

## 6. Nota de implementación frontend

Los placeholders actuales están acotados en código comentado o valores literales (p. ej. `PatientDetail.tsx` items de `VitalsBar`, celda NOM en `Dashboard.tsx`). Cuando el backend exponga los datos anteriores, el trabajo en frontend será principalmente **mapeo y eliminación de mocks**, no rediseño.

---

*Documento generado para alinear equipo de producto/backend con el diseño prototipo v2. Actualizar cuando `api.md` incorpore nuevos contratos.*
