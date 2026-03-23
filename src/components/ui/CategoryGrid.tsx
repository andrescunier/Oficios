/**
 * Componente de Categorías que usa imágenes configurables
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explora Nuestras Categorías
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas en nuestra amplia selección de productos tecnológicos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-background"
            >
              <div className="relative overflow-hidden">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => handleImgError(e, ASSETS.PLACEHOLDERS.CATEGORY)}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Product Count Badge */}
                  {category.count && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {category.count}+ productos
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link to={category.link}>
                      Ver Productos
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
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