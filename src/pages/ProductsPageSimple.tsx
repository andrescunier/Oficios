/**
 * Página de productos simplificada para debugging
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const ProductsPageSimple: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carga
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Todos los Productos
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Descubre nuestra colección completa de tecnología de vanguardia
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Test Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test de productos</h2>
          <p className="text-gray-600 mb-4">
            Esta es una página de prueba para verificar que la navegación funciona correctamente.
          </p>
          
          {/* Productos de muestra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { id: 1, name: 'SSD Samsung 980 PRO 1TB', price: 89999, image: '/images/categories/ssd-m2.jpg' },
              { id: 2, name: 'Memoria Corsair Vengeance 16GB DDR4', price: 45999, image: '/images/categories/ddr4.jpg' },
              { id: 3, name: 'SSD Kingston NV2 500GB', price: 32999, image: '/images/categories/ssd-sata.jpg' },
              { id: 4, name: 'Memoria G.Skill Trident Z5 32GB DDR5', price: 125999, image: '/images/categories/ddr5.jpg' },
            ].map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-blue-600">
                    ${product.price.toLocaleString('es-AR')}
                  </p>
                  <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✅ Página renderizada correctamente</li>
            <li>✅ React Router funcionando</li>
            <li>✅ Estilos CSS aplicados</li>
            <li>✅ Imágenes cargando</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="text-center">
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