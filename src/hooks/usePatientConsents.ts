import { useCallback } from 'react';

export interface PatientConsentItem {
  id: string;
  patientId: string;
  userId: string;
  consentType: string;
  isGranted: boolean;
  isRevoked: boolean;
  expiresAt: string | null;
  grantedAt: string | null;
  revokedAt: string | null;
}

/**
 * v2.0: the dedicated `/patients/{id}/consents/` endpoint was removed. Consents
 * are expected to arrive via the unified patient view in a future revision, so
 * for now this hook always reports an empty (null) set.
 */
export function usePatientConsents(_patientId: string | undefined) {
  const refetch = useCallback(async () => {}, []);

  return {
    consents: [] as PatientConsentItem[],
    count: 0,
    loading: false,
    error: null as string | null,
    refetch,
  };
}

/** Labels in Spanish for API consent_type values */
export const CONSENT_TYPE_LABELS: Record<string, string> = {
  treatment: 'Tratamiento',
  data_processing: 'Procesamiento de datos',
  procedures: 'Procedimientos',
  research: 'Investigación',
  third_party: 'Terceros',
  marketing: 'Comunicaciones / Marketing',
};

/** Placeholder descriptions per consent type (to be replaced by UX copy later) */
export const CONSENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  treatment:
    'Autorización para que el personal médico realice los tratamientos y procedimientos terapéuticos indicados en su atención.',
  data_processing:
    'Consentimiento para recopilar, almacenar y procesar sus datos personales y de salud con fines asistenciales y administrativos.',
  procedures:
    'Autorización para realizar procedimientos diagnósticos y terapéuticos que el equipo médico considere necesarios para su cuidado.',
  research:
    'Consentimiento para que sus datos anonimizados puedan ser utilizados en estudios e investigación médica, conforme a la normativa vigente.',
  third_party:
    'Autorización para compartir información de salud con terceros (aseguradoras, otros profesionales) cuando sea necesario para su atención o gestión.',
  marketing:
    'Consentimiento para recibir comunicaciones de la institución (recordatorios, novedades, encuestas) por correo, SMS o teléfono.',
};

export function getConsentTypeLabel(consentType: string): string {
  return CONSENT_TYPE_LABELS[consentType] ?? consentType;
}

export function getConsentTypeDescription(consentType: string): string {
  return CONSENT_TYPE_DESCRIPTIONS[consentType] ?? '';
}
