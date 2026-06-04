import type { PhoneNumberFieldValue } from '../PhoneNumberField';

export type PatientMode = 'search' | 'new';

export type PatientDraft = {
  firstName: string;
  lastName: string;
  lastNameMaternal: string;
  phone: PhoneNumberFieldValue;
};

export type ApptState = {
  dateISO: string | null;
  timeMin: number | null;
  durationMin: number;
  /** UI-only until API supports appointment reason. */
  reason: string;
  additionalNotes: string;
};

export type DrawerFormState = {
  patientMode: PatientMode;
  selectedPatientId: string | null;
  draft: PatientDraft;
  appt: ApptState;
  /** Whether the appointment section is revealed (vs collapsed behind a button). */
  apptOpen: boolean;
};

export const freshDraft = (): PatientDraft => ({
  firstName: '',
  lastName: '',
  lastNameMaternal: '',
  phone: { countryIso2: 'MX', nationalNumber: '' },
});

export const freshAppt = (): ApptState => ({
  dateISO: null,
  timeMin: null,
  durationMin: 30,
  reason: 'Seguimiento',
  additionalNotes: '',
});

export const freshFormState = (): DrawerFormState => ({
  patientMode: 'search',
  selectedPatientId: null,
  draft: freshDraft(),
  appt: freshAppt(),
  apptOpen: false,
});
