/**
 * Tarjeta de producto profesional
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/api';
import { PriceDisplay, usePriceVisibility } from '@/hooks/usePriceVisibility';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '@/config/branding';

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

  const isProductFavorite = isFavorite(product.id);
  const isOutOfStock = (product.stock_quantity || 0) <= 0;
  const hasDiscount = product.metadata?.original_price && 
    product.metadata.original_price > product.unit_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.metadata.original_price - product.unit_price) / product.metadata.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛒 Intentando agregar producto al carrito:', product.name);
    
    // Verificar si el usuario está autenticado (solo si el feature está habilitado)
    if (FEATURES.REQUIRE_AUTH_FOR_CART && !isAuthenticated) {
      console.log('❌ Usuario no autenticado');
      addNotification({
        type: 'warning',
        title: 'Inicia sesión',
        message: 'Debes iniciar sesión para agregar productos al carrito',
      });
      // Redirigir a login después de 1 segundo
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    
    if (isOutOfStock) {
      console.log('❌ Producto sin stock');
      addNotification({
        type: 'error',
        title: 'Producto sin stock',
        message: 'Este producto no está disponible actualmente',
      });
      return;
    }

    console.log('✅ Agregando producto al carrito:', { product: product.name, quantity });
    addToCart(product, quantity);
    setQuantity(1);
    
    addNotification({
      type: 'success',
      title: 'Producto agregado',
      message: `${product.name} agregado al carrito`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProductFavorite) {
      removeFromFavorites(product.id);
      addNotification({
        type: 'info',
        title: 'Eliminado de favoritos',
        message: `${product.name} eliminado de favoritos`,
      });
    } else {
      addToFavorites(product.id);
    }
  };

  const handleProductClick = () => {
    addToRecent(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: product.currency || 'ARS',
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
    default: "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
    compact: "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
    featured: "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-primary/20"
  };

  return (
    <Card className={cardClasses[variant]}>
      <CardContent className="p-0">
        <Link to={`/producto/${product.id}`} onClick={handleProductClick}>
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {/* Product image */}
            <img
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
              {product.is_featured && (
                <Badge variant="secondary" className="text-xs">
                  Destacado
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="outline" className="text-xs bg-background">
                  Sin Stock
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={handleToggleFavorite}
              >
                <Heart 
                  className={`w-4 h-4 ${isProductFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
              
              {showQuickView && (
                <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={(e) => {
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
                          src={product.image_url || '/placeholder-product.jpg'}
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

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
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
                            onClick={(e) => {
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
                          disabled={isOutOfStock}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Quick add to cart overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                className="w-full" 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isOutOfStock ? 'Sin Stock' : 'Agregar'}
              </Button>
            </div>
          </div>
        </Link>

        {/* Product info */}
        <div className="p-4">
          <Link to={`/producto/${product.id}`} onClick={handleProductClick}>
            <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <PriceDisplay
            price={product.unit_price}
            originalPrice={hasDiscount ? product.metadata?.original_price : undefined}
            showLoginButton={true}
          />

          {/* Stock info */}
          {!isOutOfStock && (product.stock_quantity || 0) <= 5 && (
            <p className="text-xs text-orange-600 mb-2">
              ¡Solo quedan {product.stock_quantity} unidades!
            </p>
          )}

          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground">
              {product.category}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
