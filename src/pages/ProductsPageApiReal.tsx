/**
 * Página de productos con API real e imágenes locales
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Minus } from 'lucide-react';
import { productService } from '@/services/productService';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/api';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { FEATURES } from '@/config/branding';

export const ProductsPageApiReal: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const { addToCart, addNotification, auth } = useStore();
  const isAuthenticated = auth.isAuthenticated;

  useEffect(() => {
    loadProducts();
  }, []);

  // Función para asignar imágenes basadas en el nombre o categoría del producto
  const getProductImage = (product: Product): string => {
    const name = product.name.toLowerCase();
    const category = product.category?.toLowerCase() || '';
    
    // Asignar imágenes basadas en palabras clave
    if (name.includes('ssd') && (name.includes('m.2') || name.includes('nvme') || name.includes('pcie'))) {
      return '/images/categories/ssd-m2.jpg';
    }
    if (name.includes('ssd') && (name.includes('sata') || name.includes('2.5'))) {
      return '/images/categories/ssd-sata.jpg';
    }
    if (name.includes('ssd')) {
      return '/images/categories/ssd-m2.jpg'; // Default para SSDs
    }
    if (name.includes('ddr5') || name.includes('memoria') && name.includes('ddr5')) {
      return '/images/categories/ddr5.jpg';
    }
    if (name.includes('ddr4') || name.includes('memoria') && name.includes('ddr4')) {
      return '/images/categories/ddr4.jpg';
    }
    if (name.includes('memoria') || name.includes('ram')) {
      return '/images/categories/ddr4.jpg'; // Default para memorias
    }
    if (name.includes('gaming') || name.includes('gamer')) {
      return '/images/categories/gaming.jpg';
    }
    
    // Asignar por categoría si no se encontró por nombre
    switch (category) {
      case 'ssd':
      case 'storage':
        return '/images/categories/ssd-m2.jpg';
      case 'memoria':
      case 'memory':
      case 'ram':
        return '/images/categories/ddr4.jpg';
      case 'gaming':
        return '/images/categories/gaming.jpg';
      case 'componentes':
      case 'components':
        return '/images/categories/componentes.jpg';
      default:
        return '/images/categories/componentes.jpg';
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando productos desde la API...');
      
      // Llamar a la API real
      const response = await productService.getProducts({
        page: 1,
        per_page: 50, // Cargar más productos
        is_active: true
      });
      
      console.log('✅ Respuesta de la API:', response);
      
      // Verificar la estructura de la respuesta
      let productArray: Product[] = [];
      
      if (Array.isArray(response)) {
        // La respuesta es directamente un array
        productArray = response;
      } else if (response && Array.isArray(response.data)) {
        // La respuesta tiene estructura PaginatedResponse
        productArray = response.data;
      } else {
        console.error('❌ Estructura de respuesta inesperada:', response);
        throw new Error('Formato de respuesta de API inválido');
      }
      
      console.log('✅ Productos encontrados:', productArray.length);
      
      // Procesar productos y asignar imágenes
      const productsWithImages = productArray.map(product => ({
        ...product,
        image_url: getProductImage(product)
      }));
      
      setProducts(productsWithImages);
      console.log('✅ Productos procesados:', productsWithImages.length);
      
      if (productsWithImages.length === 0) {
        addNotification({
          type: 'info',
          title: 'Información',
          message: 'No se encontraron productos en la base de datos.',
        });
      }
      
    } catch (err: any) {
      console.error('❌ Error loading products:', err);
      
      const errorMessage = err?.message || 'Error desconocido al cargar productos';
      setError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudieron cargar los productos desde el servidor. Verifica tu conexión.',
      });
      
      // Fallback: cargar productos de ejemplo si la API falla
      console.log('🔄 Cargando productos de fallback...');
      loadFallbackProducts();
      
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackProducts = () => {
    const fallbackProducts: Product[] = [
      {
        id: 'fallback-1',
        sku: 'SAM-980PRO-1TB',
        name: 'SSD Samsung 980 PRO 1TB M.2 NVMe',
        description: 'SSD de alta velocidad para gaming y trabajo profesional. Interfaz PCIe 4.0 con velocidades de hasta 7,000 MB/s.',
        unit_price: 89999,
        currency: 'ARS',
        tax_rate: 21,
        category: 'ssd',
        image_url: '/images/categories/ssd-m2.jpg',
        is_featured: true,
        is_active: true,
        stock_quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        sku: 'COR-VEN-16GB',
        name: 'Memoria Corsair Vengeance LPX 16GB DDR4 3200MHz',
        description: 'Kit de memoria DDR4 optimizada para gaming con disipadores de calor de aluminio.',
        unit_price: 45999,
        currency: 'ARS',
        tax_rate: 21,
        category: 'memoria',
        image_url: '/images/categories/ddr4.jpg',
        is_featured: false,
        is_active: true,
        stock_quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        sku: 'GSK-TZ5-32GB',
        name: 'Memoria G.Skill Trident Z5 32GB DDR5 5600MHz',
        description: 'Memoria DDR5 de última generación con RGB y disipadores premium para máximo rendimiento.',
        unit_price: 125999,
        currency: 'ARS',
        tax_rate: 21,
        category: 'memoria',
        image_url: '/images/categories/ddr5.jpg',
        is_featured: true,
        is_active: true,
        stock_quantity: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-4',
        sku: 'KIN-NV2-500GB',
        name: 'SSD Kingston NV2 500GB M.2 NVMe',
        description: 'SSD económico con excelente rendimiento para uso general y gaming.',
        unit_price: 32999,
        currency: 'ARS',
        tax_rate: 21,
        category: 'ssd',
        image_url: '/images/categories/ssd-m2.jpg',
        is_featured: false,
        is_active: true,
        stock_quantity: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setProducts(fallbackProducts);
    setError('Usando productos de demostración (API no disponible)');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Verificar autenticación (solo si el feature está habilitado)
    if (FEATURES.REQUIRE_AUTH_FOR_CART && !isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Inicia sesión',
        message: 'Debes iniciar sesión para agregar productos al carrito',
      });
      // Redirigir a login después de 1 segundo
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }

    const quantity = getQuantity(product.id.toString());

    addToCart(product, quantity);
    addNotification({
      type: 'success', 
      title: 'Producto agregado',
      message: `${product.name} agregado al carrito (${quantity} unidad${quantity > 1 ? 'es' : ''})`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Catálogo de Productos
            </h1>
            <p className="text-xl opacity-90 mb-6">
              SSDs, Memoria RAM y componentes de última tecnología
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              {loading ? 'Cargando desde API...' : `${filteredProducts.length} productos encontrados`}
            </span>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                error && error.includes('demostración') 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                API: {error && error.includes('demostración') ? 'Fallback' : 'Conectada'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Tiempo real
              </span>
            </div>
          </div>
          {error && !error.includes('demostración') && (
            <div className="mt-2 text-sm text-red-600">
              {error} - <button onClick={loadProducts} className="underline hover:no-underline">Reintentar</button>
            </div>
          )}
        </div>

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
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 group">
                {/* Product Image */}
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

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    {product.is_featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
                        Destacado
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description || 'Sin descripción disponible'}
                  </p>
                  
                  <div className="mb-2">
                    <PriceDisplay
                      price={product.unit_price}
                      showLoginButton={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    {product.stock_quantity !== undefined && (
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

                  {/* Selector de cantidad */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(product.id.toString(), getQuantity(product.id.toString()) - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                        disabled={getQuantity(product.id.toString()) <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {getQuantity(product.id.toString())}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id.toString(), getQuantity(product.id.toString()) + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Agregar al Carrito
                  </button>
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