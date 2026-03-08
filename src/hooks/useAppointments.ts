import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { ApiAppointment } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (signal?: AbortSignal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.listAppointments({
        limit: 500,
      });
      if (signal?.aborted) return;

      setAppointments(response.results);
      setCount(response.count);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAppointments(controller.signal);
    return () => controller.abort();
  }, [fetchAppointments]);

  const createAppointment = useCallback(
    async (patient: string, starts_at: string, duration: string) => {
      await apiService.createAppointment({ patient, starts_at, duration });
      await fetchAppointments();
    },
    [fetchAppointments]
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
      await apiService.updateAppointmentStatus(id, status);
      await fetchAppointments();
    },
    [fetchAppointments]
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      await apiService.deleteAppointment(id);
      await fetchAppointments();
    },
    [fetchAppointments]
  );

  return {
    appointments,
    count,
    loading,
    error,
    refetch: () => fetchAppointments(),
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  };
};
