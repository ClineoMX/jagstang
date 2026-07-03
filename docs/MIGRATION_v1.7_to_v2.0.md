# Mustang API — Migration Guide: v1.7 → v2.0

This document describes every API contract change between **v1.7** (the
`main`/production API) and **v2.0** (the `v2` branch). It is written for the
**frontend** so the client can be updated endpoint-by-endpoint.

For the full v2.0 reference, see [`API.md`](./API.md). This guide only covers
**what changed**.

> Legend: 🔴 breaking · 🟡 changed · 🟢 new · ⚫ removed

---

## TL;DR — what will break the frontend

1. 🔴 **Notes are now JSON, not `multipart/form-data`.** `POST`/`PATCH` on
   notes previously sent form fields (and inline attachments). They now send a
   JSON body. Attachments are no longer part of the note payload — upload them
   through the separate assets endpoint.
2. 🔴 **Path param naming unified to `{resource_id}`.** `{note_id}` and
   `{asset_id}` are gone; all sub-resource item routes use `{resource_id}`.
3. 🔴 **Identity path renamed** `identity-sheet` → `identity`, and collapsed
   from 3 endpoints (`POST`/`GET`/`PATCH`) to a single `PATCH` upsert.
4. 🔴 **Note `is_follow_up_of` renamed to `parent` / `parent_id`.**
5. 🔴 **Assets create is now `PUT` (was `POST`)** and the response shape
   changed (`url` dropped; `mime_type` + `file_size` added).
6. 🟢 **New endpoints:** SSE event stream, clinical-summary upsert.
7. ⚫ **Removed endpoints:** `/patients/table/`, `/admin/metrics/notes/`,
   `/notes/interrogatory/`, `/notes/{id}/date/`, `/notes/{id}/analysis/`,
   `GET /identity-sheet/`, `POST /identity-sheet/`, `GET /vitals/`,
   `/consents/`.

---

## Endpoint map (old → new)

| v1.7 (main)                                  | v2.0 (v2)                                  | Status |
|----------------------------------------------|--------------------------------------------|--------|
| —                                            | `GET /events/{client}/`                    | 🟢 new (SSE) |
| `GET /patients/`                             | `GET /patients/`                           | 🟡 response embeds sub-resources |
| `POST /patients/`                            | `POST /patients/`                          | ✅ unchanged |
| `GET /patients/table/`                       | —                                          | ⚫ removed |
| `GET /patients/admin/metrics/notes/`         | —                                          | ⚫ removed |
| `GET /patients/{id}/`                        | `GET /patients/{id}/`                       | 🟡 unified view (see below) |
| `PUT /patients/{id}/`                        | `PUT /patients/{id}/`                       | ✅ unchanged |
| `POST /patients/{id}/identity-sheet/`        | `PATCH /patients/{id}/identity/`           | 🔴 path + method consolidated |
| `GET  /patients/{id}/identity-sheet/`        | — (read via unified patient view)          | ⚫ removed |
| `PATCH /patients/{id}/identity-sheet/`       | `PATCH /patients/{id}/identity/`           | 🔴 path renamed |
| —                                            | `PATCH /patients/{id}/clinical-summary/`   | 🟢 new |
| `GET  /patients/{id}/assets/`                | `GET  /patients/{id}/assets/`              | 🟡 response shape changed |
| `POST /patients/{id}/assets/`                | `PUT  /patients/{id}/assets/`              | 🔴 method changed |
| `GET  /patients/{id}/assets/{asset_id}/`     | `GET  /patients/{id}/assets/{resource_id}/`| 🔴 param renamed |
| `GET  /patients/{id}/notes/`                 | `GET  /patients/{id}/notes/`               | ✅ unchanged |
| `POST /patients/{id}/notes/`                 | `POST /patients/{id}/notes/`               | 🔴 multipart → JSON |
| `GET  /patients/{id}/notes/interrogatory/`   | — (via unified patient view `interrogatory`)| ⚫ removed |
| `GET  /patients/{id}/notes/summary/`         | `GET  /patients/{id}/notes/summary/`       | 🟡 now rate-limited SSE |
| `GET  /patients/{id}/notes/{note_id}/`       | `GET  /patients/{id}/notes/{resource_id}/` | 🔴 param renamed |
| `PATCH /patients/{id}/notes/{note_id}/`      | `PATCH /patients/{id}/notes/{resource_id}/`| 🔴 param renamed + multipart→JSON |
| `PATCH /patients/{id}/notes/{note_id}/sign/` | `PATCH /patients/{id}/notes/{resource_id}/sign/` | 🔴 param renamed |
| `PATCH /patients/{id}/notes/{note_id}/date/` | — (fold into note `PATCH` body)            | ⚫ removed |
| `GET  /patients/{id}/notes/{note_id}/analysis/` | — (embedded in note `analysis` field)   | ⚫ removed |
| `GET  /patients/{id}/consents/`              | —                                          | ⚫ removed |
| `PUT  /patients/{id}/vitals/`                | `PUT  /patients/{id}/vitals/`              | ✅ unchanged |
| `GET  /patients/{id}/vitals/`                | —                                          | ⚫ removed |

Auth is unchanged: same Cognito `Authorization: Bearer <JWT>`, same
`ADMIN`/`DOCTOR`/`WELLNESS` roles, same per-patient grant model.

---

## Notes

### `POST /notes/` and `PATCH /notes/{resource_id}/` — multipart → JSON 🔴

**v1.7:** `Content-Type: multipart/form-data`, fields:
`content`, `note_type`, `title`, `is_follow_up_of`, plus file parts for
inline attachments.

**v2.0:** `Content-Type: application/json`.

`POST` body:
```json
{
  "content": "Patient reports ...",   // required, min length 10
  "note_type": "evolution",            // required
  "title": "Follow-up",                // required
  "parent_id": "note-123",             // optional (was "is_follow_up_of")
  "custom_date": "2026-06-28T00:00:00Z" // optional (was a separate endpoint)
}
```

`PATCH` body (draft notes only, all optional):
```json
{ "content": "...", "note_type": "...", "title": "...", "custom_date": "..." }
```

Key changes:
- **`is_follow_up_of` → `parent_id`** in the request.
- **`custom_date`** is now set on create and via the normal `PATCH`. The
  dedicated `PATCH /notes/{id}/date/` endpoint is gone.
- **Attachments are no longer part of the note request.** Upload files through
  `PUT /patients/{id}/assets/` instead (separate resource).

### Note response shape 🟡

**v1.7:**
```json
{
  "id": "...", "created_at": "...", "content": "...", "note_type": "...",
  "status": "...", "title": "...",
  "attachments": [ { "id": "...", "filename": "...", "url": "..." } ],
  "is_follow_up_of": { "id": "...", "note_type": "...", "title": "...", "custom_date": "..." }
}
```

**v2.0:**
```json
{
  "id": "...", "created_at": "...", "content": "...", "note_type": "...",
  "status": "...", "title": "...",
  "parent": { "id": "...", "note_type": "...", "title": "...", "custom_date": "..." },
  "analysis": {
    "completeness_score": 0.0,
    "missing_fields": [], "uncertain_fields": [], "reasoning": {}
  },
  "is_signed": false
}
```

- `is_follow_up_of` → **`parent`** (same inner fields).
- **`analysis`** is now embedded in the note (replaces the removed
  `GET /notes/{id}/analysis/` endpoint). May be `null`.
- **`is_signed`** boolean added (in addition to the existing `status`, which is
  `"draft"` or `"signed"`).
- `attachments` is no longer returned on the note.

### `GET /notes/summary/` 🟡

Still streams an AI clinical summary over SSE, but is now **rate-limited to 5
requests per IP per 60 hours**. On limit, expect `429 Too Many Requests`.

### Interrogatory 🔴

There is no longer a `GET /notes/interrogatory/` endpoint. Instead:
- **Create** an interrogatory by `POST /notes/` with `"note_type":
  "interrogation"` (the server routes it through the interrogatory path).
- **Read** the patient's interrogatory from the unified patient view response
  (`interrogatory` field on `GET /patients/{id}/`).

---

## Patients

### `GET /patients/{id}/` — unified patient view 🟡

The single-patient response now embeds the latest related resources, so the
frontend no longer needs to fan out to `identity-sheet`, `vitals`,
`interrogatory`, etc.

**v2.0 response:**
```json
{
  "id": "...", "name": "...", "lastname": "...", "lastname_m": "...",
  "is_recurrent": false, "phone": "...", "slug": "...",
  "summary": { /* ClinicalSummary or null */ },
  "identity_sheet": { /* Identity or null */ },
  "interrogatory": { /* Note or null */ },
  "vital": { /* Vital or null */ }
}
```

- New nested fields: `summary`, `identity_sheet`, `interrogatory`, `vital`.
- `grant_type` is no longer part of the patient object.
- The list endpoint (`GET /patients/`) wraps the same enriched objects in the
  standard `{ size, count, results }` envelope.

`POST` / `PUT /patients/{id}/` request bodies are unchanged
(`name`, `lastname`, `lastname_m`, `phone`).

---

## Identity sheet 🔴

- **Path renamed:** `identity-sheet` → `identity`.
- **Collapsed to one endpoint:** the old `POST` (create) and `GET` (read) are
  removed; use the single `PATCH /patients/{id}/identity/` upsert. Read the
  current values from the unified patient view (`identity_sheet`).
- **Field set is unchanged** (`birthdate`, `gender`, `birthplace_*`,
  `residence_*`, `occupation`, `education`, `marital_status`, `religion`,
  `nationality`, `education_level`, `emergency_contact_*`, `referred_by`).
- Response is the resulting `Identity` (only populated fields present).

---

## Clinical summary 🟢

New in v2.0: `PATCH /patients/{id}/clinical-summary/` (upsert).

```json
{
  "blood_type": "O+",
  "allergies": [{ "name": "penicillin", "suggested": false }],
  "medications": [{ "name": "metformin", "suggested": true }],
  "chronic_conditions": [{ "name": "type 2 diabetes", "suggested": false }]
}
```

List-valued fields use `{ "name": string, "suggested": bool }` entries. The
current values are also surfaced under `summary` in the unified patient view.

---

## Assets 🔴

- **Create method changed:** `POST` → **`PUT`** `/patients/{id}/assets/`
  (still `multipart/form-data`, max 30 MB, supports multiple files).
- **Item param renamed:** `{asset_id}` → `{resource_id}`.
- **Response shape changed:**

  v1.7: `{ "id", "filename", "url" }`

  v2.0: `{ "id", "filename", "mime_type", "file_size" }`

  The pre-signed `url` is gone — fetch bytes by `GET
  /patients/{id}/assets/{resource_id}/`, which streams the decrypted file
  directly.

---

## Vitals 🟡

- `PUT /patients/{id}/vitals/` request/response are **unchanged** (all the
  `*_bpm` / `*_mm_hg` / `*_celsius` fields, `taken_at`, etc.).
- `GET /patients/{id}/vitals/` is **removed** — the latest vital is available
  via `vital` in the unified patient view.

---

## Events / real-time 🟢

New `GET /events/{client}/` Server-Sent Events stream. Use it for async
notifications (e.g. when a background AI analysis finishes) instead of polling
the old `GET /notes/{id}/analysis/` endpoint. `{client}` identifies the
subscriber; the connection is long-lived with periodic keep-alives and returns
`text/event-stream`.

---

## Frontend migration checklist

- [ ] Switch note `POST`/`PATCH` from `multipart/form-data` to JSON.
- [ ] Rename note request field `is_follow_up_of` → `parent_id`.
- [ ] Rename note response field `is_follow_up_of` → `parent`.
- [ ] Move custom-date edits into the note `PATCH` body; drop calls to
      `/notes/{id}/date/`.
- [ ] Read note `analysis` from the note object; drop `/notes/{id}/analysis/`.
- [ ] Decouple attachment uploads from note creation; use the assets endpoint.
- [ ] Update all item paths to `{resource_id}` (`{note_id}`, `{asset_id}`).
- [ ] Rename identity path `identity-sheet` → `identity`; use `PATCH` upsert
      only; read identity from the unified patient view.
- [ ] Change asset create from `POST` to `PUT`; update response parsing
      (`url` → `mime_type` + `file_size`).
- [ ] Add clinical-summary `PATCH` support.
- [ ] Read interrogatory / vitals / identity / summary from the unified
      `GET /patients/{id}/` response instead of dedicated GET endpoints.
- [ ] Replace analysis polling with the SSE `GET /events/{client}/` stream.
- [ ] Handle `429` on `GET /notes/summary/` (rate limited).
- [ ] Remove usage of dropped endpoints: `/patients/table/`,
      `/admin/metrics/notes/`, `/consents/`.
</content>
