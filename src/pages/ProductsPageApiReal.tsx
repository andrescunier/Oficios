/**
 * Página de productos con API real
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { getBusinessConfig, getUIConfig } from '@/config/runtime';
import { BRANDING } from '@/config/branding';
import { productsQueryOptions } from '@/features/catalog/queries';
import { groupProductsBySku } from '@/utils/skuGrouping';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';

export const ProductsPageApiReal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('buscar') || '');
  const perPage = getBusinessConfig().productsPerPage;
  const uiCfg = getUIConfig();

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setSearchTerm(searchParams.get('buscar') || '');
  }, [searchParams]);

  const { addNotification } = useStore();
  const productsQuery = useQuery(
    productsQueryOptions({
      page: currentPage,
      per_page: perPage,
      is_active: true,
      search: searchTerm || undefined,
    }),
  );
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
        message: uiCfg.noProductsMessage,
      });
    }
  }, [addNotification, products.length, productsQuery.isSuccess, uiCfg.noProductsMessage]);

  useEffect(() => {
    if (productsQuery.isError) {
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudieron cargar los productos desde el servidor. Verifica tu conexión.',
      });
    }
  }, [addNotification, productsQuery.isError]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  const groupedProducts = useMemo(
    () => groupProductsBySku(filteredProducts),
    [filteredProducts],
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Catálogo
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {BRANDING.APP_NAME}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{BRANDING.APP_DESCRIPTION}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {error ? 'No se pudieron cargar los productos' : uiCfg.noProductsTitle}
            </h3>
            <p className="text-muted-foreground">
              {error
                ? 'Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.'
                : uiCfg.noProductsMessage}
            </p>
            {error && (
              <button
                onClick={() => productsQuery.refetch()}
                className="mt-4 bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
              >
                Reintentar
              </button>
            )}
            {!error && searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('buscar');
                  setSearchParams(params);
                }}
                className="mt-4 bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
              >
                Limpiar búsqueda
              </button>
            )}
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

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    className={`min-w-[40px] px-3 py-2 text-sm font-medium transition-colors ${
                      item === currentPage
                        ? 'bg-foreground text-background'
                        : 'border border-border hover:bg-muted'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

        {pagination && filteredProducts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            Mostrando {products.length} de {pagination.total} productos
          </p>
        )}

        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-block border border-border px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] hover:bg-muted transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
