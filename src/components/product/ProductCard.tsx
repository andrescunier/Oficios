/**
 * Tarjeta de producto profesional
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductImage } from '@/components/ui/OptimizedImage';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/api';
import { PriceDisplay, usePriceVisibility } from '@/hooks/usePriceVisibility';
import { FEATURES } from '@/config/branding';
import { getImagesConfig, getBusinessConfig, getUIConfig, getStockSemaforo } from '@/config/runtime';
import { recordAppEvent } from '@/lib/observability';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  showQuickView?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default',
  showQuickView = true 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    addToCart, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    addToRecent,
    addNotification,
    auth
  } = useStore();

  const { canViewPrices } = usePriceVisibility();
  const isAuthenticated = auth.isAuthenticated;
  const uiCfg = getUIConfig();

  const isProductFavorite = isFavorite(product.id);
  const isOutOfStock = (product.stock_quantity || 0) <= 0;
  const stockSemaforo = getStockSemaforo(product.stock_quantity);
  const canAddToCart = product.unit_price != null && !isOutOfStock;
  const originalPrice = product.metadata?.original_price;
  const hasDiscount = typeof originalPrice === 'number' && originalPrice > product.unit_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - product.unit_price) / originalPrice) * 100)
    : 0;

  // Extract talle from metadata or SKU segments (PREFIX-COLOR-TALLE)
  const talle = product.metadata?.talle
    || product.metadata?.size
    || (() => {
        const parts = (product.sku || '').split('-');
        return parts.length >= 3 ? parts[parts.length - 1] : undefined;
      })();

  const handleAddToCart = () => {
    if (product.has_variants) {
      navigate(`/productos/${product.id}`);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
      return;
    }

    if (!product.stock_quantity || product.stock_quantity <= 0) {
      addNotification({
        type: 'error',
        title: uiCfg.productOutOfStockNotifTitle,
        message: uiCfg.productOutOfStockNotifMessage,
      });
      return;
    }

    addToCart(product, quantity);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar autenticación
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: uiCfg.productLoginForFavoritesTitle,
        message: uiCfg.productLoginForFavoritesMessage,
      });
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
      return;
    }
    
    if (isProductFavorite) {
      removeFromFavorites(product.id);
      addNotification({
        type: 'info',
        title: uiCfg.productRemovedFromFavoritesTitle,
        message: `${product.name} ${uiCfg.productRemovedFromFavoritesMessage}`,
      });
    } else {
      addToFavorites(product.id);
      addNotification({
        type: 'success',
        title: uiCfg.productAddedToFavoritesTitle,
        message: `${product.name} ${uiCfg.productAddedToFavoritesMessage}`,
      });
    }
  };

  const handleProductClick = () => {
    addToRecent(product.id);
    recordAppEvent('product_view', {
      productId: product.id,
      source: 'product_card',
    });
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const business = getBusinessConfig();
    return new Intl.NumberFormat(business.locale, {
      style: 'currency',
      currency: product.currency || business.defaultCurrency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }

    return stars;
  };

  const rating = product.metadata?.rating || 0;
  const reviewCount = product.metadata?.review_count || 0;

  const cardClasses = {
    default: "group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md",
    compact: "group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md",
    featured: "group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md",
  };

  return (
    <Card className={cardClasses[variant]}>
      <CardContent className="p-0">
        <Link to={`/productos/${product.id}`} onClick={handleProductClick}>
          {/* Image container with optimized loading */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {/* Product image optimized */}
            <ProductImage
              src={product.image_url || ''}
              alt={product.name}
              variant="card"
              className="transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Editorial badges */}
            {product.is_featured && (
              <span className="absolute top-3 left-3 z-10 inline-flex items-center bg-foreground/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-background">
                Destacado
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-3 left-3 z-10 inline-flex items-center bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground">
                {stockSemaforo.label || uiCfg.productOutOfStockLabel}
              </span>
            )}
            {hasDiscount && (
              <span className="absolute top-3 right-3 z-10 flex h-12 w-12 items-center justify-center bg-red-600 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
                -{discountPercentage}%
              </span>
            )}

            {/* Action buttons */}
            <div className={`absolute ${hasDiscount ? 'top-16' : 'top-3'} right-3 flex flex-col space-y-2 transition-opacity duration-300 ${isProductFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <Button
                variant="secondary"
                size="icon"
                className={`w-9 h-9 rounded-full shadow-sm border ${isProductFavorite
                  ? 'bg-white border-red-200 hover:bg-red-50'
                  : 'bg-white/90 border-transparent hover:bg-white'
                }`}
                onClick={handleToggleFavorite}
                title={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart
                  className={`w-5 h-5 ${isProductFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-400'
                  }`}
                />
              </Button>
              
              {showQuickView && (
                <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="aspect-square">
                        <img
                          src={product.image_url || getImagesConfig().placeholders.product}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {renderStars(rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({reviewCount} reseñas)
                            </span>
                          </div>
                          
                          <PriceDisplay
                            price={product.unit_price}
                            originalPrice={hasDiscount ? product.metadata?.original_price : undefined}
                            showLoginButton={true}
                          />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>

                        {canAddToCart && (
                        <>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setQuantity(Math.max(1, quantity - 1));
                            }}
                            disabled={quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setQuantity(quantity + 1);
                            }}
                            disabled={quantity >= (product.stock_quantity || 0)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button 
                          className="w-full" 
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {product.has_variants ? 'Elegir variante' : 'Agregar al Carrito'}
                        </Button>
                        </>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Quick add to cart overlay */}
            {canAddToCart && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <Button
                size="sm"
                className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase text-[11px] tracking-[0.25em] font-medium"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.has_variants ? 'Elegir variante' : 'Agregar'}
              </Button>
            </div>
            )}
          </div>
        </Link>

        {/* Product info */}
        <div className="p-4 space-y-1.5 text-left">
          {product.category && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {product.category}
            </p>
          )}

          <Link to={`/productos/${product.id}`} onClick={handleProductClick}>
            <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 hover:text-foreground/70 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <PriceDisplay
            price={product.unit_price}
            originalPrice={hasDiscount ? product.metadata?.original_price : undefined}
            showLoginButton={true}
          />

          {/* Stock info */}
          {product.stock_quantity != null && stockSemaforo.show && (
            <p className={`text-xs font-medium ${stockSemaforo.toneClassName}`}>
              {stockSemaforo.label}
            </p>
          )}

          {/* Talle from SKU */}
          {talle && (
            <p className="text-xs text-muted-foreground">
              Talle: <span className="font-medium text-foreground">{talle}</span>
            </p>
          )}

          {product.has_variants && (
            <p className="text-xs text-muted-foreground">
              Colores, talles u opciones disponibles
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
