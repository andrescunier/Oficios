/**
 * Utilidades para manejar URLs de CDN
 */

import { getBrandingConfig } from '@/config/runtime';

/**
 * Construye una URL de CDN completa
 * @param path - Ruta relativa de la imagen
 * @returns URL completa (CDN o local)
 */
export const getCDNUrl = (path: string): string => {
  const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL;
  
  // Si hay CDN configurado y la ruta no es una URL completa
  if (cdnBaseUrl && !path.startsWith('http')) {
    // Asegurar que no haya doble slash
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const cleanBase = cdnBaseUrl.endsWith('/') ? cdnBaseUrl.slice(0, -1) : cdnBaseUrl;
    return `${cleanBase}/${cleanPath}`;
  }
  
  // Si ya es una URL completa, devolverla tal cual
  if (path.startsWith('http')) {
    return path;
  }
  
  // Si no hay CDN, devolver ruta local
  return path;
};

/**
 * Construye URL de imagen del hero slider
 */
export const getHeroSlideUrl = (slideNumber: 1 | 2 | 3): string => {
  const envKey = `VITE_CDN_HERO_SLIDE_${slideNumber}` as const;
  const cdnUrl = import.meta.env[envKey];
  
  if (cdnUrl) {
    return cdnUrl;
  }
  
  return getCDNUrl(`/images/heroes/slide-${slideNumber}.jpg`);
};

/**
 * Construye URL del logo
 */
export const getLogoUrl = (): string => {
  const cdnLogo = import.meta.env.VITE_CDN_LOGO;
  
  if (cdnLogo) {
    return cdnLogo;
  }
  
  return getCDNUrl(getBrandingConfig().logo);
};

/**
 * Construye URL de imagen de categoría
 */
export const getCategoryImageUrl = (category: string): string => {
  return getCDNUrl(`/images/categories/${category}.jpg`);
};
