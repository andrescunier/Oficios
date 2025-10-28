/**
 * Página de categoría genérica
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types/api';
import { Loader2 } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const categoryNames: { [key: string]: string } = {
    'ssd-sata': 'SSD SATA',
    'memoria-ram': 'Memoria RAM',
    'ssds': 'SSDs',
    'memoria': 'Memoria RAM'
  };

  const categoryName = categoryNames[category || ''] || 'Productos';

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los productos
      const response = await productService.getProducts({ page: 1, limit: 100 });
      
      // Filtrar productos según la categoría
      let filtered = response.data;
      
      if (category === 'ssd-sata') {
        // Filtrar SSDs SATA (productos que contengan "SSD" y "SATA" en el nombre o descripción)
        filtered = filtered.filter(p => 
          (p.name?.toLowerCase().includes('ssd') && p.name?.toLowerCase().includes('sata')) ||
          (p.description?.toLowerCase().includes('ssd') && p.description?.toLowerCase().includes('sata')) ||
          p.category?.toLowerCase().includes('ssd')
        );
      } else if (category === 'memoria-ram' || category === 'memoria') {
        // Filtrar Memoria RAM (productos que contengan "memoria" o "RAM" o "DDR")
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryName}
          </h1>
          <p className="text-xl opacity-90">
            Productos de alta calidad para tu setup tecnológico
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
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

          {!loading && !error && products.length === 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8">
                No hay productos disponibles en {categoryName}
              </h2>
              <p className="text-gray-600 mb-8">
                Estamos preparando el catálogo de productos para esta categoría.
              </p>
              
              <div className="mt-12">
                <Link 
                  to="/" 
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Volver al Inicio
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};