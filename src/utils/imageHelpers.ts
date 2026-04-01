/**
 * Utilidades para manejo optimizado de imágenes de productos
 */

import { getImagesConfig } from '@/config/runtime';

// Tamaños estándar para imágenes de productos
export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300 },
  card: { width: 800, height: 800 },
  detail: { width: 1500, height: 1500 },
  zoom: { width: 2000, height: 2000 },
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Obtiene la URL de la imagen optimizada según el tamaño
 * Asume que tienes un CDN o servidor que procesa imágenes con parámetros
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  size: ImageSize = 'card',
  format: 'webp' | 'jpg' = 'webp'
): string {
  if (!baseUrl) return getImagesConfig().placeholders.product;
  
  const { width, height } = IMAGE_SIZES[size];
  
  // Si la URL ya tiene parámetros, agregar con &, sino con ?
  const separator = baseUrl.includes('?') ? '&' : '?';
  
  // Formato para APIs que soportan resize (ej: imgix, cloudinary, etc)
  return `${baseUrl}${separator}w=${width}&h=${height}&fit=crop&fm=${format}&q=85`;
}

/**
 * Genera srcset para imágenes responsive
 */
export function getImageSrcSet(baseUrl: string, sizes: ImageSize[] = ['thumbnail', 'card', 'detail']): string {
  if (!baseUrl) return '';
  
  return sizes
    .map(size => {
      const { width } = IMAGE_SIZES[size];
      const url = getOptimizedImageUrl(baseUrl, size, 'webp');
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Genera sizes attribute para responsive images
 */
export function getImageSizes(type: 'card' | 'detail' | 'thumbnail'): string {
  switch (type) {
    case 'thumbnail':
      return '(max-width: 640px) 150px, 200px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';
    case 'detail':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px';
    default:
      return '100vw';
  }
}

/**
 * Valida si una imagen está en formato optimizado
 */
export function isOptimizedFormat(url: string): boolean {
  return url.endsWith('.webp') || url.includes('fm=webp');
}

/**
 * Obtiene placeholder mientras carga la imagen
 */
export function getPlaceholder(width: number = 800, height: number = 800): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ECargando...%3C/text%3E%3C/svg%3E`;
}

/**
 * Precarga imágenes críticas
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Lazy load de imágenes usando Intersection Observer
 */
export function setupLazyLoading(selector: string = 'img[data-src]') {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img);
    });
  }
}

export const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3EImagen no disponible%3C/text%3E%3C/svg%3E`;

/**
 * Handler para onError de <img> con máximo 3 reintentos.
 * Usa data-retry-count en el elemento para trackear intentos.
 * Después de 3 fallos muestra un SVG placeholder inline (nunca 404).
 */
export function handleImgError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  _fallbackSrc?: string
) {
  const img = e.currentTarget;
  // Evitar loops: si ya es el placeholder, no hacer nada
  if (img.src.startsWith('data:')) return;
  // Ir directo al SVG inline — nunca genera un request HTTP
  img.src = PLACEHOLDER_SVG;
}
