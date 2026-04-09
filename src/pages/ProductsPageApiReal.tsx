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
import { groupProductsBySku } from '@/utils/skuGrouping';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';

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

  const groupedProducts = useMemo(() => groupProductsBySku(filteredProducts), [filteredProducts]);

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
            {groupedProducts.map((item) => {
              if (item.type === 'group') {
                return <ProductGroupCard key={item.groupKey} group={item} />;
              }
              return null;
            })}
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
