import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { ApiAdminUserRow } from '../services/api';

const SEARCH_DEBOUNCE_MS = 300;

/** `GET /admin/users?q=...` — `q` is debounced client-side; filters name/apellido/email server-side. */
export const useAdminUsers = (query: string) => {
  const [users, setUsers] = useState<ApiAdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (q: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAdminUsers({
        q: q.trim() || undefined,
      });
      if (signal?.aborted) return;
      setUsers(response);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(() => {
      fetchUsers(query, controller.signal);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query, fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: () => fetchUsers(query),
  };
};
