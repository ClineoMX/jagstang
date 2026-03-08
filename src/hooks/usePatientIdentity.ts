import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export interface PatientIdentity {
  birthdate?: string;
  gender?: string;
  birthplace_state?: string;
  birthplace_country?: string;
  birthplace_city?: string;
  residence_state?: string;
  residence_country?: string;
  residence_city?: string;
  occupation?: string;
  education?: string;
  marital_status?: string;
  religion?: string;
  nationality?: string;
  education_level?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export const IDENTITY_FIELD_LABELS: Record<string, string> = {
  birthdate: 'Fecha de nacimiento',
  gender: 'Sexo',
  birthplace_state: 'Estado de nacimiento',
  birthplace_country: 'País de nacimiento',
  birthplace_city: 'Ciudad de nacimiento',
  residence_state: 'Estado de residencia',
  residence_country: 'País de residencia',
  residence_city: 'Ciudad de residencia',
  occupation: 'Ocupación',
  education: 'Educación',
  marital_status: 'Estado civil',
  religion: 'Religión',
  nationality: 'Nacionalidad',
  education_level: 'Nivel de estudios',
  emergency_contact_name: 'Contacto de emergencia',
  emergency_contact_phone: 'Teléfono de emergencia',
  emergency_contact_relationship: 'Parentesco',
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
};

export const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: 'Soltero/a',
  married: 'Casado/a',
  divorced: 'Divorciado/a',
  widowed: 'Viudo/a',
  separated: 'Separado/a',
  free_union: 'Unión libre',
};

export function usePatientIdentity(patientId: string | undefined) {
  const [identity, setIdentity] = useState<PatientIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  const fetchIdentity = useCallback(async () => {
    if (!patientId) {
      setIdentity(null);
      setExists(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPatientIdentity(patientId);
      setIdentity(data);
      setExists(true);
    } catch (err: any) {
      if (err?.status === 404) {
        setIdentity(null);
        setExists(false);
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar ficha de identidad');
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchIdentity();
  }, [fetchIdentity]);

  const saveIdentity = async (data: Record<string, string>) => {
    if (!patientId) throw new Error('Patient ID is required');
    if (exists) {
      await apiService.updatePatientIdentity(patientId, data);
    } else {
      await apiService.createPatientIdentity(patientId, data);
    }
    await fetchIdentity();
  };

  return { identity, exists, loading, error, saveIdentity, refetch: fetchIdentity };
}
