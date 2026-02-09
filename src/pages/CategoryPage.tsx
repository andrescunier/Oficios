/**
 * Página de categoría con filtros y cards unificadas
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';
import { Loader2, Filter, X, ChevronDown, ChevronUp, SlidersHorizontal, Plus, Minus, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { getFiltersConfig, getImagesConfig } from '@/config/runtime';

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

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { auth, addToCart, addToFavorites, removeFromFavorites, isFavorite, addNotification } = useStore();
  const isAuthenticated = auth.isAuthenticated;
  
  // Obtener configuración de filtros
  const filtersConfig = getFiltersConfig();
  const showFilters = filtersConfig.enabled;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  
  const categoryNames: { [key: string]: string } = {
    'ssd-sata': 'SSD SATA',
    'memoria-ram': 'Memoria RAM',
    'ssds': 'SSDs',
    'memoria': 'Memoria RAM'
  };

  const categoryName = categoryNames[category || ''] || 'Productos';

  // Configuración de filtros según categoría (solo si están habilitados)
  const filterConfig = useMemo(() => {
    // Si los filtros están deshabilitados, retornar objeto vacío
    if (!showFilters) return {};

    // Opciones por defecto si no vienen del runtime config
    const defaultCapacidadSSD: FilterOption[] = [
      { value: '120', label: '120 GB' },
      { value: '240', label: '240 GB' },
      { value: '256', label: '256 GB' },
      { value: '480', label: '480 GB' },
      { value: '500', label: '500 GB' },
      { value: '512', label: '512 GB' },
      { value: '1tb', label: '1 TB' },
      { value: '2tb', label: '2 TB' },
    ];
    const defaultCapacidadRAM: FilterOption[] = [
      { value: '4gb', label: '4 GB' },
      { value: '8gb', label: '8 GB' },
      { value: '16gb', label: '16 GB' },
      { value: '32gb', label: '32 GB' },
      { value: '64gb', label: '64 GB' },
    ];
    const defaultVelocidad: FilterOption[] = [
      { value: '2400', label: '2400 MHz' },
      { value: '2666', label: '2666 MHz' },
      { value: '3200', label: '3200 MHz' },
      { value: '3600', label: '3600 MHz' },
      { value: '4800', label: '4800 MHz' },
      { value: '5200', label: '5200 MHz' },
      { value: '5600', label: '5600 MHz' },
      { value: '6000', label: '6000 MHz' },
    ];

    // Usar opciones del runtime config si están disponibles
    const runtimeCapacidadOpts = filtersConfig.capacidadOptions?.length ? filtersConfig.capacidadOptions : undefined;
    const runtimeVelocidadOpts = filtersConfig.velocidadOptions?.length ? filtersConfig.velocidadOptions : undefined;
    
    if (category === 'ssd-sata') {
      const config: any = {};
      if (filtersConfig.capacidad) {
        config.capacidad = {
          label: 'Capacidad',
          options: runtimeCapacidadOpts || defaultCapacidadSSD
        };
      }
      return config;
    } else if (category === 'memoria-ram' || category === 'memoria') {
      const config: any = {};
      if (filtersConfig.capacidad) {
        config.capacidad = {
          label: 'Capacidad',
          options: runtimeCapacidadOpts || defaultCapacidadRAM
        };
      }
      if (filtersConfig.velocidad) {
        config.velocidad = {
          label: 'Velocidad',
          options: runtimeVelocidadOpts || defaultVelocidad
        };
      }
      return config;
    }
    return {};
  }, [category, showFilters, filtersConfig]);

  // Función para obtener imagen del producto
  const getProductImage = (product: Product): string => {
    if (product.image_url) return product.image_url;
    
    const fallbacks = getImagesConfig().productFallbacks;
    const defaultImg = fallbacks['default'] || '/images/categories/componentes.jpg';
    const name = product.name?.toLowerCase() || '';
    
    if (name.includes('ssd') && (name.includes('m.2') || name.includes('nvme'))) {
      return fallbacks['ssd-m2'] || fallbacks['ssd-nvme'] || defaultImg;
    }
    if (name.includes('ssd')) {
      return fallbacks['ssd-sata'] || fallbacks['ssd'] || defaultImg;
    }
    if (name.includes('ddr5')) {
      return fallbacks['ddr5'] || defaultImg;
    }
    if (name.includes('ddr4') || name.includes('ram') || name.includes('memoria')) {
      return fallbacks['ddr4'] || fallbacks['memoria'] || fallbacks['ram'] || defaultImg;
    }
    
    return defaultImg;
  };

  // Cargar productos cuando cambia la categoría
  useEffect(() => {
    loadProducts();
    
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

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProducts({ page: 1, per_page: 100 });
      
      let filtered = response.data;
      
      console.log('Total products from API:', filtered.length);
      console.log('Category filter:', category);
      
      if (category === 'ssd-sata') {
        // Filtrar SSDs - buscar en nombre, descripción y metadata.category
        filtered = filtered.filter(p => {
          const name = p.name?.toLowerCase() || '';
          const desc = p.description?.toLowerCase() || '';
          // Buscar en metadata.category si existe
          const metaCat = (p.metadata as any)?.category?.toLowerCase() || '';
          
          const isSSD = name.includes('ssd') || 
                        desc.includes('ssd') || 
                        metaCat.includes('ssd');
          
          return isSSD;
        });
        console.log('After SSD filter:', filtered.length);
      } else if (category === 'memoria-ram' || category === 'memoria') {
        // Filtrar Memoria RAM - buscar por RAM, DDR, memoria en nombre, descripción y metadata
        filtered = filtered.filter(p => {
          const name = p.name?.toLowerCase() || '';
          const desc = p.description?.toLowerCase() || '';
          // Buscar en metadata.category si existe
          const metaCat = (p.metadata as any)?.category?.toLowerCase() || '';
          
          const isRAM = name.includes('ram') ||
                        name.includes('ddr') ||
                        desc.includes('ram') ||
                        desc.includes('ddr') ||
                        desc.includes('sodimm') ||
                        desc.includes('udimm') ||
                        metaCat.includes('memoria') ||
                        metaCat.includes('ram') ||
                        metaCat.includes('memory');
          
          return isRAM;
        });
        console.log('After RAM filter:', filtered.length);
      }
      
      // Asignar imágenes
      const productsWithImages = filtered.map(p => ({
        ...p,
        image_url: getProductImage(p)
      }));
      
      setProducts(productsWithImages);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros a los productos
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
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
  }, [products, activeFilters, sortBy]);

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
    
    addNotification({
      type: 'success',
      title: 'Producto agregado',
      message: `${product.name} agregado al carrito`,
    });
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
                {isAuthenticated && (
                  <>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                  </>
                )}
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
                    {isAuthenticated && (
                      <>
                        <option value="precio-asc">Precio: Menor a Mayor</option>
                        <option value="precio-desc">Precio: Mayor a Menor</option>
                      </>
                    )}
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
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.jpg';
                            }}
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
                        
                        {/* Precio - Solo visible para autenticados */}
                        <div className="mb-2">
                          <PriceDisplay
                            price={product.unit_price}
                            currency={product.currency}
                            showLoginButton={true}
                          />
                        </div>
                        
                        {/* Stock - Solo visible para autenticados */}
                        {isAuthenticated && (
                          <div className="flex items-center justify-between mb-2">
                            {product.stock_quantity !== undefined && (
                              <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Sin stock'}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </span>
                        </div>

                        {/* Controles de acción - Solo para autenticados */}
                        {isAuthenticated && (
                          <div className="space-y-3">
                            {/* Selector de cantidad */}
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

                            {/* Botón agregar al carrito */}
                            <button 
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.stock_quantity || product.stock_quantity <= 0}
                              className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {product.stock_quantity && product.stock_quantity > 0 
                                ? 'Agregar al Carrito' 
                                : 'Sin Stock'
                              }
                            </button>
                          </div>
                        )}

                        {/* Para usuarios no autenticados, mostrar botón de login */}
                        {!isAuthenticated && (
                          <Link 
                            to="/login"
                            state={{ from: `/categoria/${category}` }}
                            className="block w-full py-2 text-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                          >
                            Inicia sesión para ver precios
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
