/**
 * Sistema de logging centralizado para DIAP
 * 
 * SEGURIDAD: En producción el logging está completamente deshabilitado.
 * window.DIAP NO se expone en producción.
 * 
 * DESARROLLO:
 *   Configurar con variable de entorno en .env:
 *     VITE_DEBUG=*                 — Todos los módulos
 *     VITE_DEBUG=auth,checkout     — Solo auth y checkout
 *     VITE_DEBUG=                  — Ninguno (default)
 *     VITE_DEBUG_LEVEL=warn        — Nivel mínimo (debug|info|warn|error)
 * 
 *   O desde consola del navegador (solo en dev):
 *     window.DIAP.enableAll() / .disableAll()
 *     window.DIAP.enable('auth') / .disable('http')
 *     window.DIAP.status()
 */

const IS_DEV = import.meta.env.DEV;

// Módulos de logging disponibles
export type LogModule = 
  | 'auth' 
  | 'http' 
  | 'cart' 
  | 'checkout' 
  | 'store' 
  | 'products' 
  | 'orders' 
  | 'router' 
  | 'config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MODULE_COLORS: Record<LogModule, string> = {
  auth:     '#22c55e',
  http:     '#3b82f6',
  cart:     '#f59e0b',
  checkout: '#ef4444',
  store:    '#8b5cf6',
  products: '#06b6d4',
  orders:   '#ec4899',
  router:   '#f97316',
  config:   '#6b7280',
};

const MODULE_ICONS: Record<LogModule, string> = {
  auth:     '🔐',
  http:     '🌐',
  cart:     '🛒',
  checkout: '💳',
  store:    '📦',
  products: '🏷️',
  orders:   '📋',
  router:   '🧭',
  config:   '⚙️',
};

const ALL_MODULES: LogModule[] = ['auth', 'http', 'cart', 'checkout', 'store', 'products', 'orders', 'router', 'config'];

// ======== Configuración ========

interface DebugConfig {
  modules: Record<LogModule, boolean>;
  level: LogLevel;
}

function getDefaultModules(): Record<LogModule, boolean> {
  return {
    auth: false, http: false, cart: false, checkout: false,
    store: false, products: false, orders: false, router: false, config: false,
  };
}

/** Lee VITE_DEBUG y VITE_DEBUG_LEVEL para configurar qué módulos se activan */
function loadConfigFromEnv(): DebugConfig {
  const debugEnv = (import.meta.env.VITE_DEBUG || '').trim();
  const levelEnv = (import.meta.env.VITE_DEBUG_LEVEL || 'debug').trim() as LogLevel;

  const modules = getDefaultModules();

  if (debugEnv === '*') {
    ALL_MODULES.forEach(m => { modules[m] = true; });
  } else if (debugEnv) {
    debugEnv.split(',').map(s => s.trim()).forEach(m => {
      if (ALL_MODULES.includes(m as LogModule)) {
        modules[m as LogModule] = true;
      }
    });
  }

  return {
    modules,
    level: LOG_LEVELS.hasOwnProperty(levelEnv) ? levelEnv : 'debug',
  };
}

let currentConfig: DebugConfig = IS_DEV ? loadConfigFromEnv() : { modules: getDefaultModules(), level: 'error' };

// ======== Core ========

function isEnabled(module: LogModule, level: LogLevel): boolean {
  if (!IS_DEV) return false; // Producción: NUNCA loguear
  if (!currentConfig.modules[module]) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[currentConfig.level];
}

function formatPrefix(module: LogModule): string[] {
  const icon = MODULE_ICONS[module];
  const color = MODULE_COLORS[module];
  return [
    `%c${icon} [${module.toUpperCase()}]`,
    `color: ${color}; font-weight: bold;`,
  ];
}

// ======== Noop logger para producción (tree-shakeable) ========
const noop = () => {};
const noopLogger = {
  debug: noop, info: noop, warn: noop, error: noop,
  group: noop, table: noop, time: noop, timeEnd: noop,
  get enabled() { return false; },
};

/**
 * Crea un logger para un módulo específico.
 * En producción retorna un noop (sin costo de runtime).
 */
export function createLogger(module: LogModule) {
  if (!IS_DEV) return noopLogger;

  return {
    debug: (...args: any[]) => {
      if (isEnabled(module, 'debug')) {
        const [prefix, style] = formatPrefix(module);
        console.debug(prefix, style, ...args);
      }
    },
    info: (...args: any[]) => {
      if (isEnabled(module, 'info')) {
        const [prefix, style] = formatPrefix(module);
        console.info(prefix, style, ...args);
      }
    },
    warn: (...args: any[]) => {
      if (isEnabled(module, 'warn')) {
        const [prefix, style] = formatPrefix(module);
        console.warn(prefix, style, ...args);
      }
    },
    error: (...args: any[]) => {
      if (isEnabled(module, 'error')) {
        const [prefix, style] = formatPrefix(module);
        console.error(prefix, style, ...args);
      }
    },
    group: (label: string, fn: () => void) => {
      if (isEnabled(module, 'debug')) {
        const [prefix, style] = formatPrefix(module);
        console.groupCollapsed(prefix + ' ' + label, style);
        fn();
        console.groupEnd();
      }
    },
    table: (data: any, label?: string) => {
      if (isEnabled(module, 'debug')) {
        const [prefix, style] = formatPrefix(module);
        if (label) console.log(prefix + ' ' + label, style);
        console.table(data);
      }
    },
    time: (label: string) => {
      if (isEnabled(module, 'debug')) {
        console.time(`${MODULE_ICONS[module]} [${module.toUpperCase()}] ${label}`);
      }
    },
    timeEnd: (label: string) => {
      if (isEnabled(module, 'debug')) {
        console.timeEnd(`${MODULE_ICONS[module]} [${module.toUpperCase()}] ${label}`);
      }
    },
    get enabled() {
      return currentConfig.modules[module];
    },
  };
}

// ======== Control API (SOLO en desarrollo) ========

if (IS_DEV && typeof window !== 'undefined') {
  (window as any).DIAP = {
    enable(module: LogModule) {
      if (!ALL_MODULES.includes(module)) {
        console.error(`Módulo inválido: "${module}". Disponibles: ${ALL_MODULES.join(', ')}`);
        return;
      }
      currentConfig.modules[module] = true;
      console.log(`✅ Logging habilitado: ${MODULE_ICONS[module]} ${module}`);
    },

    disable(module: LogModule) {
      if (!ALL_MODULES.includes(module)) {
        console.error(`Módulo inválido: "${module}". Disponibles: ${ALL_MODULES.join(', ')}`);
        return;
      }
      currentConfig.modules[module] = false;
      console.log(`❌ Logging deshabilitado: ${MODULE_ICONS[module]} ${module}`);
    },

    toggle(module: LogModule) {
      currentConfig.modules[module] ? this.disable(module) : this.enable(module);
    },

    enableAll() {
      ALL_MODULES.forEach(m => { currentConfig.modules[m] = true; });
      console.log('✅ Todos los módulos habilitados');
      this.status();
    },

    disableAll() {
      ALL_MODULES.forEach(m => { currentConfig.modules[m] = false; });
      console.log('❌ Todos los módulos deshabilitados');
    },

    setLevel(level: LogLevel) {
      if (!LOG_LEVELS.hasOwnProperty(level)) {
        console.error(`Nivel inválido: "${level}". Disponibles: debug, info, warn, error`);
        return;
      }
      currentConfig.level = level;
      console.log(`📊 Nivel de logging: ${level}`);
    },

    status() {
      console.log('\n📊 DIAP Debug Status:');
      console.log(`   Nivel: ${currentConfig.level}`);
      ALL_MODULES.forEach(m => {
        const icon = currentConfig.modules[m] ? '🟢' : '🔴';
        console.log(`   ${icon} ${MODULE_ICONS[m]} ${m}`);
      });
      console.log('\n   Env: VITE_DEBUG=' + (import.meta.env.VITE_DEBUG || '(no definida)'));
      console.log('');
    },
  };
}

// ======== Loggers pre-creados ========

export const log = {
  auth: createLogger('auth'),
  http: createLogger('http'),
  cart: createLogger('cart'),
  checkout: createLogger('checkout'),
  store: createLogger('store'),
  products: createLogger('products'),
  orders: createLogger('orders'),
  router: createLogger('router'),
  config: createLogger('config'),
};

export default log;
