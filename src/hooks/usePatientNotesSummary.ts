import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiService, type ApiError } from '../services/api';

/**
 * Hook para consumir el stream del resumen del LLM.
 *
 * Diseño:
 * - Recibe `deltas` y los acumula en un buffer (ref).
 * - Un loop por `requestAnimationFrame` saca N caracteres por frame y los
 *   empuja al estado (efecto máquina de escribir), sin importar si el backend
 *   entrega los chunks de golpe o uno por uno.
 * - El `loading` permanece en true hasta que el buffer queda vacío.
 */
export function usePatientNotesSummary(patientId: string | undefined) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const pendingRef = useRef('');
  const streamDoneRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const buf = pendingRef.current;
    if (buf.length === 0) {
      if (streamDoneRef.current) {
        // No queda nada por mostrar y el stream terminó.
        setLoading(false);
        rafRef.current = null;
        return;
      }
      // Esperando más data del stream.
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Adaptativo: si hay mucho pendiente, drena más rápido para no
    // tomar 30s mostrando un texto largo. Mínimo 2 caracteres por frame.
    const charsPerFrame = Math.max(2, Math.ceil(buf.length / 60));
    const next = buf.slice(0, charsPerFrame);
    pendingRef.current = buf.slice(charsPerFrame);
    setText((prev) => prev + next);

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureRafRunning = useCallback(() => {
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    streamDoneRef.current = true;
    setLoading(false);
    stopRaf();
  }, [stopRaf]);

  const start = useCallback(async () => {
    if (!patientId) {
      setError('Patient ID is required');
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setText('');
    setError(null);
    setLoading(true);
    pendingRef.current = '';
    streamDoneRef.current = false;
    stopRaf();
    ensureRafRunning();

    try {
      await apiService.streamPatientNotesSummary({
        patientId,
        signal: controller.signal,
        onDelta: (delta) => {
          pendingRef.current += delta;
          ensureRafRunning();
        },
        onDone: () => {
          streamDoneRef.current = true;
          ensureRafRunning();
        },
        onError: (err: ApiError) => {
          setError(err.message || 'Error al generar resumen');
          streamDoneRef.current = true;
          ensureRafRunning();
        },
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al generar resumen';
      setError(message);
      streamDoneRef.current = true;
      setLoading(false);
      stopRaf();
    }
  }, [patientId, ensureRafRunning, stopRaf]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      stopRaf();
    };
  }, [stopRaf]);

  const hasText = useMemo(() => text.trim().length > 0, [text]);

  return {
    text,
    loading,
    error,
    hasText,
    start,
    stop,
    clear: () => {
      pendingRef.current = '';
      streamDoneRef.current = false;
      setText('');
    },
  };
}
