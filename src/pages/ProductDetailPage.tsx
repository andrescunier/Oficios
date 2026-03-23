/**
 * Página de detalles del producto
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus,
  Share2,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react';
import { productService } from '@/services/productService';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/api';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { handleImgError } from '@/utils/imageHelpers';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { 
    addToCart, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    addNotification,
    auth
  } = useStore();

  const isAuthenticated = auth.isAuthenticated;

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const productData = await productService.getProduct(productId);
      setProduct(productData);
    } catch (error: any) {
      setError('No se pudo cargar el producto');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar la información del producto',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/productos/${id}` } });
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

    addToCart(product, quantity);
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Inicia sesión',
        message: 'Necesitas iniciar sesión para agregar productos a favoritos',
      });
      navigate('/login', { state: { from: `/productos/${id}` } });
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

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: product?.currency || 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-4 bg-gray-200 rounded w-24 mr-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-8">{error || 'El producto que buscas no existe'}</p>
          <Link 
            to="/productos"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  const isProductFavorite = isFavorite(product.id);
  const isOutOfStock = (product.stock_quantity || 0) <= 0;
  const maxQuantity = Math.min(product.stock_quantity || 0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600">Inicio</Link>
          <span>/</span>
          <Link to="/productos" className="hover:text-blue-600">Productos</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagen del producto */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={product.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImgError(e, '/placeholder-product.jpg')}
              />
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isProductFavorite
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`w-6 h-6 ${isProductFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.sku && (
                <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
              )}

              {product.category && (
                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              )}
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <PriceDisplay
                price={product.unit_price}
                showLoginButton={true}
                className="text-3xl font-bold text-blue-600"
              />
              {product.metadata?.original_price && product.metadata.original_price > product.unit_price && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.metadata.original_price)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    -{Math.round(((product.metadata.original_price - product.unit_price) / product.metadata.original_price) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Stock - solo para usuarios autenticados */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="font-medium">
                    {isOutOfStock ? 'Sin stock' : `${product.stock_quantity} unidades disponibles`}
                  </span>
                </div>
              </div>
            )}

            {/* Descripción */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Selector de cantidad y botones - solo para usuarios autenticados */}
            {isAuthenticated && !isOutOfStock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Cantidad:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= maxQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Envío Gratis</p>
                  <p className="text-xs text-gray-600">En todas tus compras</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Compra Segura</p>
                  <p className="text-xs text-gray-600">Tus datos protegidos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Transferencia Bancaria</p>
                  <p className="text-xs text-gray-600">Pago seguro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};