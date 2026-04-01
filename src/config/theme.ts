/**
 * Theme Injector - Inyecta CSS variables y configuraciones de tema
 * en tiempo de ejecución basado en la configuración runtime
 */

import { getThemeConfig, getBrandingConfig, getAppConfig } from './runtime';
import log from '@/lib/logger';

/**
 * Convierte un color HEX a formato oklch para compatibilidad con Tailwind v4
 */
function hexToOklch(hex: string): string {
  // Si ya es oklch, retornarlo tal cual
  if (hex.startsWith('oklch')) {
    return hex;
  }
  
  // Remover # si existe
  hex = hex.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convertir RGB a linear RGB
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  
  // Convertir a XYZ
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;
  
  // Convertir XYZ a OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const okb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  
  // Convertir a oklch
  const C = Math.sqrt(a * a + okb * okb);
  let h = Math.atan2(okb, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  
  // Formatear con precisión reducida
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Inyecta las variables CSS de tema al document root
 */
export function injectThemeVariables(): void {
  const theme = getThemeConfig();
  const root = document.documentElement;
  
  // Inyectar variables de color principales (formato HEX para uso general)
  root.style.setProperty('--runtime-color-primary', theme.colorPrimary);
  root.style.setProperty('--runtime-color-primary-hover', theme.colorPrimaryHover);
  root.style.setProperty('--runtime-color-primary-foreground', theme.colorPrimaryForeground);
  root.style.setProperty('--runtime-color-secondary', theme.colorSecondary);
  root.style.setProperty('--runtime-color-secondary-foreground', theme.colorSecondaryForeground);
  root.style.setProperty('--runtime-color-background', theme.colorBackground);
  root.style.setProperty('--runtime-color-foreground', theme.colorForeground);
  root.style.setProperty('--runtime-color-surface', theme.colorSurface);
  root.style.setProperty('--runtime-color-surface-foreground', theme.colorSurfaceForeground);
  root.style.setProperty('--runtime-color-muted', theme.colorMuted);
  root.style.setProperty('--runtime-color-muted-foreground', theme.colorMutedForeground);
  root.style.setProperty('--runtime-color-border', theme.colorBorder);
  root.style.setProperty('--runtime-color-input', theme.colorInput);
  root.style.setProperty('--runtime-color-ring', theme.colorRing);
  root.style.setProperty('--runtime-color-success', theme.colorSuccess);
  root.style.setProperty('--runtime-color-warning', theme.colorWarning);
  root.style.setProperty('--runtime-color-error', theme.colorError);
  root.style.setProperty('--runtime-color-accent', theme.colorAccent);
  root.style.setProperty('--runtime-color-accent-foreground', theme.colorAccentForeground);
  
  // Si hay configuración de tema personalizada, sobreescribir las variables de Tailwind
  // Solo aplicar si los colores son diferentes a los defaults
  if (theme.colorPrimary && theme.colorPrimary !== '#2563eb') {
    // Sobreescribir variables de Tailwind con formato oklch
    root.style.setProperty('--primary', hexToOklch(theme.colorPrimary));
    root.style.setProperty('--primary-foreground', hexToOklch(theme.colorPrimaryForeground));
  }
  
  if (theme.colorSecondary && theme.colorSecondary !== '#f1f5f9') {
    root.style.setProperty('--secondary', hexToOklch(theme.colorSecondary));
    root.style.setProperty('--secondary-foreground', hexToOklch(theme.colorSecondaryForeground));
  }
  
  if (theme.colorBackground && theme.colorBackground !== '#ffffff') {
    root.style.setProperty('--background', hexToOklch(theme.colorBackground));
    root.style.setProperty('--foreground', hexToOklch(theme.colorForeground));
  }
  
  if (theme.colorMuted && theme.colorMuted !== '#f1f5f9') {
    root.style.setProperty('--muted', hexToOklch(theme.colorMuted));
    root.style.setProperty('--muted-foreground', hexToOklch(theme.colorMutedForeground));
  }
  
  if (theme.colorBorder && theme.colorBorder !== '#e2e8f0') {
    root.style.setProperty('--border', hexToOklch(theme.colorBorder));
  }
  
  if (theme.colorInput && theme.colorInput !== '#e2e8f0') {
    root.style.setProperty('--input', hexToOklch(theme.colorInput));
  }
  
  if (theme.colorRing && theme.colorRing !== '#2563eb') {
    root.style.setProperty('--ring', hexToOklch(theme.colorRing));
  }
  
  if (theme.colorAccent && theme.colorAccent !== '#f1f5f9') {
    root.style.setProperty('--accent', hexToOklch(theme.colorAccent));
    root.style.setProperty('--accent-foreground', hexToOklch(theme.colorAccentForeground));
  }
  
  if (theme.colorError) {
    root.style.setProperty('--destructive', hexToOklch(theme.colorError));
  }
  
  // Inyectar tipografía si está configurada
  if (theme.fontFamily) {
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.fontFamily = theme.fontFamily;
    document.body.style.fontFamily = theme.fontFamily;
  }
}

/**
 * Carga una fuente externa si está configurada
 */
export function loadCustomFont(): void {
  const theme = getThemeConfig();
  
  if (theme.fontUrl) {
    // Verificar si ya existe el link
    const existingLink = document.querySelector(`link[href="${theme.fontUrl}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.href = theme.fontUrl;
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }
}

/**
 * Actualiza el favicon dinámicamente
 */
export function updateFavicon(): void {
  const branding = getBrandingConfig();
  
  if (branding.favicon) {
    // Buscar el link existente o crear uno nuevo
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = branding.favicon;
    
    // También actualizar apple-touch-icon si existe
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleLink) {
      appleLink.href = branding.favicon;
    }
  }
}

/**
 * Actualiza los metadatos de la página
 */
export function updateMetadata(): void {
  const app = getAppConfig();
  const branding = getBrandingConfig();
  
  // Actualizar título
  document.title = `${app.name} - ${app.slogan}`;
  
  // Actualizar meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', app.description);
  }
  
  // Actualizar Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${app.name} - ${app.slogan}`);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', app.description);
  }
  
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && branding.ogImage) {
    ogImage.setAttribute('content', branding.ogImage);
  }
  
  // Actualizar Twitter Cards
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', `${app.name} - ${app.slogan}`);
  }
  
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', app.description);
  }
  
  const twitterImage = document.querySelector('meta[property="twitter:image"]');
  if (twitterImage && branding.ogImage) {
    twitterImage.setAttribute('content', branding.ogImage);
  }
}

/**
 * Inicializa todo el sistema de tema runtime
 * Debe llamarse al iniciar la aplicación
 */
export function initializeTheme(): void {
  try {
    // Cargar fuente personalizada primero (para evitar FOUT)
    loadCustomFont();
    
    // Inyectar variables CSS
    injectThemeVariables();
    
    // Actualizar favicon
    updateFavicon();
    
    // Actualizar metadatos
    updateMetadata();
    
    log.config.info('Theme runtime initialized successfully');
  } catch (error) {
    log.config.error('Error initializing theme:', error);
  }
}

export default initializeTheme;
