import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para cerrar sesión automáticamente por inactividad
 * @param {Function} onLogout - Función a ejecutar cuando se agote el tiempo
 * @param {number} timeoutMinutes - Tiempo en minutos antes de cerrar sesión (default: 10)
 * @param {boolean} enabled - Si el timeout está habilitado (default: true)
 */
export function useInactivityTimeout(onLogout, timeoutMinutes = 10, enabled = true) {
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimeout = useCallback(() => {
    if (!enabled || !onLogout) return;

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Convertir minutos a milisegundos
    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Actualizar última actividad
    lastActivityRef.current = Date.now();

    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      console.log(`⏰ Sesión cerrada por inactividad (${timeoutMinutes} minutos)`);
      if (onLogout) {
        onLogout();
      }
    }, timeoutMs);
  }, [onLogout, timeoutMinutes, enabled]);

  useEffect(() => {
    if (!enabled || !onLogout) return;

    // Eventos que resetean el timeout
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Función para detectar actividad
    const handleActivity = () => {
      const now = Date.now();
      // Solo resetear si ha pasado al menos 1 segundo desde la última actividad
      // Esto evita resetear demasiado frecuentemente
      if (now - lastActivityRef.current > 1000) {
        resetTimeout();
      }
    };

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Inicializar timeout
    resetTimeout();

    // Limpiar al desmontar
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout, enabled, onLogout]);

  // Reiniciar timeout si cambian los parámetros
  useEffect(() => {
    if (enabled && onLogout) {
      resetTimeout();
    }
  }, [timeoutMinutes, enabled, resetTimeout, onLogout]);
}

