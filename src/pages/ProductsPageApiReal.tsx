/**
 * Página de productos con API real e imágenes locales
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/api';
import { getBusinessConfig, getUIConfig } from '@/config/runtime';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { BRANDING, FEATURES } from '@/config/branding';
import { handleImgError } from '@/utils/imageHelpers';
import { productsQueryOptions } from '@/features/catalog/queries';
import { groupProductsBySku } from '@/utils/skuGrouping';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';
import { ProductCard } from '@/components/product/ProductCard';

export const ProductsPageApiReal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('buscar') || '');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const perPage = getBusinessConfig().productsPerPage;

  // Paginación: leer página actual desde URL
  const currentPage = Number(searchParams.get('page')) || 1;

  // Sincronizar searchTerm con el parámetro buscar de la URL (incluyendo cuando se elimina)
  useEffect(() => {
    setSearchTerm(searchParams.get('buscar') || '');
  }, [searchParams]);

  const { addToCart, addNotification, auth, addToFavorites, removeFromFavorites, isFavorite } = useStore();
  const isAuthenticated = auth.isAuthenticated;
  const productsQuery = useQuery(productsQueryOptions({
    page: currentPage,
    per_page: perPage,
    is_active: true,
    search: searchTerm || undefined,
  }));
  const products = productsQuery.data?.data || [];
  const pagination = productsQuery.data?.pagination;
  const totalPages = pagination?.total_pages || 1;
  const loading = productsQuery.isLoading;
  const error = productsQuery.error ? 'No se pudieron cargar los productos' : null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (productsQuery.isSuccess && products.length === 0) {
      addNotification({
        type: 'info',
        title: 'Información',
        message: getUIConfig().noProductsMessage,
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
                {error ? 'No se pudieron cargar los productos' : getUIConfig().noProductsTitle}
              </h3>
              <p className="text-gray-500">
                  {error 
                    ? 'Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.' 
                    : searchTerm 
                      ? getUIConfig().noProductsMessage
                      : getUIConfig().noProductsMessage}
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
              return <ProductCard key={item.product.id} product={item.product} />;
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                )
              )
            }
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
        {pagination && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Mostrando {products.length} de {pagination.total} productos
          </p>
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
