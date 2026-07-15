/**
 * Tarjeta de producto agrupado por SKU.
 * Misma cáscara visual que ProductCard; agrega selectores de variante.
 */

import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductImage } from '@/components/ui/OptimizedImage';
import { useStore } from '@/store/useStore';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { getUIConfig, getStockSemaforo } from '@/config/runtime';
import { recordAppEvent } from '@/lib/observability';
import type { ProductGroup } from '@/utils/skuGrouping';
import {
  findProductByOptions,
  getAvailableOptionValues,
  getInStockOptionValues,
  getOptionValue,
} from '@/utils/skuGrouping';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface ProductGroupCardProps {
  group: ProductGroup;
}

export const ProductGroupCard: React.FC<ProductGroupCardProps> = ({ group }) => {
  const { optionNames, optionValues, representative } = group;
  const uiCfg = getUIConfig();

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const name of optionNames) {
      init[name] = optionValues[name]?.[0] || '';
    }
    for (const product of group.products) {
      if ((product.stock_quantity ?? 0) > 0) {
        const candidate: Record<string, string> = {};
        let valid = true;
        for (const name of optionNames) {
          const val = getOptionValue(product, name);
          if (!val) {
            valid = false;
            break;
          }
          candidate[name] = val;
        }
        if (valid) return candidate;
      }
    }
    return init;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const {
    addToCart,
    addNotification,
    auth,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    addToRecent,
  } = useStore();
  const isAuthenticated = auth.isAuthenticated;

  const activeProduct = useMemo(
    () => findProductByOptions(group, selected),
    [group, selected],
  );

  const isProductFavorite = isFavorite(activeProduct.id);
  const stock = activeProduct.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const stockSemaforo = getStockSemaforo(stock);
  const canAddToCart = activeProduct.unit_price != null && !isOutOfStock;
  const hasMultipleVariants = group.products.length > 1;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      removeFromFavorites(activeProduct.id);
      addNotification({
        type: 'info',
        title: uiCfg.productRemovedFromFavoritesTitle,
        message: `${activeProduct.name} ${uiCfg.productRemovedFromFavoritesMessage}`,
      });
    } else {
      addToFavorites(activeProduct.id);
      addNotification({
        type: 'success',
        title: uiCfg.productAddedToFavoritesTitle,
        message: `${activeProduct.name} ${uiCfg.productAddedToFavoritesMessage}`,
      });
    }
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

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
    if (isOutOfStock) {
      addNotification({
        type: 'error',
        title: uiCfg.productOutOfStockNotifTitle,
        message: uiCfg.productOutOfStockNotifMessage,
      });
      return;
    }
    addToCart(activeProduct, 1);
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleProductClick = () => {
    addToRecent(activeProduct.id);
    recordAppEvent('product_view', {
      productId: activeProduct.id,
      source: 'product_group_card',
    });
  };

  return (
    <Card className="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-0">
        <Link to={`/productos/${activeProduct.id}`} onClick={handleProductClick}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <ProductImage
              src={activeProduct.image_url || ''}
              alt={activeProduct.name}
              variant="card"
              className="transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {hasMultipleVariants && (
              <span className="absolute top-3 left-3 z-10 inline-flex items-center bg-foreground/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-background">
                {group.products.length} variantes
              </span>
            )}
            {isOutOfStock && (
              <span
                className={`absolute left-3 z-10 inline-flex items-center bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground ${
                  hasMultipleVariants ? 'top-12' : 'top-3'
                }`}
              >
                {stockSemaforo.label || uiCfg.productOutOfStockLabel}
              </span>
            )}

            <div
              className={`absolute top-3 right-3 flex flex-col space-y-2 transition-opacity duration-300 ${
                isProductFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <Button
                variant="secondary"
                size="icon"
                className={`w-9 h-9 rounded-full shadow-sm border ${
                  isProductFavorite
                    ? 'bg-white border-red-200 hover:bg-red-50'
                    : 'bg-white/90 border-transparent hover:bg-white'
                }`}
                onClick={handleToggleFavorite}
                title={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isProductFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600 hover:text-red-400'
                  }`}
                />
              </Button>
            </div>

            {canAddToCart && (
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                <Button
                  size="sm"
                  className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase text-[11px] tracking-[0.25em] font-medium"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-1.5 text-left">
          {representative.category && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {representative.category}
            </p>
          )}

          <Link to={`/productos/${activeProduct.id}`} onClick={handleProductClick}>
            <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 hover:text-foreground/70 transition-colors">
              {representative.name}
            </h3>
          </Link>

          <PriceDisplay
            price={activeProduct.unit_price}
            currency={activeProduct.currency}
            showLoginButton={true}
          />

          {optionNames.map((optionName) => {
            const values = optionValues[optionName] || [];
            if (values.length <= 1) return null;
            const available = getAvailableOptionValues(group, optionName, selected);
            const inStock = getInStockOptionValues(group, optionName, selected);
            return (
              <div key={optionName} className="pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                  {capitalize(optionName)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((val) => {
                    const isAvailable = available.has(val);
                    const hasStock = inStock.has(val);
                    const isSelected = selected[optionName] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleOptionChange(optionName, val)}
                        disabled={!isAvailable}
                        className={`px-2 py-1 text-xs font-medium border transition-colors ${
                          isSelected
                            ? hasStock
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-red-400 bg-red-50 text-red-600 line-through'
                            : isAvailable
                              ? hasStock
                                ? 'border-border bg-background text-foreground hover:border-foreground/50'
                                : 'border-border bg-background text-muted-foreground line-through'
                              : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {activeProduct.stock_quantity != null && stockSemaforo.show && (
            <p className={`text-xs font-medium ${stockSemaforo.toneClassName}`}>
              {stockSemaforo.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGroupCard;
