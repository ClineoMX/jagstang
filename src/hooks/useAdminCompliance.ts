import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { ApiAdminComplianceList } from '../services/api';

export const DEFAULT_COMPLIANCE_PAGE_SIZE = 10;

/**
 * Compliance NOM-004 de la clínica, paginado server-side (`GET /admin/compliance/`).
 * Re-fetch automático cuando cambian página, tamaño o búsqueda.
 */
export const useAdminCompliance = (
  search: string,
  page: number,
  size: number = DEFAULT_COMPLIANCE_PAGE_SIZE
) => {
  const [list, setList] = useState<ApiAdminComplianceList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getAdminComplianceList({
          page,
          size,
          q: search.trim() || undefined,
        });
        if (signal?.aborted) return;
        setList(res);
      } catch (err) {
        if (signal?.aborted) return;
        setError(
          err instanceof Error ? err.message : 'Error al cargar compliance'
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, size, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
  }, [fetchList]);

  return { list, loading, error, refetch: () => fetchList() };
};
