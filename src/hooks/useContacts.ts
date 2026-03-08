import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Contact } from '../types';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (signal?: AbortSignal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.listContacts({ limit: 500 });
      if (signal?.aborted) return;

      const transformed: Contact[] = response.results.map((c) => ({
        id: c.id,
        firstName: c.name,
        lastName: c.lastname,
        alias: c.alias ?? undefined,
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
        type: (c.type as any) ?? 'other',
        company: c.organization ?? undefined,
        position: c.role ?? undefined,
        notes: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setContacts(transformed);
      setCount(response.count);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Error al cargar contactos');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchContacts(controller.signal);
    return () => controller.abort();
  }, [fetchContacts]);

  return {
    contacts,
    count,
    loading,
    error,
    refetch: () => fetchContacts(),
  };
};

