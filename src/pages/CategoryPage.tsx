/**
 * Página de categoría genérica con filtros
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types/api';
import { Loader2, Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/store/useStore';

// Tipos para filtros
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ActiveFilters {
  capacidad?: string[];
  marca?: string[];
  tipo?: string[];
  velocidad?: string[];
  precio?: { min?: number; max?: number };
  enStock?: boolean;
}

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['capacidad', 'marca']);
  
  // Filtros activos
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    capacidad: [],
    marca: [],
    tipo: [],
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

  // Configuración de filtros según categoría
  const filterConfig = useMemo(() => {
    if (category === 'ssd-sata') {
      return {
        capacidad: {
          label: 'Capacidad',
          options: [
            { value: '120gb', label: '120 GB' },
            { value: '240gb', label: '240 GB' },
            { value: '256gb', label: '256 GB' },
            { value: '480gb', label: '480 GB' },
            { value: '500gb', label: '500 GB' },
            { value: '512gb', label: '512 GB' },
            { value: '1tb', label: '1 TB' },
            { value: '2tb', label: '2 TB' },
          ]
        },
        marca: {
          label: 'Marca',
          options: [
            { value: 'kingston', label: 'Kingston' },
            { value: 'adata', label: 'ADATA' },
            { value: 'crucial', label: 'Crucial' },
            { value: 'samsung', label: 'Samsung' },
            { value: 'wd', label: 'Western Digital' },
            { value: 'seagate', label: 'Seagate' },
          ]
        },
        tipo: {
          label: 'Tipo',
          options: [
            { value: 'sata-iii', label: 'SATA III' },
            { value: '2.5', label: '2.5"' },
          ]
        }
      };
    } else if (category === 'memoria-ram' || category === 'memoria') {
      return {
        capacidad: {
          label: 'Capacidad',
          options: [
            { value: '4gb', label: '4 GB' },
            { value: '8gb', label: '8 GB' },
            { value: '16gb', label: '16 GB' },
            { value: '32gb', label: '32 GB' },
            { value: '64gb', label: '64 GB' },
          ]
        },
        marca: {
          label: 'Marca',
          options: [
            { value: 'kingston', label: 'Kingston' },
            { value: 'corsair', label: 'Corsair' },
            { value: 'gskill', label: 'G.Skill' },
            { value: 'crucial', label: 'Crucial' },
            { value: 'hyperx', label: 'HyperX' },
            { value: 'adata', label: 'ADATA' },
          ]
        },
        tipo: {
          label: 'Tipo',
          options: [
            { value: 'ddr4', label: 'DDR4' },
            { value: 'ddr5', label: 'DDR5' },
            { value: 'sodimm', label: 'SODIMM (Notebook)' },
            { value: 'dimm', label: 'DIMM (Desktop)' },
          ]
        },
        velocidad: {
          label: 'Velocidad',
          options: [
            { value: '2400', label: '2400 MHz' },
            { value: '2666', label: '2666 MHz' },
            { value: '3200', label: '3200 MHz' },
            { value: '3600', label: '3600 MHz' },
            { value: '4800', label: '4800 MHz' },
            { value: '5200', label: '5200 MHz' },
            { value: '5600', label: '5600 MHz' },
            { value: '6000', label: '6000 MHz' },
          ]
        }
      };
    }
    return {};
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [category]);

  // Sincronizar filtros desde URL
  useEffect(() => {
    const urlFilters: ActiveFilters = {
      capacidad: searchParams.getAll('capacidad'),
      marca: searchParams.getAll('marca'),
      tipo: searchParams.getAll('tipo'),
      velocidad: searchParams.getAll('velocidad'),
      enStock: searchParams.get('stock') === 'true',
    };
    setActiveFilters(urlFilters);
    
    const urlSort = searchParams.get('orden');
    if (urlSort) setSortBy(urlSort);
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProducts({ page: 1, per_page: 100 });
      
      let filtered = response.data;
      
      if (category === 'ssd-sata') {
        filtered = filtered.filter(p => 
          (p.name?.toLowerCase().includes('ssd') && p.name?.toLowerCase().includes('sata')) ||
          (p.description?.toLowerCase().includes('ssd') && p.description?.toLowerCase().includes('sata')) ||
          p.category?.toLowerCase().includes('ssd')
        );
      } else if (category === 'memoria-ram' || category === 'memoria') {
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes('memoria') ||
          p.name?.toLowerCase().includes('ram') ||
          p.name?.toLowerCase().includes('ddr') ||
          p.category?.toLowerCase().includes('memoria') ||
          p.category?.toLowerCase().includes('ram')
        );
      }
      
      setProducts(filtered);
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
        return activeFilters.capacidad!.some(cap => productText.includes(cap.replace('gb', ' gb').replace('tb', ' tb')) || productText.includes(cap));
      });
    }
    
    // Filtrar por marca
    if (activeFilters.marca && activeFilters.marca.length > 0) {
      result = result.filter(p => {
        const productText = `${p.name} ${p.description}`.toLowerCase();
        return activeFilters.marca!.some(marca => productText.includes(marca));
      });
    }
    
    // Filtrar por tipo
    if (activeFilters.tipo && activeFilters.tipo.length > 0) {
      result = result.filter(p => {
        const productText = `${p.name} ${p.description}`.toLowerCase();
        return activeFilters.tipo!.some(tipo => productText.includes(tipo));
      });
    }
    
    // Filtrar por velocidad
    if (activeFilters.velocidad && activeFilters.velocidad.length > 0) {
      result = result.filter(p => {
        const productText = `${p.name} ${p.description}`.toLowerCase();
        return activeFilters.velocidad!.some(vel => productText.includes(vel + 'mhz') || productText.includes(vel + ' mhz'));
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
      marca: [],
      tipo: [],
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
    (activeFilters.marca?.length || 0) +
    (activeFilters.tipo?.length || 0) +
    (activeFilters.velocidad?.length || 0) +
    (activeFilters.enStock ? 1 : 0);

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

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
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
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg shadow-sm border text-sm"
              >
                <option value="nombre-asc">Nombre A-Z</option>
                <option value="nombre-desc">Nombre Z-A</option>
                {auth.isAuthenticated && (
                  <>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                  </>
                )}
              </select>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
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
                    {auth.isAuthenticated && (
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
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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