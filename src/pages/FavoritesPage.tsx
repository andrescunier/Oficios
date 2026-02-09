/**
 * Página de productos favoritos del usuario
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft,
  Lock,
  Grid,
  List,
  Search,
  Trash2,
  Package
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/product/ProductCard';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';

export const FavoritesPage: React.FC = () => {
  const { auth, favorites, removeFromFavorites, addToCart, addNotification } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadFavoriteProducts();
    }
  }, [favorites, auth.isAuthenticated]);

  // Redirigir si no está autenticado
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tus favoritos</p>
          <Link 
            to="/login" 
            state={{ from: '/favoritos' }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const loadFavoriteProducts = async () => {
    setIsLoading(true);
    try {
      const products: Product[] = [];
      
      // Cargar cada producto favorito por su ID
      for (const productId of favorites) {
        try {
          const product = await productService.getProduct(productId);
          products.push(product);
        } catch (error) {
          // Si no se puede cargar un producto, lo eliminamos de favoritos
          removeFromFavorites(productId);
        }
      }
      
      setFavoriteProducts(products);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al cargar favoritos',
        message: 'No se pudieron cargar algunos de tus productos favoritos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const currencyCode = currency || 'ARS';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleRemoveFromFavorites = (productId: string, productName: string) => {
    removeFromFavorites(productId);
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
    addNotification({
      type: 'success',
      title: 'Eliminado de favoritos',
      message: `${productName} fue eliminado de tus favoritos`,
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    filteredFavorites.forEach(product => {
      if (product.stock_quantity && product.stock_quantity > 0) {
        addToCart(product, 1);
        addedCount++;
      }
    });
    
    addNotification({
      type: 'success',
      title: 'Productos agregados',
      message: `${addedCount} productos agregados al carrito`,
    });
  };

  const filteredFavorites = favoriteProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/perfil" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Perfil
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Mis Favoritos</h1>
                <p className="text-gray-600">
                  {favoriteProducts.length} producto{favoriteProducts.length !== 1 ? 's' : ''} guardado{favoriteProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {favoriteProducts.length > 0 && (
              <button
                onClick={handleAddAllToCart}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar Todo al Carrito
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          // Estado de carga
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus favoritos...</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          // Estado vacío
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes favoritos aún</h3>
            <p className="text-gray-600 mb-6">
              Guarda los productos que te gusten para encontrarlos fácilmente más tarde.
            </p>
            <Link 
              to="/productos"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <>
            {/* Controles y filtros */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en favoritos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {filteredFavorites.length} de {favoriteProducts.length} productos
                  </span>
                  
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filteredFavorites.length === 0 ? (
              // No hay resultados de búsqueda
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-gray-600">
                  Intenta con otros términos de búsqueda.
                </p>
              </div>
            ) : (
              <>
                {/* Vista en cuadrícula */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFavorites.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product}
                      />
                    ))}
                  </div>
                )}

                {/* Vista en lista */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredFavorites.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-6">
                          <img
                            src={product.image_url || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(product.unit_price, product.currency)}
                              </span>
                              
                              {product.stock_quantity !== undefined && (
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                  product.stock_quantity > 10 
                                    ? 'bg-green-100 text-green-800'
                                    : product.stock_quantity > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock_quantity > 0 
                                    ? `${product.stock_quantity} en stock`
                                    : 'Sin stock'
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock_quantity === 0}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {product.stock_quantity === 0 ? 'Sin Stock' : 'Agregar'}
                            </button>
                            
                            <button
                              onClick={() => handleRemoveFromFavorites(product.id, product.name)}
                              className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};