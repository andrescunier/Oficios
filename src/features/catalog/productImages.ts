import type { Product } from '@/types/api';
import { getImagesConfig } from '@/config/runtime';

export const getProductImage = (product: Product): string => {
  if (product.image_url && product.image_url.trim() !== '') {
    return product.image_url;
  }

  const fallbacks = getImagesConfig().productFallbacks;
  const defaultImage = fallbacks.default || '/placeholder-product.svg';
  const name = product.name?.toLowerCase() || '';
  const category = product.category?.toLowerCase() || '';

  if (name.includes('ssd') && (name.includes('m.2') || name.includes('nvme') || name.includes('pcie'))) {
    return fallbacks['ssd-m2'] || fallbacks['ssd-nvme'] || defaultImage;
  }

  if (name.includes('ssd') && (name.includes('sata') || name.includes('2.5'))) {
    return fallbacks['ssd-sata'] || defaultImage;
  }

  if (name.includes('ssd')) {
    return fallbacks.ssd || fallbacks['ssd-m2'] || defaultImage;
  }

  if (name.includes('ddr5') || (name.includes('memoria') && name.includes('ddr5'))) {
    return fallbacks.ddr5 || defaultImage;
  }

  if (name.includes('ddr4') || (name.includes('memoria') && name.includes('ddr4'))) {
    return fallbacks.ddr4 || defaultImage;
  }

  if (name.includes('memoria') || name.includes('ram')) {
    return fallbacks.memoria || fallbacks.ram || defaultImage;
  }

  if (name.includes('gaming') || name.includes('gamer')) {
    return fallbacks.gaming || defaultImage;
  }

  return fallbacks[category] || defaultImage;
};

export const withProductImage = <T extends Product>(product: T): T => ({
  ...product,
  image_url: getProductImage(product),
});

export const withProductImages = <T extends Product>(products: T[]): T[] => products.map(withProductImage);
