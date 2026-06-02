/**
 * Hook que monitorea la expiración del JWT y notifica al usuario antes de que venza.
 *
 * Estrategia:
 *  1. Decodifica el claim `exp` del token sin verificar la firma (solo cliente).
 *  2. Cuando quedan WARN_BEFORE_MS (5 min) emite el evento TOKEN_EXPIRY_SOON_EVENT.
 *  3. Cuando llega a 0 el interceptor 401 del httpClient ya limpia la sesión; este
 *     hook solo se encarga de la advertencia proactiva.
 */

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import log from '@/lib/logger';

/** Tiempo antes del vencimiento en que se muestra la advertencia (5 minutos). */
const WARN_BEFORE_MS = 5 * 60 * 1000;

/** Mínimo tiempo restante para programar la advertencia (1 minuto). */
const MIN_SCHEDULE_MS = 60 * 1000;

export const TOKEN_EXPIRY_SOON_EVENT = 'diapstore:token-expiry-soon';

/** Decodifica el payload de un JWT sin verificar la firma. */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → Base64 estándar
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

/** Devuelve los milisegundos restantes hasta que expire el token, o null si no es parseable. */
export function getTokenRemainingMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  const expiresAt = payload.exp * 1000; // exp está en segundos Unix
  return expiresAt - Date.now();
}

/** Devuelve la fecha de expiración del token, o null si no es parseable. */
export function getTokenExpiresAt(token: string): Date | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return new Date(payload.exp * 1000);
}

export function useTokenExpiry() {
  const token = useStore((state) => state.auth.token);
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpiar timer anterior al cambiar de token
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (!isAuthenticated || !token) return;

    const remainingMs = getTokenRemainingMs(token);
    if (remainingMs === null) {
      log.auth.warn('[useTokenExpiry] No se pudo leer el exp del token.');
      return;
    }

    const expiresAt = getTokenExpiresAt(token);
    log.auth.info(
      `[useTokenExpiry] Token expira en ${Math.round(remainingMs / 60000)} min` +
      (expiresAt ? ` (${expiresAt.toLocaleTimeString()})` : '')
    );

    if (remainingMs <= 0) {
      // Token ya expirado — el interceptor 401 lo manejará en la próxima request
      log.auth.warn('[useTokenExpiry] Token ya expirado al montar.');
      return;
    }

    const warnAt = remainingMs - WARN_BEFORE_MS;

    if (warnAt > MIN_SCHEDULE_MS) {
      warningTimerRef.current = setTimeout(() => {
        log.auth.warn('[useTokenExpiry] Token por expirar en 5 minutos.');
        window.dispatchEvent(
          new CustomEvent(TOKEN_EXPIRY_SOON_EVENT, {
            detail: { expiresAt, remainingMs: WARN_BEFORE_MS },
          })
        );
      }, warnAt);
    } else if (remainingMs > MIN_SCHEDULE_MS) {
      // Menos de 5 min pero más de 1 min — emitir advertencia inmediatamente
      log.auth.warn('[useTokenExpiry] Token expira pronto (< 5 min).');
      window.dispatchEvent(
        new CustomEvent(TOKEN_EXPIRY_SOON_EVENT, {
          detail: { expiresAt, remainingMs },
        })
      );
    }

    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };
  }, [token, isAuthenticated]);
}
