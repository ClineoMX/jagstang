# Frontend Migration Plan — Mustang API v1.7 → v2.0

Companion to [`MIGRATION_v1.7_to_v2.0.md`](./MIGRATION_v1.7_to_v2.0.md). This is the
**frontend execution plan**, ordered by risk. It maps each 🔴 breaking change to the
concrete files that must change. Almost all server calls go through
`src/services/api.ts`, so that file is the chokepoint — most consumers only need
type/shape adjustments.

> Scope note: appointments, contacts, doctor forms/fields/templates/compliance are
> **not part of `/patients/`** and are untouched by this migration.

---

## Impact map (call sites found in `src/`)

| Area | `api.ts` method | Consumers | Change |
|------|-----------------|-----------|--------|
| Note create | `createNote` | `useNotes.ts`, `NoteForm.tsx`, `FormNoteForm.tsx` | multipart → JSON; drop `files`; `is_follow_up_of` → `parent_id`; add `custom_date` |
| Note update | `updateNote` | `useNotes.ts`, `NoteForm.tsx`, `FormNoteForm.tsx` | multipart → JSON; add `custom_date` |
| Note date | `updateNoteDate` | `useNotes.ts`, `NoteForm.tsx:190`, `FormNoteForm.tsx:182` | endpoint removed → fold into `updateNote` |
| Note analysis | `getNoteAnalysis` | `useNotes.ts`, `NoteForm.tsx:420` | endpoint removed → read `note.analysis` |
| Follow-up parse | `parseFollowUpFromApi` | `noteFollowUp.ts`, `useNotes`, `types/index.ts` | response `is_follow_up_of` → `parent` |
| Note attachments | `attachFilesToNote` | `NoteForm.tsx` (via `files`), `NoteAttachmentsList.tsx` | decouple → use assets `PUT` |
| Identity | `getPatientIdentity` / `createPatientIdentity` / `updatePatientIdentity` | `usePatientIdentity.ts` | `identity-sheet` → `identity`; collapse to one `PATCH`; read from unified view |
| Vitals / summary | `getPatientVitals` / `upsertPatientVitals` | `usePatientVitals.ts` | **see decision #1** — likely → `clinical-summary` + unified view |
| Assets upload | `uploadPatientAssets` | `PatientDocuments.tsx` | `POST` → `PUT`; response `url` → `mime_type`+`file_size` |
| Patient list/get | `listPatients` / `getPatient` | `usePatients.ts`, store | drop `grant_type`; embed sub-resources |
| Patients table | `listPatientsTable` | `clinicDataStore.ts:87` | endpoint removed → use enriched `listPatients` |
| Consents | `listPatientConsents` | `usePatientConsents.ts` → `PatientDetail.tsx:300` | endpoint removed → drop feature |
| Summary stream | `streamPatientNotesSummary` | `usePatientNotesSummary.ts` | handle `429` rate limit |

---

## Decisions needed before coding

1. **`usePatientVitals` is semantically the new "clinical summary", not "vitals".**
   The current hook reads/writes `{ blood_type, allergies, medications,
   chronic_conditions }` against `/vitals/`. In v2.0 that exact shape is the new
   **`PATCH /clinical-summary/`** (and `summary` in the unified view). The v2.0
   `/vitals/` endpoint is a *different* resource (`*_bpm` / `*_mm_hg` / `*_celsius`).
   → Plan assumes we repoint `usePatientVitals` to `clinical-summary`. Confirm there
   is no UI consuming heart-rate/BP-style vitals (none found).
2. **Consents** (`PatientDetail.tsx`) have no v2.0 replacement. Plan removes the UI
   block. Confirm this feature can be dropped vs. hidden behind a flag.
3. **Attachments on notes**: notes no longer carry `attachments`. Confirm the UX —
   attachments become patient-level assets, no longer note-scoped. `NoteAttachmentsList`
   may need to move to/read from the assets list.

---

## Phase 0 — Endpoint constants & param rename (low risk, do first)

`src/config/api.ts`:
- Add the new routes to `API_ENDPOINTS`: `PATIENTS_IDENTITY`, `PATIENTS_CLINICAL_SUMMARY`,
  `EVENTS_STREAM(client)`, and keep asset/note item routes using a `{resource_id}` shape.
- Note routes are currently rooted at `/${patientId}/notes/...` (missing `/patients`
  prefix) — reconcile with the `/patients/{id}/...` routes used directly in `api.ts`.
- Remove dead endpoints: `PATIENT_CONSENTS_*`, and the unused `NOTES_ATTACH`.

The `{note_id}`/`{asset_id}` → `{resource_id}` rename is **internal only** (we build
the URLs); no behavioral change, just keep naming consistent.

---

## Phase 1 — Notes: multipart → JSON (highest blast radius) 🔴

`src/services/api.ts`:
- `createNote`: drop `FormData`; send JSON `{ content, note_type, title, parent_id?,
  custom_date? }`. Rename the param `is_follow_up_of` → `parent_id`. Remove `files`
  from the signature (attachments are decoupled).
- `updateNote`: drop `FormData`; send JSON `{ title?, content?, note_type?, custom_date? }`.
  Remove `files`.
- `getNote` / `listNotes` response types: `is_follow_up_of` → `parent`; add
  `analysis` (nullable) and `is_signed`; drop `attachments`.
- Delete `updateNoteDate`, `getNoteAnalysis`, `attachFilesToNote`.

`src/hooks/useNotes.ts`:
- `createNote`: pass `custom_date` in the body instead of calling `updateNoteDate`;
  stop forwarding `files`.
- `updateNote`: accept/forward `custom_date`.
- Remove `getNoteAnalysis` / `updateNoteDate` wrappers; expose `analysis` straight
  from the note object.

`src/utils/noteFollowUp.ts` & `src/types/index.ts`:
- `parseFollowUpFromApi` should read `parent` (keep `is_follow_up_of` fallback only if
  any cached/legacy data lingers — otherwise drop it).

`src/pages/NoteForm.tsx` (and `FormNoteForm.tsx`):
- `NoteForm.tsx:190` / `FormNoteForm.tsx:182`: replace `updateNoteDate(...)` with the
  date folded into the save/`updateNote` call.
- `NoteForm.tsx:420`: replace `await getNoteAnalysis(id)` with `note.analysis` from the
  fetched note (handle `null`).
- `NoteForm.tsx:658`: attachments (`files`) no longer go through note save — route them
  to `uploadPatientAssets` (Phase 3) or gate behind decision #3.

---

## Phase 2 — Identity: `identity-sheet` → `identity` upsert 🔴

`src/services/api.ts`:
- Delete `getPatientIdentity` and `createPatientIdentity`.
- Keep a single `upsertPatientIdentity(patientId, data)` → `PATCH
  /patients/{id}/identity/`.

`src/hooks/usePatientIdentity.ts`:
- Remove the `exists` / create-vs-update branching in `saveIdentity` — always `PATCH`.
- Source initial `identity` from the unified patient view (`identity_sheet`) instead of
  the removed `GET`. Either accept it as a prop from `getPatient`, or keep a thin
  refetch that re-reads the patient. (Recommend: feed from the patient fetch to avoid
  an extra round-trip.)

---

## Phase 3 — Assets: `POST` → `PUT`, response shape 🔴

`src/services/api.ts`:
- `uploadPatientAssets`: method `POST` → `PUT` (still `multipart/form-data`).
- Response no longer has `url`; it's `{ id, filename, mime_type, file_size }`. Download
  continues via `getPatientAsset` (already a blob fetch — unchanged, good).

`src/components/PatientDocuments.tsx`:
- Any code reading `asset.url` must switch to fetching bytes via `getPatientAsset`
  (already returns a Blob) and using an object URL.

---

## Phase 4 — Unified patient view & removed GETs 🟡

`src/services/api.ts`:
- `getPatient` response: drop `grant_type`; add nested `summary`, `identity_sheet`,
  `interrogatory`, `vital`.
- `listPatients` results: drop `grant_type`; rows are now the enriched objects.

`src/lib/clinicDataStore.ts:87`:
- Replace `listPatientsTable` with `listPatients` (now enriched) and re-map fields.

`src/hooks/usePatientVitals.ts` (per decision #1):
- Point `upsertPatientVitals` → `PATCH /patients/{id}/clinical-summary/`.
- Drop `getPatientVitals`; seed state from the unified view's `summary` field.
- Payload list entries already use `{ name, suggested }` shape (matches v2.0 spec) —
  the existing `created_at` field can be dropped from the write payload.

---

## Phase 5 — Removals & resiliency

- **Consents**: delete `listPatientConsents`, `usePatientConsents.ts`, and the consents
  block in `PatientDetail.tsx:300` (decision #2).
- **`streamPatientNotesSummary`**: add explicit `429` handling (rate limit: 5/IP/60h) —
  surface a friendly "límite alcanzado, intenta más tarde" instead of a generic error.
- **Interrogatory**: create via `POST /notes/` with `note_type: "interrogation"`
  (already works through `createNote`); read from `getPatient().interrogatory`.

---

## Phase 6 — New: SSE events stream (optional, follow-up) 🟢

`GET /events/{client}/` replaces analysis polling. The SSE plumbing already exists
(`consumeSseStream` in `api.ts`). Add a `subscribeEvents(client, onEvent)` method and a
hook to refresh a note's `analysis` when a background-analysis event arrives. Can ship
after the breaking changes land — not required for correctness.

---

## Validation

After each phase: `npm run lint`, then `npm run build` (`tsc -b`) to catch shape
mismatches the type changes will surface. Manually smoke-test: create/edit/sign a note,
edit identity, upload a document, open a patient detail.

## Suggested PR slicing

1. Phase 0 + 1 (notes JSON) — the big one, self-contained.
2. Phase 2 (identity) + Phase 4 (unified view, incl. vitals→summary).
3. Phase 3 (assets).
4. Phase 5 (removals + 429).
5. Phase 6 (events SSE) — separate, optional.
