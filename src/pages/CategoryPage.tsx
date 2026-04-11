/**
 * Página de categoría con filtros y cards unificadas
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/api';
import { Loader2, Filter, X, ChevronDown, ChevronUp, SlidersHorizontal, Plus, Minus, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { getFiltersConfig, getCategoryBySlug } from '@/config/runtime';
import { handleImgError } from '@/utils/imageHelpers';
import { productsQueryOptions } from '@/features/catalog/queries';
import { groupProductsBySku } from '@/utils/skuGrouping';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';
import { ProductCard } from '@/components/product/ProductCard';

// Tipos para filtros
interface FilterOption {
  value: string;
  label: string;
}

interface ActiveFilters {
  capacidad?: string[];
  velocidad?: string[];
  enStock?: boolean;
}

type FilterSectionsMap = Record<string, { label: string; options: FilterOption[] }>;

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { auth, addToCart, addToFavorites, removeFromFavorites, isFavorite, addNotification } = useStore();
  const isAuthenticated = auth.isAuthenticated;
  
  // Obtener configuración de filtros
  const filtersConfig = getFiltersConfig();
  const showFilters = filtersConfig.enabled;
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['capacidad', 'velocidad']);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Filtros activos
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    capacidad: [],
    velocidad: [],
    enStock: false,
  });

  // Ordenamiento
  const [sortBy, setSortBy] = useState<string>('nombre-asc');
  
  // Obtener configuración de la categoría actual desde runtime config
  const categoryConfig = getCategoryBySlug(category || '');
  const categoryName = categoryConfig?.name || category || 'Productos';

  // Configuración de filtros (solo si están habilitados en runtime config)
  const filterConfig = useMemo<FilterSectionsMap>(() => {
    if (!showFilters) return {};

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
  }, [category, showFilters, filtersConfig]);

  const productsQuery = useQuery(productsQueryOptions({ page: 1, per_page: 100, is_active: true }));
  const products = productsQuery.data?.data || [];
  const loading = productsQuery.isLoading;
  const error = productsQuery.isError ? 'Error al cargar los productos' : null;

  // Cargar productos cuando cambia la categoría
  useEffect(() => {
    // Sincronizar filtros desde URL solo al montar o cambiar categoría
    const urlFilters: ActiveFilters = {
      capacidad: searchParams.getAll('capacidad'),
      velocidad: searchParams.getAll('velocidad'),
      enStock: searchParams.get('stock') === 'true',
    };
    setActiveFilters(urlFilters);
    
    const urlSort = searchParams.get('orden');
    if (urlSort) setSortBy(urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Aplicar filtros a los productos
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryConfig?.searchTerms && categoryConfig.searchTerms.length > 0) {
      const terms = categoryConfig.searchTerms.map((term) => term.toLowerCase());
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const metadataCategory = (product.metadata as any)?.category?.toLowerCase() || '';
        const searchable = `${name} ${description} ${metadataCategory}`;
        return terms.some((term) => searchable.includes(term));
      });
    }
    
    // Filtrar por capacidad
    if (activeFilters.capacidad && activeFilters.capacidad.length > 0) {
      result = result.filter(p => {
        const productText = `${p.name} ${p.description}`.toLowerCase();
        return activeFilters.capacidad!.some(cap => {
          // Buscar variaciones como "8gb", "8 gb", "8GB"
          const variations = [
            cap,
            cap.replace('gb', ' gb'),
            cap.replace('tb', ' tb'),
          ];
          return variations.some(v => productText.includes(v));
        });
      });
    }
    
    // Filtrar por velocidad
    if (activeFilters.velocidad && activeFilters.velocidad.length > 0) {
      result = result.filter(p => {
        const productText = `${p.name} ${p.description}`.toLowerCase();
        return activeFilters.velocidad!.some(vel => 
          productText.includes(vel + 'mhz') || 
          productText.includes(vel + ' mhz') ||
          productText.includes(vel)
        );
      });
    }
    
    // Filtrar por stock
    if (activeFilters.enStock) {
      result = result.filter(p => (p.stock_quantity || 0) > 0);
    }
    
    // Ordenar
    result.sort((a, b) => {
      switch (sortBy) {
        case 'nombre-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'nombre-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'precio-asc':
          return (a.unit_price || 0) - (b.unit_price || 0);
        case 'precio-desc':
          return (b.unit_price || 0) - (a.unit_price || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [activeFilters, categoryConfig?.searchTerms, products, sortBy]);

  const groupedProducts = useMemo(() => groupProductsBySku(filteredProducts), [filteredProducts]);

  // Actualizar URL con filtros
  const updateFilters = (filterKey: keyof ActiveFilters, value: string | boolean) => {
    const newFilters = { ...activeFilters };
    
    if (filterKey === 'enStock') {
      newFilters.enStock = value as boolean;
    } else {
      const currentValues = newFilters[filterKey] as string[] || [];
      const valueStr = value as string;
      
      if (currentValues.includes(valueStr)) {
        newFilters[filterKey] = currentValues.filter(v => v !== valueStr) as any;
      } else {
        newFilters[filterKey] = [...currentValues, valueStr] as any;
      }
    }
    
    setActiveFilters(newFilters);
    
    // Actualizar URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (key === 'enStock' && val) {
        params.set('stock', 'true');
      } else if (Array.isArray(val)) {
        val.forEach(v => params.append(key, v));
      }
    });
    if (sortBy !== 'nombre-asc') params.set('orden', sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setActiveFilters({
      capacidad: [],
      velocidad: [],
      enStock: false,
    });
    setSearchParams({});
  };

  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const activeFilterCount = 
    (activeFilters.capacidad?.length || 0) +
    (activeFilters.velocidad?.length || 0) +
    (activeFilters.enStock ? 1 : 0);

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
      navigate('/login', { state: { from: `/categoria/${category}` } });
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
      navigate('/login', { state: { from: `/categoria/${category}` } });
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

  // Componente de filtro individual
  const FilterSection = ({ filterKey, config }: { filterKey: string; config: { label: string; options: FilterOption[] } }) => {
    const isExpanded = expandedFilters.includes(filterKey);
    const selectedValues = (activeFilters as any)[filterKey] || [];
    
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
            {config.options.map(option => (
              <label key={option.value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => updateFilters(filterKey as keyof ActiveFilters, option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {categoryName}
          </h1>
          <p className="text-lg opacity-90">
            Productos de alta calidad para tu setup tecnológico
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters - Desktop */}
            {showFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filtros
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar ({activeFilterCount})
                    </button>
                  )}
                </div>
                
                {/* Filtro de stock */}
                <div className="border-b border-gray-200 py-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters.enStock || false}
                      onChange={(e) => updateFilters('enStock', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Solo con stock
                    </span>
                  </label>
                </div>
                
                {/* Filtros dinámicos */}
                {Object.entries(filterConfig).map(([key, config]) => (
                  <FilterSection key={key} filterKey={key} config={config} />
                ))}
              </div>
            </aside>
            )}

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              {showFilters ? (
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              ) : (
                <div /> 
              )}
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg shadow-sm border text-sm"
              >
                <option value="nombre-asc">Nombre A-Z</option>
                <option value="nombre-desc">Nombre Z-A</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
              </select>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl overflow-y-auto">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Filtros</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="w-full mb-4 py-2 text-blue-600 border border-blue-600 rounded-lg"
                      >
                        Limpiar filtros ({activeFilterCount})
                      </button>
                    )}
                    
                    {/* Filtro de stock */}
                    <div className="border-b border-gray-200 py-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.enStock || false}
                          onChange={(e) => updateFilters('enStock', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          Solo con stock
                        </span>
                      </label>
                    </div>
                    
                    {Object.entries(filterConfig).map(([key, config]) => (
                      <FilterSection key={key} filterKey={key} config={config} />
                    ))}
                  </div>
                  
                  <div className="p-4 border-t">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
                    >
                      Ver {filteredProducts.length} productos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sorting - Desktop */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Mostrando {filteredProducts.length} de {products.length} producto{products.length !== 1 ? 's' : ''}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg shadow-sm border text-sm"
                  >
                    <option value="nombre-asc">Nombre A-Z</option>
                    <option value="nombre-desc">Nombre Z-A</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Tags */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeFilters.enStock && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Con stock
                      <button onClick={() => updateFilters('enStock', false)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {Object.entries(activeFilters).map(([key, values]) => {
                    if (key === 'enStock' || !Array.isArray(values)) return null;
                    return values.map(value => (
                      <span key={`${key}-${value}`} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
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

              {error && (
                <div className="text-center py-20">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Link 
                    to="/" 
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Volver al Inicio
                  </Link>
                </div>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-bold mb-2">
                    No se encontraron productos
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {activeFilterCount > 0 
                      ? 'Intenta ajustar los filtros para ver más resultados'
                      : `No hay productos disponibles en ${categoryName}`
                    }
                  </p>
                  
                  {activeFilterCount > 0 ? (
                    <button
                      onClick={clearFilters}
                      className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  ) : (
                    <Link 
                      to="/" 
                      className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Volver al Inicio
                    </Link>
                  )}
                </div>
              )}

              {!loading && !error && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedProducts.map((item) => {
                    if (item.type === 'group') {
                      return <ProductGroupCard key={item.groupKey} group={item} />;
                    }
                    return <ProductCard key={item.product.id} product={item.product} />;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
