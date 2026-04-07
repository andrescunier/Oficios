/**
 * Página de productos con API real e imágenes locales
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/api';
import { getBusinessConfig } from '@/config/runtime';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { BRANDING, FEATURES } from '@/config/branding';
import { handleImgError } from '@/utils/imageHelpers';
import { productsQueryOptions } from '@/features/catalog/queries';

export const ProductsPageApiReal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer búsqueda desde URL al cargar
  useEffect(() => {
    const buscarParam = searchParams.get('buscar');
    if (buscarParam) {
      setSearchTerm(buscarParam);
    }
  }, [searchParams]);

  const { addToCart, addNotification, auth, addToFavorites, removeFromFavorites, isFavorite } = useStore();
  const isAuthenticated = auth.isAuthenticated;
  const productsQuery = useQuery(productsQueryOptions({
    page: 1,
    per_page: getBusinessConfig().productsPerPage,
    is_active: true,
  }));
  const products = productsQuery.data?.data || [];
  const loading = productsQuery.isLoading;
  const error = productsQuery.error ? 'No se pudieron cargar los productos' : null;

  useEffect(() => {
    if (productsQuery.isSuccess && products.length === 0) {
      addNotification({
        type: 'info',
        title: 'Información',
        message: 'No se encontraron productos en la base de datos.',
      });
    }
  }, [addNotification, products.length, productsQuery.isSuccess]);

  useEffect(() => {
    if (productsQuery.isError) {
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudieron cargar los productos desde el servidor. Verifica tu conexión.',
      });
    }
  }, [addNotification, productsQuery.isError]);

  const formatPrice = (price: number, currency: string = getBusinessConfig().defaultCurrency) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    return new Intl.NumberFormat(getBusinessConfig().locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = useMemo(() => products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  // Funciones para manejar cantidades
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    setQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const getQuantity = (productId: string) => {
    return quantities[productId] || 1;
  };

  // Función para agregar al carrito
    const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/productos' } });
      return;
    }

    if (product.has_variants) {
      navigate(`/productos/${product.id}`);
      return;
    }

    if (!product.stock_quantity || product.stock_quantity <= 0) {
      addNotification({
        type: 'error',
        title: 'Sin stock',
        message: 'Este producto no tiene stock disponible',
      });
      return;
    }

    const quantity = getQuantity(product.id.toString());
    addToCart(product, quantity);
  };

  const handleToggleFavorite = (product: Product) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Inicia sesión',
        message: 'Necesitas iniciar sesión para agregar productos a favoritos',
      });
      navigate('/login', { state: { from: '/productos' } });
      return;
    }
    
    const isProductFavorite = isFavorite(product.id);
    
    if (isProductFavorite) {
      removeFromFavorites(product.id);
      addNotification({
        type: 'info',
        title: 'Eliminado de favoritos',
        message: `${product.name} eliminado de favoritos`,
      });
    } else {
      addToFavorites(product.id);
      addNotification({
        type: 'success',
        title: 'Agregado a favoritos',
        message: `${product.name} agregado a tus favoritos`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {BRANDING.APP_NAME}
            </h1>
            <p className="text-xl opacity-90">
              {BRANDING.APP_DESCRIPTION}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-4">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {error ? 'No se pudieron cargar los productos' : 'No se encontraron productos'}
              </h3>
              <p className="text-gray-500">
                {error 
                  ? 'Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.' 
                  : searchTerm 
                    ? 'Intenta con otros términos de búsqueda.' 
                    : 'No hay productos disponibles en este momento.'}
              </p>
              {error && (
                <button 
                  onClick={() => productsQuery.refetch()}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 group relative">
                {/* Botón de favoritos */}
                <button
                  onClick={() => handleToggleFavorite(product)}
                  className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full shadow-md transition-all duration-200 ${
                    isFavorite(product.id)
                      ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                      : 'bg-white/90 hover:bg-white'
                  } flex items-center justify-center`}
                  title={isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      isFavorite(product.id)
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600 hover:text-red-400'
                    }`} 
                  />
                </button>
                
                {/* Product Image */}
                <Link to={`/productos/${product.id}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImgError(e)}
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/productos/${product.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
                          Destacado
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description || 'Sin descripción disponible'}
                  </p>
                  
                  <div className="mb-2">
                    <PriceDisplay
                      price={product.unit_price}
                      currency={product.currency}
                      showLoginButton={true}
                    />
                  </div>
                  
                  {/* Stock y SKU */}
                  <div className="flex items-center justify-between mb-2">
                    {product.has_variants ? (
                      <span className="text-sm text-blue-600">Variantes disponibles</span>
                    ) : product.stock_quantity != null && (
                      <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Sin stock'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </span>
                    {product.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Controles de acción */}
                  {product.unit_price != null && product.stock_quantity != null && product.stock_quantity > 0 && (
                  <div className="space-y-3">
                    {/* Selector de cantidad */}
                    {!product.has_variants && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(product.id.toString(), getQuantity(product.id.toString()) - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                            disabled={getQuantity(product.id.toString()) <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {getQuantity(product.id.toString())}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id.toString(), getQuantity(product.id.toString()) + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                            disabled={(product.stock_quantity || 0) <= getQuantity(product.id.toString())}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Botón agregar al carrito */}
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.has_variants && (!product.stock_quantity || product.stock_quantity <= 0)}
                      className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {product.has_variants
                        ? 'Elegir Color / Talle'
                        : 'Agregar al Carrito'}
                    </button>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-4">
              No hay productos que coincidan con "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors mr-4"
          >
            Volver al Inicio
          </Link>
          <Link 
            to="/carrito" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Ver Carrito
          </Link>
        </div>
      </div>
    </div>
  );
};
