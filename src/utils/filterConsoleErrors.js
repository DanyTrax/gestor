/**
 * Filtro para ocultar errores benignos de extensiones del navegador en la consola
 * Estos errores no afectan la funcionalidad de la aplicación
 */
export function setupConsoleErrorFilter() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  // Errores de extensiones del navegador que podemos ignorar
  const ignoredErrors = [
    'Could not establish connection',
    'Receiving end does not exist',
    'Promised response from onMessage listener went out of scope',
    'Extension context invalidated',
    'message handler closed',
    'chrome-extension://',
    'moz-extension://',
    'edge-extension://'
  ];

  console.error = function(...args) {
    // Convertir todos los argumentos a string de forma segura
    let message = '';
    try {
      message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message + ' ' + arg.stack;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(' ');
    } catch {
      message = String(args);
    }
    
    const shouldIgnore = ignoredErrors.some(ignored => message.includes(ignored));
    
    if (!shouldIgnore) {
      originalError.apply(console, args);
    }
  };

  console.warn = function(...args) {
    // Convertir todos los argumentos a string de forma segura
    let message = '';
    try {
      message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message + ' ' + arg.stack;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(' ');
    } catch {
      message = String(args);
    }
    
    const shouldIgnore = ignoredErrors.some(ignored => message.includes(ignored));
    
    if (!shouldIgnore) {
      originalWarn.apply(console, args);
    }
  };

  // Retornar función para restaurar el comportamiento original si es necesario
  return () => {
    console.error = originalError;
    console.warn = originalWarn;
  };
}

