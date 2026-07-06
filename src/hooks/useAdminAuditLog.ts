import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { ApiAdminAuditEvent } from '../services/api';

export const DEFAULT_AUDIT_PAGE_SIZE = 20;

const FILTER_DEBOUNCE_MS = 300;

/** Server-side filters supported by `GET /admin/audit-log`. */
export interface AuditLogServerFilters {
  /** `yyyy-mm-dd`. */
  date: string;
  eventType: string;
  actorId: string;
  sessionId: string;
  ipAddress: string;
  requestId: string;
}

export const EMPTY_SERVER_FILTERS: AuditLogServerFilters = {
  date: '',
  eventType: '',
  actorId: '',
  sessionId: '',
  ipAddress: '',
  requestId: '',
};

/** `GET /admin/audit-log?page=&size=&date=&event_type=&actor_id=&session_id=&ip_address=&request_id=`
 * — paginated, page size selectable, server-side filtered. No total count in
 * the response, so `hasNextPage` is a heuristic (a full page might mean
 * there's more). */
export const useAdminAuditLog = () => {
  const [events, setEvents] = useState<ApiAdminAuditEvent[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_AUDIT_PAGE_SIZE);
  const [filters, setFiltersState] =
    useState<AuditLogServerFilters>(EMPTY_SERVER_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(
    async (
      p: number,
      size: number,
      f: AuditLogServerFilters,
      signal?: AbortSignal
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getAdminAuditLog({
          page: p,
          size,
          date: f.date || undefined,
          event_type: f.eventType || undefined,
          actor_id: f.actorId || undefined,
          session_id: f.sessionId || undefined,
          ip_address: f.ipAddress || undefined,
          request_id: f.requestId || undefined,
        });
        if (signal?.aborted) return;
        setEvents(response);
      } catch (err) {
        if (signal?.aborted) return;
        setError(
          err instanceof Error ? err.message : 'Error al cargar el audit log'
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  const { date, eventType, actorId, sessionId, ipAddress, requestId } = filters;

  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(() => {
      fetchAuditLog(page, pageSize, filters, controller.signal);
    }, FILTER_DEBOUNCE_MS);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
    // `filters` (the object) is intentionally omitted — its individual
    // primitives (date/eventType/...) are the real dependencies, so an
    // unrelated re-render that recreates the object doesn't re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    date,
    eventType,
    actorId,
    sessionId,
    ipAddress,
    requestId,
    fetchAuditLog,
  ]);

  /** Changing the page size restarts pagination at page 1. */
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  /** Changing any filter restarts pagination at page 1. */
  const setFilters = (
    update:
      | AuditLogServerFilters
      | ((prev: AuditLogServerFilters) => AuditLogServerFilters)
  ) => {
    setFiltersState(update);
    setPage(1);
  };

  return {
    events,
    loading,
    error,
    page,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    hasPrevPage: page > 1,
    hasNextPage: events.length === pageSize,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    refetch: () => fetchAuditLog(page, pageSize, filters),
  };
};
