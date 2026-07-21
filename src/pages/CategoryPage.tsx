/**
 * Página de categoría con filtros contractuales paginados desde backend.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { getUIConfig } from '@/config/runtime';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/api';
import { ChevronDown, ChevronUp, Filter, SlidersHorizontal, X } from 'lucide-react';
import { categoryListingQueryOptions } from '@/features/catalog/queries';
import { getBusinessConfig, getCategoryBySlug, getFiltersConfig } from '@/config/runtime';
import type { CategoryConfig } from '@/config/runtime';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { groupProductsBySku } from '@/utils/skuGrouping';

interface FilterOption {
  value: string;
  label: string;
}

interface ActiveFilters {
  capacidad?: string[];
  velocidad?: string[];
  barrio?: string[];
  enStock?: boolean;
}

const productZoneHaystack = (product: Product): string => {
  const meta = (product.metadata || {}) as Record<string, unknown>;
  const provider = (meta.provider || {}) as Record<string, unknown>;
  const pub = (meta.public || {}) as Record<string, unknown>;
  return [
    provider.zone,
    pub.provider_zone,
    product.description,
    product.name,
    product.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

type FilterSectionsMap = Record<string, { label: string; options: FilterOption[] }>;

const mapSortToBackend = (sort: string): { sortBy: 'name' | 'price'; sortOrder: 'asc' | 'desc' } => {
  switch (sort) {
    case 'nombre-desc':
      return { sortBy: 'name', sortOrder: 'desc' };
    case 'precio-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'precio-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'nombre-asc':
    default:
      return { sortBy: 'name', sortOrder: 'asc' };
  }
};

export const CategoryPage: React.FC = () => {
  const { category, subcategory, subsubcategory } = useParams<{
    category: string;
    subcategory?: string;
    subsubcategory?: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtersConfig = getFiltersConfig();
  const showFilters = filtersConfig.enabled;
  const productsPerPage = getBusinessConfig().productsPerPage;
  const currentPage = Math.max(Number(searchParams.get('page')) || 1, 1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['barrio', 'capacidad', 'velocidad']);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    capacidad: [],
    velocidad: [],
    barrio: [],
    enStock: false,
  });
  const [sortBy, setSortBy] = useState<string>('nombre-asc');

  const rootConfig = getCategoryBySlug(category || '');
  const level2Config = subcategory ? getCategoryBySlug(category || '', subcategory) : undefined;
  const level3Config = subsubcategory ? getCategoryBySlug(category || '', subcategory || '', subsubcategory) : undefined;

  const categoryConfig = level3Config || level2Config || rootConfig;
  const categoryName = categoryConfig?.name || category || 'Productos';
  const navSubcategories: CategoryConfig[] = (level3Config ? undefined : (level2Config || rootConfig))?.subcategories || [];

  const buscarQuery = searchParams.get('buscar') || undefined;

  const filterConfig = useMemo<FilterSectionsMap>(() => {
    if (!showFilters) {
      return {};
    }

    const runtimeCapacidadOpts = filtersConfig.capacidadOptions?.length ? filtersConfig.capacidadOptions : undefined;
    const runtimeVelocidadOpts = filtersConfig.velocidadOptions?.length ? filtersConfig.velocidadOptions : undefined;

    const defaultCapacidadOpts: FilterOption[] = [
      { value: '120', label: '120 GB' },
      { value: '240', label: '240 GB' },
      { value: '256', label: '256 GB' },
      { value: '480', label: '480 GB' },
      { value: '500', label: '500 GB' },
      { value: '512', label: '512 GB' },
      { value: '1tb', label: '1 TB' },
      { value: '2tb', label: '2 TB' },
      { value: '4gb', label: '4 GB' },
      { value: '8gb', label: '8 GB' },
      { value: '16gb', label: '16 GB' },
      { value: '32gb', label: '32 GB' },
      { value: '64gb', label: '64 GB' },
    ];

    const defaultVelocidadOpts: FilterOption[] = [
      { value: '2400', label: '2400 MHz' },
      { value: '2666', label: '2666 MHz' },
      { value: '3200', label: '3200 MHz' },
      { value: '3600', label: '3600 MHz' },
      { value: '4800', label: '4800 MHz' },
      { value: '5200', label: '5200 MHz' },
      { value: '5600', label: '5600 MHz' },
      { value: '6000', label: '6000 MHz' },
    ];

    const config: FilterSectionsMap = {};
    if (filtersConfig.barrio && (filtersConfig.barrioOptions?.length || 0) > 0) {
      config.barrio = {
        label: 'Localidad / barrio',
        options: filtersConfig.barrioOptions || [],
      };
    }
    if (filtersConfig.capacidad) {
      config.capacidad = {
        label: 'Capacidad',
        options: runtimeCapacidadOpts || defaultCapacidadOpts,
      };
    }
    if (filtersConfig.velocidad) {
      config.velocidad = {
        label: 'Velocidad',
        options: runtimeVelocidadOpts || defaultVelocidadOpts,
      };
    }

    return config;
  }, [filtersConfig, showFilters]);

  const backendSort = mapSortToBackend(sortBy);
  const backendCategory = categoryConfig?.productCategories?.[0] || rootConfig?.productCategories?.[0];
  const categoryDatasetQuery = useQuery(categoryListingQueryOptions({
    category: backendCategory,
    search: buscarQuery,
    page: currentPage,
    perPage: productsPerPage,
    inStock: activeFilters.enStock || undefined,
    sortBy: backendSort.sortBy,
    sortOrder: backendSort.sortOrder,
  }));
  const products = categoryDatasetQuery.data?.data || [];
  const pagination = categoryDatasetQuery.data?.pagination;
  const loading = categoryDatasetQuery.isLoading;
  const error = categoryDatasetQuery.isError ? 'Error al cargar los productos' : null;

  useEffect(() => {
    setActiveFilters({
      capacidad: searchParams.getAll('capacidad'),
      velocidad: searchParams.getAll('velocidad'),
      barrio: searchParams.getAll('barrio'),
      enStock: searchParams.get('stock') === 'true',
    });

    setSortBy(searchParams.get('orden') || 'nombre-asc');
  }, [category, subcategory, subsubcategory, searchParams]);

  useEffect(() => {
    if (!showMobileFilters) return;
    document.body.classList.add('mobile-nav-open');
    return () => {
      document.body.classList.remove('mobile-nav-open');
    };
  }, [showMobileFilters]);

  const syncUrlState = (nextFilters: ActiveFilters, nextSort: string, nextPage: number) => {
    const params = new URLSearchParams();

    if (buscarQuery) {
      params.set('buscar', buscarQuery);
    }

    Object.entries(nextFilters).forEach(([key, val]) => {
      if (key === 'enStock' && val) {
        params.set('stock', 'true');
      } else if (Array.isArray(val)) {
        val.forEach((item) => params.append(key, item));
      }
    });

    if (nextSort !== 'nombre-asc') {
      params.set('orden', nextSort);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }

    setSearchParams(params);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeFilters.capacidad && activeFilters.capacidad.length > 0) {
      result = result.filter((product) => {
        const productText = `${product.name} ${product.description}`.toLowerCase();
        return activeFilters.capacidad!.some((cap) => {
          const variations = [cap, cap.replace('gb', ' gb'), cap.replace('tb', ' tb')];
          return variations.some((value) => productText.includes(value));
        });
      });
    }

    if (activeFilters.velocidad && activeFilters.velocidad.length > 0) {
      result = result.filter((product) => {
        const productText = `${product.name} ${product.description}`.toLowerCase();
        return activeFilters.velocidad!.some((vel) => (
          productText.includes(`${vel}mhz`)
          || productText.includes(`${vel} mhz`)
          || productText.includes(vel)
        ));
      });
    }

    if (activeFilters.barrio && activeFilters.barrio.length > 0) {
      result = result.filter((product) => {
        const haystack = productZoneHaystack(product);
        return activeFilters.barrio!.some((zone) => haystack.includes(zone.toLowerCase()));
      });
    }

    return result;
  }, [activeFilters.capacidad, activeFilters.velocidad, activeFilters.barrio, products]);

  const totalProducts = pagination?.total ?? filteredProducts.length;
  const totalPages = Math.max(pagination?.total_pages ?? 1, 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts;
  const groupedProducts = useMemo(() => groupProductsBySku(paginatedProducts), [paginatedProducts]);

  const updateFilters = (filterKey: keyof ActiveFilters, value: string | boolean) => {
    const nextFilters = { ...activeFilters };

    if (filterKey === 'enStock') {
      nextFilters.enStock = value as boolean;
    } else {
      const currentValues = nextFilters[filterKey] as string[] || [];
      const typedValue = value as string;
      nextFilters[filterKey] = currentValues.includes(typedValue)
        ? currentValues.filter((entry) => entry !== typedValue) as never
        : [...currentValues, typedValue] as never;
    }

    setActiveFilters(nextFilters);
    syncUrlState(nextFilters, sortBy, 1);
  };

  const clearFilters = () => {
    const clearedFilters: ActiveFilters = {
      capacidad: [],
      velocidad: [],
      barrio: [],
      enStock: false,
    };
    setActiveFilters(clearedFilters);
    setSortBy('nombre-asc');
    syncUrlState(clearedFilters, 'nombre-asc', 1);
  };

  const handleSortChange = (nextSort: string) => {
    setSortBy(nextSort);
    syncUrlState(activeFilters, nextSort, 1);
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    syncUrlState(activeFilters, sortBy, nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilterSection = (section: string) => {
    setExpandedFilters((prev) => prev.includes(section)
      ? prev.filter((entry) => entry !== section)
      : [...prev, section]);
  };

  const activeFilterCount =
    (activeFilters.capacidad?.length || 0)
    + (activeFilters.velocidad?.length || 0)
    + (activeFilters.barrio?.length || 0)
    + (activeFilters.enStock ? 1 : 0);

  const FilterSection = ({ filterKey, config }: { filterKey: string; config: { label: string; options: FilterOption[] } }) => {
    const isExpanded = expandedFilters.includes(filterKey);
    const selectedValues = (activeFilters as Record<string, string[]>)[filterKey] || [];

    return (
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => toggleFilterSection(filterKey)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900"
        >
          <span>{config.label}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {config.options.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => updateFilters(filterKey as keyof ActiveFilters, option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="text-white py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(to right, var(--runtime-color-primary), var(--runtime-color-primary-hover))' }}
      >
        {categoryConfig?.image && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${categoryConfig.image})` }}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-2 flex items-center gap-1 text-sm text-white/70">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span>/</span>
            {rootConfig && (
              <Link to={rootConfig.link} className={`hover:text-white ${!subcategory ? 'text-white font-semibold' : ''}`}>
                {rootConfig.name}
              </Link>
            )}
            {level2Config && (
              <>
                <span>/</span>
                <Link to={level2Config.link} className={`hover:text-white ${!subsubcategory ? 'text-white font-semibold' : ''}`}>
                  {level2Config.name}
                </Link>
              </>
            )}
            {level3Config && (
              <>
                <span>/</span>
                <span className="text-white font-semibold">{level3Config.name}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryName}</h1>
          {categoryConfig?.description && (
            <p className="text-lg opacity-90 max-w-3xl">{categoryConfig.description}</p>
          )}

          {navSubcategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={{
                  pathname: (level2Config || rootConfig)?.link || `/categoria/${category}`,
                  search: buscarQuery ? `?buscar=${encodeURIComponent(buscarQuery)}` : undefined,
                }}
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  (!subcategory || (subcategory && !subsubcategory && !level3Config && level2Config === categoryConfig))
                    ? 'bg-white text-foreground'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Todos
              </Link>
              {navSubcategories.map((sub) => {
                const isActive = subsubcategory
                  ? sub.slug === subsubcategory
                  : subcategory
                    ? sub.slug === subcategory && !level3Config
                    : false;

                return (
                  <Link
                    key={sub.slug}
                    to={{
                      pathname: sub.link,
                      search: buscarQuery ? `?buscar=${encodeURIComponent(buscarQuery)}` : undefined,
                    }}
                    className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-foreground'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {showFilters && (
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Filtros
                    </h2>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-sm text-primary hover:opacity-80">
                        Limpiar ({activeFilterCount})
                      </button>
                    )}
                  </div>

                  {filtersConfig.stock !== false && (
                    <div className="border-b border-gray-200 py-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.enStock || false}
                          onChange={(e) => updateFilters('enStock', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">Solo con stock</span>
                      </label>
                    </div>
                  )}

                  {Object.entries(filterConfig).map(([key, config]) => (
                    <FilterSection key={key} filterKey={key} config={config} />
                  ))}
                </div>
              </aside>
            )}

            <div className="lg:hidden flex items-center justify-between mb-4">
              {showFilters ? (
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-foreground text-background text-xs px-2 py-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              ) : (
                <div />
              )}

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg shadow-sm border text-sm"
              >
                <option value="nombre-asc">Nombre A-Z</option>
                <option value="nombre-desc">Nombre Z-A</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
              </select>
            </div>

            {showFilters && showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute right-0 top-0 flex h-dvh max-h-dvh w-80 max-w-full flex-col bg-white shadow-xl">
                  <div className="flex shrink-0 items-center justify-between border-b p-4">
                    <h2 className="font-semibold text-lg">Filtros</h2>
                    <button type="button" onClick={() => setShowMobileFilters(false)} aria-label="Cerrar filtros">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="w-full mb-4 py-2 text-primary border border-primary">
                        Limpiar filtros ({activeFilterCount})
                      </button>
                    )}

                    {filtersConfig.stock !== false && (
                      <div className="border-b border-gray-200 py-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeFilters.enStock || false}
                            onChange={(e) => updateFilters('enStock', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">Solo con stock</span>
                        </label>
                      </div>
                    )}

                    {Object.entries(filterConfig).map(([key, config]) => (
                      <FilterSection key={key} filterKey={key} config={config} />
                    ))}
                  </div>

                  <div className="shrink-0 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-[0.15em] text-sm"
                    >
                      Ver {totalProducts} resultados
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1">
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Mostrando {paginatedProducts.length} de {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg shadow-sm border text-sm"
                  >
                    <option value="nombre-asc">Nombre A-Z</option>
                    <option value="nombre-desc">Nombre Z-A</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeFilters.enStock && (
                    <span className="inline-flex items-center px-3 py-1 bg-muted text-foreground text-sm">
                      Con stock
                      <button onClick={() => updateFilters('enStock', false)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {Object.entries(activeFilters).map(([key, values]) => {
                    if (key === 'enStock' || !Array.isArray(values)) return null;

                    return values.map((value) => (
                      <span key={`${key}-${value}`} className="inline-flex items-center px-3 py-1 bg-muted text-foreground text-sm">
                        {value.toUpperCase()}
                        <button onClick={() => updateFilters(key as keyof ActiveFilters, value)} className="ml-2">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ));
                  })}
                </div>
              )}

              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {error && (
                <div className="text-center py-20">
                  <p className="text-destructive mb-4">{error}</p>
                  <Link to="/" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-semibold uppercase tracking-[0.15em] text-sm hover:opacity-90 transition-opacity">
                    Volver al Inicio
                  </Link>
                </div>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <div className="text-center py-16 border border-border">
                  <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h2 className="text-xl font-bold mb-2">{getUIConfig().noProductsTitle}</h2>
                  <p className="text-muted-foreground mb-6">
                    {activeFilterCount > 0
                      ? 'Intenta ajustar los filtros para ver más resultados'
                      : `No hay productos disponibles en ${categoryName}`}
                  </p>

                  {activeFilterCount > 0 ? (
                    <button onClick={clearFilters} className="inline-block bg-primary text-primary-foreground px-8 py-3 font-semibold uppercase tracking-[0.15em] text-sm hover:opacity-90 transition-opacity">
                      Limpiar filtros
                    </button>
                  ) : (
                    <Link to="/" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-semibold uppercase tracking-[0.15em] text-sm hover:opacity-90 transition-opacity">
                      Volver al Inicio
                    </Link>
                  )}
                </div>
              )}

              {!loading && !error && filteredProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedProducts.map((item) => {
                      if (item.type === 'group') {
                        return <ProductGroupCard key={item.groupKey} group={item} />;
                      }
                      return <ProductCard key={item.product.id} product={item.product} />;
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage <= 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 2)
                        .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                          if (idx > 0 && page - arr[idx - 1] > 1) {
                            acc.push('ellipsis');
                          }
                          acc.push(page);
                          return acc;
                        }, [])
                        .map((item, idx) => item === 'ellipsis' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => goToPage(item)}
                            className={`min-w-[40px] px-3 py-2 text-sm font-medium transition-colors ${
                              item === safeCurrentPage
                                ? 'bg-foreground text-background'
                                : 'border border-border hover:bg-muted'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      <button
                        onClick={() => goToPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage >= totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
