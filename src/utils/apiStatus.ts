/**
 * API status / timeout signalling.
 *
 * Cuando una petición HTTP a la API excede `API_TIMEOUT_MS` se aborta y se
 * considera un "timeout". En ese caso emitimos un evento global que la UI usa
 * para mostrar el aviso de "beta en pausa" (ver BetaPausedOverlay).
 */

/** Tiempo máximo (ms) que esperamos por una respuesta de la API antes de abortar. */
export const API_TIMEOUT_MS = 15000;

const API_TIMEOUT_EVENT = 'clineo:api-timeout';

/** Avisa a la app de que una petición a la API dio timeout. */
export function notifyApiTimeout(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(API_TIMEOUT_EVENT));
}

/** Suscribe un callback al evento de timeout. Devuelve la función para desuscribir. */
export function subscribeApiTimeout(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(API_TIMEOUT_EVENT, callback);
  return () => window.removeEventListener(API_TIMEOUT_EVENT, callback);
}

export class ApiTimeoutError extends Error {
  constructor(message = 'La petición tardó demasiado (timeout)') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/**
 * `fetch` con timeout. Aborta la petición tras `timeoutMs` y, si el aborto se
 * debió al timeout (no a un `signal` externo), emite el evento global y lanza
 * un `ApiTimeoutError`.
 *
 * Respeta cualquier `AbortSignal` que ya venga en `init.signal` (por ejemplo
 * el de cancelación de streams), encadenándolo con el del timeout.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  let didTimeout = false;

  const externalSignal = init.signal ?? undefined;
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }
  }

  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (didTimeout) {
      notifyApiTimeout();
      throw new ApiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
