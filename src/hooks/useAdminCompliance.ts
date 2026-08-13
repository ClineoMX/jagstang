import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type {
  ApiAdminDoctorOverallScore,
  ApiAdminUserRow,
} from '../services/api';

export interface AdminDoctorScore {
  doctor: ApiAdminUserRow;
  /** null si el score de ese doctor no se pudo obtener (no tumba la vista). */
  score: ApiAdminDoctorOverallScore | null;
}

/** ¿Es un doctor? `Role` es el enum crudo del backend (p. ej. "doctor"). */
const isDoctor = (u: ApiAdminUserRow) =>
  u.Role.toLowerCase().includes('doctor');

/**
 * Compliance NOM-004 de la clínica, agregado por doctor. Como el endpoint es
 * per-doctor (`/admin/compliance/{id}/overall_score/`), la vista agregada se
 * arma trayendo todos los usuarios admin y evaluando a cada doctor.
 */
export const useAdminCompliance = () => {
  const [doctors, setDoctors] = useState<AdminDoctorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliance = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const users = await apiService.getAdminUsers();
      if (signal?.aborted) return;

      const drs = users.filter(isDoctor);
      const rows = await Promise.all(
        drs.map(async (doctor) => {
          try {
            const score = await apiService.getAdminDoctorComplianceOverallScore(
              doctor.ID
            );
            return { doctor, score };
          } catch {
            // un doctor sin dato no debe tumbar la vista completa
            return { doctor, score: null };
          }
        })
      );
      if (signal?.aborted) return;
      setDoctors(rows);
    } catch (err) {
      if (signal?.aborted) return;
      setError(
        err instanceof Error ? err.message : 'Error al cargar compliance'
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCompliance(controller.signal);
    return () => controller.abort();
  }, [fetchCompliance]);

  return { doctors, loading, error, refetch: () => fetchCompliance() };
};
