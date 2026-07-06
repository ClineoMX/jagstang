import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { ApiAdminDashboard } from '../services/api';

/** `GET /admin/dashboard/` — snapshot de métricas del panel admin. */
export const useAdminDashboard = () => {
  const [data, setData] = useState<ApiAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAdminDashboard();
      if (signal?.aborted) return;
      setData(response);
    } catch (err) {
      if (signal?.aborted) return;
      setError(
        err instanceof Error ? err.message : 'Error al cargar el dashboard'
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);
    return () => controller.abort();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchDashboard(),
  };
};
