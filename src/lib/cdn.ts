/**
 * Utilidades para manejar URLs de CDN
 */

import { getBrandingConfig, getCdnBaseUrl } from '@/config/runtime';

/**
 * Construye una URL de CDN completa.
 * Lee la URL base desde window.__APP_CONFIG__.cdnBaseUrl.
 *
 * @param path - Ruta relativa de la imagen o URL absoluta
 * @returns URL completa (CDN o local)
 */
export const getCDNUrl = (path: string): string => {
  // Si ya es una URL completa o un data URI, devolverla tal cual
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }

  const cdnBaseUrl = getCdnBaseUrl();

  if (cdnBaseUrl) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const cleanBase = cdnBaseUrl.endsWith('/') ? cdnBaseUrl.slice(0, -1) : cdnBaseUrl;
    return `${cleanBase}/${cleanPath}`;
  }

  // Sin CDN, devolver ruta local
  return path;
};

/**
 * Construye URL de imagen del hero slider
 */
export const getHeroSlideUrl = (slideNumber: 1 | 2 | 3): string => {
  return getCDNUrl(`/images/heroes/slide-${slideNumber}.jpg`);
};

/**
 * Construye URL del logo
 */
export const getLogoUrl = (): string => {
  return getCDNUrl(getBrandingConfig().logo);
};

/**
 * Construye URL de imagen de categoría
 */
export const getCategoryImageUrl = (category: string): string => {
  return getCDNUrl(`/images/categories/${category}.jpg`);
};
