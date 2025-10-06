/**
 * Componente de Categorías que usa imágenes configurables
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ASSETS } from '@/config/branding';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  count?: number;
}

export const CategoryGrid: React.FC = () => {
  // Configurar categorías usando las imágenes de ASSETS
  const categories: Category[] = [
    {
      id: 'componentes',
      name: 'Componentes',
      description: 'Componentes para PC de alta calidad',
      image: ASSETS.CATEGORIES.COMPONENTES,
      link: '/categoria/componentes',
      count: 150
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Productos gaming de última generación',
      image: ASSETS.CATEGORIES.GAMING,
      link: '/categoria/gaming',
      count: 89
    },
    {
      id: 'ddr4',
      name: 'Memoria DDR4',
      description: 'Memoria RAM DDR4 para tu PC',
      image: ASSETS.CATEGORIES.DDR4,
      link: '/categoria/ddr4',
      count: 45
    },
    {
      id: 'ddr5',
      name: 'Memoria DDR5',
      description: 'La nueva generación de memoria RAM',
      image: ASSETS.CATEGORIES.DDR5,
      link: '/categoria/ddr5',
      count: 32
    },
    {
      id: 'ssd-m2',
      name: 'SSD M.2',
      description: 'Almacenamiento rápido y eficiente',
      image: ASSETS.CATEGORIES.SSD_M2,
      link: '/categoria/ssd-m2',
      count: 67
    },
    {
      id: 'ssd-sata',
      name: 'SSD SATA',
      description: 'Almacenamiento SSD tradicional',
      image: ASSETS.CATEGORIES.SSD_SATA,
      link: '/categoria/ssd-sata',
      count: 54
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-background"
            >
              <div className="relative overflow-hidden">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = ASSETS.PLACEHOLDERS.CATEGORY;
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
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
            <Link to="/categorias">
              Ver Todas las Categorías
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};