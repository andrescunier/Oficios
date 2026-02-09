/**
 * Sistema de logging centralizado para DIAP
 * 
 * Se puede controlar desde la consola del navegador:
 * 
 *   window.DIAP.enableAll()         — Activa todos los módulos
 *   window.DIAP.disableAll()        — Desactiva todos los módulos
 *   window.DIAP.enable('auth')      — Activa un módulo específico
 *   window.DIAP.disable('http')     — Desactiva un módulo específico
 *   window.DIAP.toggle('checkout')  — Alterna un módulo
 *   window.DIAP.status()            — Muestra estado de todos los módulos
 *   window.DIAP.setLevel('warn')    — Cambia nivel mínimo (debug|info|warn|error)
 * 
 * La configuración persiste en localStorage (clave: 'diap-debug')
 */

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
  auth:     '#22c55e', // green
  http:     '#3b82f6', // blue
  cart:     '#f59e0b', // amber
  checkout: '#ef4444', // red
  store:    '#8b5cf6', // violet
  products: '#06b6d4', // cyan
  orders:   '#ec4899', // pink
  router:   '#f97316', // orange
  config:   '#6b7280', // gray
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

const STORAGE_KEY = 'diap-debug';

interface DebugConfig {
  modules: Record<LogModule, boolean>;
  level: LogLevel;
}

const ALL_MODULES: LogModule[] = ['auth', 'http', 'cart', 'checkout', 'store', 'products', 'orders', 'router', 'config'];

function getDefaultConfig(): DebugConfig {
  return {
    modules: {
      auth: false,
      http: false,
      cart: false,
      checkout: false,
      store: false,
      products: false,
      orders: false,
      router: false,
      config: false,
    },
    level: 'debug',
  };
}

function loadConfig(): DebugConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge con defaults para nuevos módulos
      const defaults = getDefaultConfig();
      return {
        level: parsed.level || defaults.level,
        modules: { ...defaults.modules, ...parsed.modules },
      };
    }
  } catch { /* ignore */ }
  return getDefaultConfig();
}

function saveConfig(config: DebugConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

let currentConfig = loadConfig();

function isEnabled(module: LogModule, level: LogLevel): boolean {
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

/**
 * Crea un logger para un módulo específico
 */
export function createLogger(module: LogModule) {
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
    /** Log a group of related info (collapsed by default) */
    group: (label: string, fn: () => void) => {
      if (isEnabled(module, 'debug')) {
        const [prefix, style] = formatPrefix(module);
        console.groupCollapsed(prefix + ' ' + label, style);
        fn();
        console.groupEnd();
      }
    },
    /** Log object as table */
    table: (data: any, label?: string) => {
      if (isEnabled(module, 'debug')) {
        const [prefix, style] = formatPrefix(module);
        if (label) console.log(prefix + ' ' + label, style);
        console.table(data);
      }
    },
    /** Time an operation */
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
    /** Check if this module's logging is enabled */
    get enabled() {
      return currentConfig.modules[module];
    },
  };
}

// ======== Control API (expuesta en window.DIAP) ========

const controlAPI = {
  enable(module: LogModule) {
    if (!ALL_MODULES.includes(module)) {
      console.error(`Módulo inválido: "${module}". Disponibles: ${ALL_MODULES.join(', ')}`);
      return;
    }
    currentConfig.modules[module] = true;
    saveConfig(currentConfig);
    console.log(`✅ Logging habilitado para: ${MODULE_ICONS[module]} ${module}`);
  },

  disable(module: LogModule) {
    if (!ALL_MODULES.includes(module)) {
      console.error(`Módulo inválido: "${module}". Disponibles: ${ALL_MODULES.join(', ')}`);
      return;
    }
    currentConfig.modules[module] = false;
    saveConfig(currentConfig);
    console.log(`❌ Logging deshabilitado para: ${MODULE_ICONS[module]} ${module}`);
  },

  toggle(module: LogModule) {
    if (currentConfig.modules[module]) {
      this.disable(module);
    } else {
      this.enable(module);
    }
  },

  enableAll() {
    ALL_MODULES.forEach(m => { currentConfig.modules[m] = true; });
    saveConfig(currentConfig);
    console.log('✅ Todos los módulos de logging habilitados');
    this.status();
  },

  disableAll() {
    ALL_MODULES.forEach(m => { currentConfig.modules[m] = false; });
    saveConfig(currentConfig);
    console.log('❌ Todos los módulos de logging deshabilitados');
  },

  setLevel(level: LogLevel) {
    if (!LOG_LEVELS.hasOwnProperty(level)) {
      console.error(`Nivel inválido: "${level}". Disponibles: debug, info, warn, error`);
      return;
    }
    currentConfig.level = level;
    saveConfig(currentConfig);
    console.log(`📊 Nivel de logging: ${level}`);
  },

  status() {
    console.log('\n📊 DIAP Debug Status:');
    console.log(`   Nivel mínimo: ${currentConfig.level}`);
    console.log('   Módulos:');
    ALL_MODULES.forEach(m => {
      const icon = currentConfig.modules[m] ? '🟢' : '🔴';
      console.log(`   ${icon} ${MODULE_ICONS[m]} ${m}`);
    });
    console.log('\n   Comandos: window.DIAP.enable("modulo") | .disable("modulo") | .toggle("modulo")');
    console.log('             window.DIAP.enableAll() | .disableAll() | .setLevel("debug"|"info"|"warn"|"error")');
    console.log('');
  },

  help() {
    console.log(`
╔══════════════════════════════════════════════════════╗
║            DIAP Debug Logger - Ayuda                 ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  window.DIAP.enableAll()        Activar todo         ║
║  window.DIAP.disableAll()       Desactivar todo      ║
║  window.DIAP.enable('auth')     Activar módulo       ║
║  window.DIAP.disable('http')    Desactivar módulo    ║
║  window.DIAP.toggle('checkout') Alternar módulo      ║
║  window.DIAP.status()           Ver estado           ║
║  window.DIAP.setLevel('warn')   Nivel mínimo         ║
║                                                      ║
║  Módulos: auth, http, cart, checkout, store,         ║
║           products, orders, router, config           ║
║                                                      ║
║  Niveles: debug < info < warn < error                ║
║                                                      ║
║  La config persiste en localStorage (diap-debug)     ║
╚══════════════════════════════════════════════════════╝
    `);
  },
};

// Exponer en window
if (typeof window !== 'undefined') {
  (window as any).DIAP = controlAPI;
}

// Loggers pre-creados para cada módulo
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
