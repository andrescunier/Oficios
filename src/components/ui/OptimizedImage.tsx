import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getImageSrcSet, getImageSizes, getPlaceholder, PLACEHOLDER_SVG, type ImageSize } from '@/utils/imageHelpers';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: ImageSize;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

/**
 * Componente de imagen optimizada con soporte WebP, lazy loading y responsive
 */
export function OptimizedImage({
  src,
  alt,
  size = 'card',
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(getPlaceholder());
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (src && !imageError) {
      setImageSrc(getOptimizedImageUrl(src, size, 'webp'));
    }
  }, [src, size, imageError]);

  const handleError = () => {
    if (imageError) return; // Ya falló, no reintentar
    setImageError(true);
    setImageSrc(PLACEHOLDER_SVG);
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  // Generar srcset para diferentes tamaños
  const srcSet = src ? getImageSrcSet(src) : '';
  const sizes = getImageSizes(size === 'thumbnail' ? 'thumbnail' : size === 'detail' ? 'detail' : 'card');

  return (
    <picture>
      {/* Versión WebP optimizada */}
      {!imageError && src && (
        <source
          type="image/webp"
          srcSet={srcSet}
          sizes={sizes}
        />
      )}
      
      {/* Fallback JPG/PNG */}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </picture>
  );
}

// Variante con aspect ratio fijo
interface ProductImageProps extends Omit<OptimizedImageProps, 'size'> {
  variant?: 'thumbnail' | 'card' | 'detail';
}

export function ProductImage({ 
  variant = 'card', 
  className = '',
  ...props 
}: ProductImageProps) {
  const aspectClasses = {
    thumbnail: 'aspect-square w-20 h-20',
    card: 'aspect-square w-full',
    detail: 'aspect-square w-full max-w-2xl'
  };

  const sizeMap: Record<typeof variant, ImageSize> = {
    thumbnail: 'thumbnail',
    card: 'card',
    detail: 'detail'
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${aspectClasses[variant]}`}>
      <OptimizedImage
        {...props}
        size={sizeMap[variant]}
        className={`object-cover w-full h-full ${className}`}
      />
    </div>
  );
}
