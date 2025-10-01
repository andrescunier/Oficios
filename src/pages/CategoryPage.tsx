/**
 * Página de categoría genérica
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  
  const categoryNames: { [key: string]: string } = {
    'ssd-m2': 'SSDs M.2 PCIe NVMe',
    'ssd-sata': 'SSDs 2.5" SATA III',
    'ddr4': 'Memoria DDR4',
    'ddr5': 'Memoria DDR5',
    'componentes': 'Componentes',
    'gaming': 'Gaming',
    'ssds': 'SSDs',
    'memoria': 'Memoria RAM'
  };

  const categoryName = categoryNames[category || ''] || 'Productos';

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
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">
              Próximamente: Productos de {categoryName}
            </h2>
            <p className="text-gray-600 mb-8">
              Estamos preparando el catálogo de productos para esta categoría.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link 
                to="/" 
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};