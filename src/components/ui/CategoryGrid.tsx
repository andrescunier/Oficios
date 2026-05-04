/**
 * Componente de Categorías que usa imágenes configurables
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ASSETS } from '@/config/branding';
import { getCategoriesConfig } from '@/config/runtime';
import { handleImgError } from '@/utils/imageHelpers';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  count?: number;
}

export const CategoryGrid: React.FC = () => {
  // Categorías dinámicas desde config
  const categories: Category[] = getCategoriesConfig().map(c => ({
    id: c.slug || c.link.replace(/^\/categoria\//, ''),
    name: c.name,
    description: c.description,
    image: c.image,
    link: c.link,
  }));

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Collections</p>
          <h2 className="section-title mb-4">
            Explora nuestras categorías
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas en nuestra amplia selección de productos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              aria-label={category.name}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {/* Imagen full bleed */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => handleImgError(e, ASSETS.PLACEHOLDERS.CATEGORY)}
                loading="lazy"
              />

              {/* Overlay para contraste del texto */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40 transition-opacity duration-300 group-hover:from-black/20 group-hover:to-black/50" />

              {/* Texto centrado */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <h3 className="font-serif text-3xl md:text-4xl font-bold leading-tight drop-shadow-md">
                  {category.name}
                </h3>
                <span className="mt-3 text-xs md:text-sm font-medium tracking-[0.35em] uppercase drop-shadow">
                  Collection
                </span>
              </div>

              {/* Badge opcional de cantidad */}
              {category.count && (
                <div className="absolute top-4 right-4 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900">
                  {category.count}+ productos
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Ver Todas las Categorías */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/productos">
              Ver Todos los Productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};