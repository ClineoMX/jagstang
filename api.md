# Login
---

Path: `/auth/login/`
Method: `POST`

Headers: `"Content-Type:application/json,X-Clineo-Api-Key:process.env.apikey"`

Payload: 
```json
{
	"username": "email@example.com",
	"password" "password",
	"method": "email"
}
```

Response: 
```json
{
	"access": "token",
	"refresh": "token",
	"id": "token"
}
```

# Request OTP
---

Path: `/auth/otp/`
Method: `POST`

Headers: `"Content-Type:application/json,X-Clineo-Api-Key:process.env.apikey"`

Payload: 
```json
{
	"username": "email@example.com",
	"method": "email"
}
```
Response:
```null
```

# Change Password
---

Path: `/auth/password/`
Method: `PATCH`

Headers: `"Content-Type:application/json,X-Clineo-Api-Key:process.env.apikey"`

Payload: 
```json
{
	"code": "<otp>",
	"username": "email@example.com"
	"password": "newPassword"
}
```
Response:
```null
```

# List Patients
---

Path: `/patients/?limit=int&page=int`
Method: `GET`

Headers: `"Content-Type:application/json,X-Clineo-Api-Key:process.env.apikey,X-Clineo-Id:login.id,Authorization:Bearer login.access"`

Payload: ```
null
```

Response: 
```json
{
	"results": [{...}],
	"count": 1,
	"page"`: 1,
	"size"`: 10
}
```

# Create Patient
---

Path: `/patients/`
Method: `POST`

Headers: `"Content-Type:application/json,X-Clineo-Api-Key:process.env.apikey,X-Clineo-Id:login.id,Authorization:Bearer login.access"`

Payload: 
```json
{
	"name": "Claire",
	"lastname": "Cottrill",
	"lastname_m": "Cottrill",
	"phone": "+525530093807"
}

```

Response: 
```json
{
	"id": "uuid",
	"name": "Claire",
	"lastname": "Cottrill",
	"lastname_m": "Cottrill",
	"phone": "+525530093807"
}
```

# Create Note
---

Path: `/patients/<patient_id>/notes/`
Method: `POST`

Headers: `Content-Type: multipart/form-data;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload: 
```
Content-Disposition: form-data; name="content"

SUBJETIVO:
Paciente acude a consulta de seguimiento 48 horas posterior al inicio de tratamiento antimicrobiano. Refiere mejoría significativa del dolor faríngeo, que actualmente califica como 3/10 (previamente 8/10). Refiere disminución de la odinofagia, ahora puede deglutir alimentos sólidos con mínima molestia. Niega fiebre en las últimas 24 horas. Persiste rinorrea hialina escasa y tos ocasional no productiva. Refiere apego al tratamiento indicado. Niega disnea, disfagia o sialorrea.
OBJETIVO:

Signos vitales:

TA: 120/75 mmHg
FC: 76 lpm
FR: 16 rpm
Temp: 36.8°C
SatO2: 98% aire ambiente


Exploración física:

Paciente consciente, orientado, cooperador, adecuada hidratación
Orofaringe: hiperemia leve de pilares amigdalinos, disminución significativa del eritema en comparación con consulta previa. Sin presencia de exudado. Amígdalas grado II/IV, sin crecimiento adicional
Adenomegalias cervicales: ganglios submandibulares palpables de 0.5 cm bilaterales, móviles, no dolorosos (previamente 1.5 cm y dolorosos)
Tórax: murmullo vesicular presente bilateral, sin agregados
Resto de exploración sin hallazgos patológicos



ANÁLISIS Y PLAN:
Paciente masculino de 32 años con evolución favorable de faringitis aguda bacteriana a 48 horas de tratamiento antimicrobiano. Se evidencia respuesta clínica adecuada con remisión de síntomas sistémicos y mejoría significativa de signos locales de infección.
Plan:

Continuar con amoxicilina 500 mg cada 8 horas vía oral hasta completar 10 días totales de tratamiento
Mantener ibuprofeno 400 mg cada 8 horas por 3 días más (solo si hay dolor)
Continuar medidas generales: hidratación abundante, gárgaras con agua tibia y sal, reposo relativo
Se explica al paciente importancia de completar esquema antimicrobiano
Signos de alarma: fiebre mayor a 38.5°C, dificultad respiratoria, disfagia progresiva, sialorrea, absceso periamigdalino - acudir a urgencias
Cita abierta en caso de no presentar mejoría o empeoramiento de síntomas
Reincorporación a actividades laborales si evolución continúa favorable

Pronóstico: Bueno para función y vida
--PieBoundary123456789012345678901234567
Content-Disposition: form-data; name="note_type"

evolution
--PieBoundary123456789012345678901234567
Content-Disposition: form-data; name="files"; filename="3.png"
Content-Type: image/png


--PieBoundary123456789012345678901234567--

```

Response: 
```json
{
  "id": "6758efaf-e81e-43e4-9a4f-b0046a29ae5b",
  "created_at": "2026-02-21T14:48:03.83821Z",
  "note_type": "evolution",
  "status": "draft"
}
```


# Get note analysis
---

Path: `/patients/<patient_id>/notes/<note_id>/analysis/`
Method: `GET`

Headers: `"Content-Type:application/json,X-Clineo-Api-Key:process.env.apikey,X-Clineo-Id:login.id,Authorization:Bearer login.access"`

Payload: ```
null
```

Response: 
```json
{
  "completeness_score": 60,
  "missing_fields": [
    "has_diagnosis_update",
    "has_treatment_plan"
  ],
  "reasoning": {
    "has_diagnosis_update": "Ausente. No se proporciona diagnóstico actualizado, impresión clínica ni evaluación de la respuesta al tratamiento actual",
    "has_physical_exam": "Presente. Se describe estado general del paciente, hidratación y exploración específica de orofaringe",
    "has_symptom_evolution": "Presente. Se describe mejoría significativa del dolor faríngeo (8/10 a 3/10), disminución de odinofagia, ausencia de fiebre y persistencia de síntomas menores",
    "has_treatment_plan": "Ausente. No se menciona continuación del tratamiento, cambios, seguimiento, ni indicaciones futuras",
    "has_vital_signs": "Presente. Se incluyen todos los signos vitales: TA, FC, FR, Temp, SatO2"
  }
}
```


# Upload assets
---

Path: `/patients/<patient_id>/assets/`
Method: `POST`

Headers: `Content-Type: multipart/form-data;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload: 
```
--PieBoundary123456789012345678901234567
Content-Disposition: form-data; name="files"; filename="filename.ext"
Content-Type: content-type

```

Response:
```
null
```

# List assets
---

Path: `/patients/<patient_id>/assets/?limit=int&page=int`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```
null
```

Response:
```json
{
  "results": [
    {
      "id": "4a27b4fa-469e-480d-8669-e2377143be31",
      "mime_type": "image/png",
      "key": "583c094e-f011-70ab-fca1-c2d0f156aa52/b05c8c3d-2b72-4d28-b5c9-8cf3f283e181/00374566-f237-4602-ab8e-c99870693fea.png",
      "file_size": 38308,
      "original_filename": "3.png",
      "hash": "yhBDhTaQ7zd3uIE56rqm0E/v9lplE4coN1syEq9s+Ww="
    },
    {
      "id": "224e2c46-2d6d-418b-a289-1677d304b384",
      "mime_type": "image/png",
      "key": "583c094e-f011-70ab-fca1-c2d0f156aa52/b05c8c3d-2b72-4d28-b5c9-8cf3f283e181/0fb5ad7c-77a5-4c35-bf5d-92d6e8934981.png",
      "file_size": 38308,
      "original_filename": "3.png",
      "hash": "yhBDhTaQ7zd3uIE56rqm0E/v9lplE4coN1syEq9s+Ww="
    },
    {
      "id": "d7a11f09-a66a-4e06-8cbe-2c6197c25d4b",
      "mime_type": "image/png",
      "key": "583c094e-f011-70ab-fca1-c2d0f156aa52/b05c8c3d-2b72-4d28-b5c9-8cf3f283e181/91cf02fb-7693-43e2-b9ec-9fafdcfeec2e.png",
      "file_size": 38308,
      "original_filename": "out.png",
      "hash": "yhBDhTaQ7zd3uIE56rqm0E/v9lplE4coN1syEq9s+Ww="
    },
    {
      "id": "e3df3683-89d2-4c96-aa6e-1bbd73c6f0b2",
      "mime_type": "image/png",
      "key": "583c094e-f011-70ab-fca1-c2d0f156aa52/b05c8c3d-2b72-4d28-b5c9-8cf3f283e181/53dc97fd-d216-4a87-b3bb-9cf75a87faba.png",
      "file_size": 38308,
      "original_filename": "3.png",
      "hash": "yhBDhTaQ7zd3uIE56rqm0E/v9lplE4coN1syEq9s+Ww="
    },
    {
      "id": "7e7dcec7-6374-4cf4-9bcd-4579623c64da",
      "mime_type": "application/pdf",
      "key": "583c094e-f011-70ab-fca1-c2d0f156aa52/b05c8c3d-2b72-4d28-b5c9-8cf3f283e181/7c2dd24f-dedc-42fa-aa0c-f3c6c79acfc8.pdf",
      "file_size": 1388765,
      "original_filename": "CDAPF-2025-613957.pdf",
      "hash": "6Iufo+IA3cHKjQ7JWO8BQpMGpmdgGkeT1xieKDbrSN0="
    }
  ],
  "count": 5,
  "page": 1,
  "size": 10
}
```


# List patient consents
---

Path: `/patients/<patient_id>/consents/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```
null
```

Response:
```json
{
  "results": [
    {
      "id": "8a5db5ee-8f92-44b7-8f5a-e9125ac152fa",
      "patient_id": "2f68e231-2d1a-4a7d-8b1a-3f1e5437f7bb",
      "user_id": "d8ec59ee-b061-700d-d674-feb01250158b",
      "consent_type": "treatment",
      "is_granted": true,
      "is_revoked": false,
      "expires_at": "2026-08-28T23:56:25.230385Z",
      "granted_at": "2026-02-27T23:56:25.230385Z",
      "revoked_at": null
    },
    {
      "id": "aca0276b-f6fc-4b2b-a4b2-444f8a13c88e",
      "patient_id": "2f68e231-2d1a-4a7d-8b1a-3f1e5437f7bb",
      "user_id": "d8ec59ee-b061-700d-d674-feb01250158b",
      "consent_type": "data_processing",
      "is_granted": true,
      "is_revoked": false,
      "expires_at": "2026-08-28T23:56:25.230385Z",
      "granted_at": "2026-02-27T23:56:25.230385Z",
      "revoked_at": null
    },
    {
      "id": "6e862661-269a-45b4-a083-ecf1710050d0",
      "patient_id": "2f68e231-2d1a-4a7d-8b1a-3f1e5437f7bb",
      "user_id": "d8ec59ee-b061-700d-d674-feb01250158b",
      "consent_type": "procedures",
      "is_granted": true,
      "is_revoked": false,
      "expires_at": "2026-08-28T23:56:25.230385Z",
      "granted_at": "2026-02-27T23:56:25.230385Z",
      "revoked_at": null
    },
    {
      "id": "deb9bc36-189a-42d7-ada5-f0f3ce9e9af4",
      "patient_id": "2f68e231-2d1a-4a7d-8b1a-3f1e5437f7bb",
      "user_id": "d8ec59ee-b061-700d-d674-feb01250158b",
      "consent_type": "research",
      "is_granted": true,
      "is_revoked": false,
      "expires_at": "2026-08-28T23:56:25.230385Z",
      "granted_at": "2026-02-27T23:56:25.230385Z",
      "revoked_at": null
    },
    {
      "id": "618f695f-be08-4772-8060-41ac7acb5def",
      "patient_id": "2f68e231-2d1a-4a7d-8b1a-3f1e5437f7bb",
      "user_id": "d8ec59ee-b061-700d-d674-feb01250158b",
      "consent_type": "third_party",
      "is_granted": true,
      "is_revoked": false,
      "expires_at": "2026-08-28T23:56:25.230385Z",
      "granted_at": "2026-02-27T23:56:25.230385Z",
      "revoked_at": null
    },
    {
      "id": "0fef8ee3-1723-45ce-a0fb-074315499a3e",
      "patient_id": "2f68e231-2d1a-4a7d-8b1a-3f1e5437f7bb",
      "user_id": "d8ec59ee-b061-700d-d674-feb01250158b",
      "consent_type": "marketing",
      "is_granted": true,
      "is_revoked": false,
      "expires_at": "2026-08-28T23:56:25.230385Z",
      "granted_at": "2026-02-27T23:56:25.230385Z",
      "revoked_at": null
    }
  ],
  "count": 6,
  "page": 1,
  "size": 6
}
```

# Get patient profile
---

Path: `/patients/<patient_id>/profile/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```
null
```

Response:
```json
{
  "phone": "+525530093807",
  "has_interrogatory": false
}
```

# Create Identity
---

Path: `/patients/<patient_id>/identity-sheet/`
Method: `POST`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
{
  "birthdate": "1990-05-15",
  "gender": "male",
  "birthplace_state": "California",
  "birthplace_country": "United States",
  "birthplace_city": "Los Angeles",
  "residence_state": "New York",
  "residence_country": "United States",
  "residence_city": "New York",
  "occupation": "Software Engineer",
  "education": "Computer Science",
  "marital_status": "single",
  "religion": "None",
  "nationality": "American",
  "education_level": "Bachelor's degree",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1-555-123-4567",
  "emergency_contact_relationship": "Sister"
}
```

Response:
```
null
```

# Get Identity
---

Path: `/patients/<patient_id>/identity-sheet/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Response:
```json
{
  "birthdate": "1990-05-15",
  "gender": "male",
  "birthplace_state": "California",
  "birthplace_country": "United States",
  "birthplace_city": "Los Angeles",
  "residence_state": "New York",
  "residence_country": "United States",
  "residence_city": "New York",
  "occupation": "Software Engineer",
  "education": "Computer Science",
  "marital_status": "single",
  "religion": "None",
  "nationality": "American",
  "education_level": "Bachelor's degree",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1-555-123-4567",
  "emergency_contact_relationship": "Sister"
}
```

Payload:
```
null
```

# Create Contact
---

Path: `/doctor/contacts/`
Method: `POST`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "alias": "jperez",
  "type": "patient",
  "email": "juan@ejemplo.com",
  "phone": "+5215512345678",
  "organization": "Clínica XYZ",
  "role": "Paciente"
}
```

Response:
```
null
```

# List Contact
---

Path: `/doctor/contacts/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "results": [
    {
      "id": "99be00b9-ddd4-46a5-8571-f20d88d6a045",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "1afec948-5efb-43aa-ab94-75b6738aecd9",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "36c7ec70-c02a-4f69-9b5a-40f68cfa87d8",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "7af954bc-e1bb-44ad-a377-36851d8182b3",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "c1644d90-cec9-4a8e-9bd7-a2860ebe9a14",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "0b61199c-288f-4ecb-9bf8-00d64461f075",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "5fe87beb-1a7a-476c-b024-eac629e78eaa",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    },
    {
      "id": "93b173a5-5dd6-4998-8584-c6d8ebc50847",
      "name": "Juan",
      "lastname": "Pérez",
      "alias": "jperez",
      "type": "patient",
      "email": "juan@ejemplo.com",
      "phone": "+5215512345678",
      "organization": "Clínica XYZ",
      "role": "Paciente"
    }
  ],
  "count": 8,
  "page": 1,
  "size": 10
}
```

# Update Contact
---

Path: `/doctor/contacts/`
Method: `PUT`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "alias": "jperez",
  "type": "patient",
  "email": "juan@ejemplo.com",
  "phone": "+5215512345678",
  "organization": "Clínica XYZ",
  "role": "Paciente"
}
```

Response:
```
null
```

# Archive Contact
---

Path: `/doctor/contacts/<contact_id>`
Method: `DELETE`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```
null
```


# Restore Contact
---

Path: `/doctor/contacts/<contact_id>/restore/`
Method: `POST`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```
null
```


# Get Contact
---

Path: `/doctor/contacts/<contact_id>/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "id": "5fe87beb-1a7a-476c-b024-eac629e78eaa",
  "name": "Juan",
  "lastname": "Pérez",
  "alias": "jperez",
  "type": "patient",
  "email": "juan@ejemplo.com",
  "phone": "+5215512345678",
  "organization": "Clínica XYZ",
  "role": "Paciente"
}
```

# Create appointment
---

Path: `/doctor/appointments/`
Method: `POST`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
{
  "patient": "880c492e-a0e1-7027-5c65-fd90e57d5aa9",
  "starts_at": "2025-06-15T10:00:00Z",
  "duration": "30m"
}
```

Response:
```json
null
```

# List appointments
---

Path: `/doctor/appointments/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "results": [
    {
      "id": "ca63702c-b7b3-46f9-8647-d1b532ca00c9",
      "patient_id": "a763fde3-c6c8-45f4-80e0-03149824d1bd",
      "starts_at": "2025-03-02T12:00:00-06:00",
      "ends_at": "2025-03-02T12:30:00-06:00",
      "status": "PENDING"
    }
  ],
  "count": 1,
  "page": 1,
  "size": 10
}
```

# Update appointment
---

Path: `/doctor/appointments/<appointment_id>/status/`
Method: `PATCH`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
{
  "status": "CONFIRMED"
}
```

Note, status can only be
```typescript
	"PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
```

Response:
```json
null
```

# Get appointment
---

Path: `/doctor/appointments/<appointment_id>/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "id": "ca63702c-b7b3-46f9-8647-d1b532ca00c9",
  "patient_id": "a763fde3-c6c8-45f4-80e0-03149824d1bd",
  "starts_at": "2025-03-02T12:00:00-06:00",
  "ends_at": "2025-03-02T12:30:00-06:00",
  "status": "PENDING"
}
```

# Delete appointment
---

Path: `/doctor/appointments/<appointment_id>/`
Method: `DELET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
null
```

# Get Doctor Notes

Path: `/doctor/notes/recent/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "results": [
    {
      "id": "c679c1d0-a873-412a-9121-0a13cd479acc",
      "title": "Interrogatorio - 2 de mar 2026",
      "status": "signed",
      "patient_id": "a763fde3-c6c8-45f4-80e0-03149824d1bd",
      "patient_name": "Aldo Rodrigo",
      "patient_lastname": "Vazquez",
      "created_at": "2026-03-02T20:09:38.775197Z",
      "updated_at": "0001-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "page": 1,
  "size": 10
}
```

# Get Doctor Compliance Report

Path: `/doctor/compliance/`
Method: `GET`

Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "doctor_id": "d8ec59ee-b061-700d-d674-feb01250158b",
  "overall_score": 0.9577777777777778,
  "patient_count": 1,
  "alert_breakdown": {
    "critical": 0,
    "ok": 1,
    "warning": 0
  },
  "worst_metric": "consent_coverage",
  "patients": [
    {
      "patient_id": "a763fde3-c6c8-45f4-80e0-03149824d1bd",
      "overall_score": 0.9577777777777778,
      "alert_level": "ok",
      "metrics": {
        "consent_coverage": {
          "name": "consent_coverage",
          "score": 0.8333333333333334,
          "detail": "5/6 required consents active",
          "items": 6,
          "passing": 5
        },
        "initial_interrogation": {
          "name": "initial_interrogation",
          "score": 1,
          "detail": "initial interrogation present",
          "items": 1,
          "passing": 1
        },
        "note_quality_average": {
          "name": "note_quality_average",
          "score": 0.9,
          "detail": "average quality 90% across 2 notes",
          "items": 2,
          "passing": 2
        },
        "profile_completeness": {
          "name": "profile_completeness",
          "score": 1,
          "detail": "5/5 identity fields present",
          "items": 5,
          "passing": 5
        },
        "signed_notes_ratio": {
          "name": "signed_notes_ratio",
          "score": 1,
          "detail": "2/2 notes signed",
          "items": 2,
          "passing": 2
        }
      },
      "computed_at": "2026-03-02T18:35:22.841134-06:00"
    }
  ]
}
```


# List Forms

Path: `/doctor/forms/`
Method: `GET`


Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "results": [
    {
      "id": "88c82935-a8d0-402c-a8e6-4cfc891d5147",
      "name": "Consentimiento informado"
    }
  ],
  "count": 1,
  "page": 1,
  "size": 10
}
```

# Get Form


Path: `/doctor/forms/<form_id>/`
Method: `GET`


Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "id": "b1454cc0-4cdc-41ed-bcf1-8edc18b1991a",
  "name": "Consentimiento informado",
  "key": "6d8bbe1d-9f5b-47dc-94ac-2961906cb424",
  "fields": [
    {
      "id": "272142e5-6ac3-46d4-a058-5fb726535d18",
      "position": {
        "x": 60.84077380952382,
        "y": 84.27724106203996,
        "page": 0,
        "width": 30,
        "height": 6
      }
    }
  ]
}
```

# Get Asset


Path: `/doctor/assets/<id>/`
Method: `GET`


Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response Headers:
```
Connection: close
Content-Disposition: attachment; filename="d8ec59ee-b061-700d-d674-feb01250158b/forms/comprobante_de_la_transaccion_28-feb-2026_20_01_49.pdf"
Content-Length: 423604
Content-Type: application/pdf
Date: Mon, 09 Mar 2026 17:37:23 GMT
Vary: Origin
```

Response:
```
<binary data>
```

# List Forms

Path: `/doctor/templates/`
Method: `GET`


Headers: `Content-Type: application/json;X-Clineo-Api-Key: process.env.apikey; X-Clineo-Id: login.id;Authorization:Bearer login.access;`

Payload:
```json
null
```

Response:
```json
{
  "results": [
    {
      "id": "88c82935-a8d0-402c-a8e6-4cfc891d5147",
      "name": "Mi Exploración física",
      "content": "Rich text content here"
    }
  ],
  "count": 1,
  "page": 1,
  "size": 10
}
```