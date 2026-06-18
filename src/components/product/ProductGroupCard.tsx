/**
 * Tarjeta de producto agrupado por SKU.
 * Muestra un solo card con selectores dinámicos basados en metadata.
 */

import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Plus, Minus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { handleImgError } from '@/utils/imageHelpers';
import { getBusinessConfig, getStockSemaforo } from '@/config/runtime';
import type { ProductGroup } from '@/utils/skuGrouping';
import { findProductByOptions, getAvailableOptionValues, getInStockOptionValues, getOptionValue } from '@/utils/skuGrouping';

/** Capitalize first letter */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface ProductGroupCardProps {
  group: ProductGroup;
}

export const ProductGroupCard: React.FC<ProductGroupCardProps> = ({ group }) => {
  const { optionNames, optionValues, representative } = group;

  // Initialize selection: prefer a variant with stock, else first available value
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const name of optionNames) {
      init[name] = optionValues[name]?.[0] || '';
    }
    // Try to find a combination that has stock
    for (const product of group.products) {
      if ((product.stock_quantity ?? 0) > 0) {
        const candidate: Record<string, string> = {};
        let valid = true;
        for (const name of optionNames) {
          const val = getOptionValue(product, name);
          if (!val) { valid = false; break; }
          candidate[name] = val;
        }
        if (valid) return candidate;
      }
    }
    return init;
  });
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, addNotification, auth, isFavorite, addToFavorites, removeFromFavorites } = useStore();
  const isAuthenticated = auth.isAuthenticated;

  const activeProduct = useMemo(
    () => findProductByOptions(group, selected),
    [group, selected],
  );

  const isProductFavorite = isFavorite(activeProduct.id);
  const stock = activeProduct.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const stockSemaforo = getStockSemaforo(stock);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Inicia sesión',
        message: 'Necesitas iniciar sesión para agregar productos a favoritos',
      });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isProductFavorite) {
      removeFromFavorites(activeProduct.id);
      addNotification({ type: 'info', title: 'Eliminado de favoritos', message: `${activeProduct.name} eliminado de favoritos` });
    } else {
      addToFavorites(activeProduct.id);
      addNotification({ type: 'success', title: 'Agregado a favoritos', message: `${activeProduct.name} agregado a tus favoritos` });
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (isOutOfStock) {
      addNotification({ type: 'error', title: 'Sin stock', message: 'Este producto no tiene stock disponible' });
      return;
    }
    addToCart(activeProduct, quantity);
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [optionName]: value }));
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 group/card relative">
      {/* Favoritos */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full shadow-md transition-all duration-200 ${
          isProductFavorite ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white/90 hover:bg-white'
        } flex items-center justify-center`}
        title={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart
          className={`w-5 h-5 ${isProductFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-400'}`}
        />
      </button>

      {/* Badge de variaciones */}
      {group.products.length > 1 && (
        <span className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {group.products.length} variantes
        </span>
      )}

      {/* Image */}
      <Link to={`/productos/${activeProduct.id}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={activeProduct.image_url}
            alt={activeProduct.name}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
            onError={(e) => handleImgError(e)}
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/productos/${activeProduct.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
            {representative.name}
          </h3>
        </Link>

        {representative.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{representative.description}</p>
        )}

        {/* Precio */}
        <div className="mb-3">
          <PriceDisplay
            price={activeProduct.unit_price}
            currency={activeProduct.currency}
            showLoginButton={true}
          />
        </div>

        {/* Option selectors — dinámico desde metadata */}
        {optionNames.map((optionName) => {
          const values = optionValues[optionName] || [];
          if (values.length <= 1) return null;
          const available = getAvailableOptionValues(group, optionName, selected);
          const inStock = getInStockOptionValues(group, optionName, selected);
          return (
            <div key={optionName} className="mb-2">
              <p className="text-xs font-medium text-gray-500 mb-1">{capitalize(optionName)}</p>
              <div className="flex flex-wrap gap-1.5">
                {values.map((val) => {
                  const isAvailable = available.has(val);
                  const hasStock = inStock.has(val);
                  const isSelected = selected[optionName] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleOptionChange(optionName, val)}
                      disabled={!isAvailable}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        isSelected
                          ? hasStock
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-red-400 bg-red-50 text-red-600 line-through'
                          : isAvailable
                            ? hasStock
                              ? 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                              : 'border-gray-300 bg-white text-gray-400 line-through'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
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

        {/* Stock info — same style as ProductCard */}
        {stockSemaforo.show && (
          <p className={`text-xs font-medium mb-2 ${stockSemaforo.toneClassName}`}>
            {stockSemaforo.label}
          </p>
        )}

        {/* Talle for single products (no selector shown) */}
        {group.products.length === 1 && (() => {
          const parts = (activeProduct.sku || '').split('-');
          const talle = activeProduct.metadata?.talle || activeProduct.metadata?.size || (parts.length >= 3 ? parts[parts.length - 1] : null);
          return talle ? <p className="text-xs text-gray-500 mb-2">Talle: <span className="font-medium">{talle}</span></p> : null;
        })()}

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">SKU: {activeProduct.sku}</span>
          {activeProduct.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{activeProduct.category}</span>
          )}
        </div>

        {/* Agregar al carrito */}
        {activeProduct.unit_price != null && !isOutOfStock && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={stock <= quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Agregar al Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
