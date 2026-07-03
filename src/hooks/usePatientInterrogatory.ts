import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { MedicalNote } from '../types';
import { transformNote } from './useNotes';

/**
 * The initial interrogatory is read from the unified patient view
 * (`getPatient().interrogatory`), not from the notes list — `listNotes`
 * excludes it (`note_type_not=interrogation`) since it has its own dedicated
 * read/write path and UI.
 */
export function usePatientInterrogatory(patientId: string | undefined) {
  const [interrogatoryNote, setInterrogatoryNote] =
    useState<MedicalNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterrogatory = useCallback(async () => {
    if (!patientId) {
      setInterrogatoryNote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const patient = await apiService.getPatient(patientId);
      const raw = patient.interrogatory ?? null;
      setInterrogatoryNote(raw ? transformNote(raw, patientId) : null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar interrogatorio'
      );
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchInterrogatory();
  }, [fetchInterrogatory]);

  return {
    interrogatoryNote,
    loading,
    error,
    refetch: fetchInterrogatory,
  };
}
