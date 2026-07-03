import { useEffect, useRef } from 'react';
import { apiService } from '../services/api';

export interface ClientEvent {
  event?: string;
  data: unknown;
}

/**
 * Subscribe to the SSE event stream for a client (v2.0 `GET /patients/{client}/events/`,
 * where `{client}` is the patient id).
 *
 * The connection is opened only while `enabled` is true and a `client` is set,
 * and is torn down on unmount or when disabled. Long-lived streams can drop, so
 * this reconnects with a small backoff until disabled.
 *
 * Note: the exact event payload shape isn't pinned down by the migration guide,
 * so consumers should treat `data` defensively (see `useClientEvents` callers).
 */
export function useClientEvents(
  client: string | undefined,
  enabled: boolean,
  onEvent: (evt: ClientEvent) => void
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !client) return;

    const controller = new AbortController();
    let cancelled = false;
    let attempt = 0;

    const run = async () => {
      while (!cancelled && !controller.signal.aborted) {
        try {
          await apiService.subscribeEvents({
            client,
            signal: controller.signal,
            onEvent: (evt) => onEventRef.current(evt),
            onError: (err) => {
              if (import.meta.env.DEV) {
                console.warn('[useClientEvents] stream error', err);
              }
            },
          });
          // Stream ended cleanly — reconnect (a fresh long-poll) unless stopped.
          attempt = 0;
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn('[useClientEvents] subscribe failed', err);
          }
        }
        if (cancelled || controller.signal.aborted) break;
        attempt += 1;
        const delay = Math.min(1000 * 2 ** Math.min(attempt, 4), 15000);
        await new Promise((r) => setTimeout(r, delay));
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [client, enabled]);
}
