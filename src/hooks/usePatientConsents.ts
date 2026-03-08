import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

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

export function usePatientConsents(patientId: string | undefined) {
  const [consents, setConsents] = useState<PatientConsentItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsents = useCallback(async () => {
    if (!patientId) {
      setConsents([]);
      setCount(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.listPatientConsents(patientId, { limit: 100 });
      setConsents(
        res.results.map((r) => ({
          id: r.id,
          patientId: r.patient_id,
          userId: r.user_id,
          consentType: r.consent_type,
          isGranted: r.is_granted,
          isRevoked: r.is_revoked,
          expiresAt: r.expires_at,
          grantedAt: r.granted_at,
          revokedAt: r.revoked_at,
        }))
      );
      setCount(res.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar consentimientos');
      setConsents([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  return { consents, count, loading, error, refetch: fetchConsents };
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
