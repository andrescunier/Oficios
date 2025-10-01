/**
 * Página principal del ecommerce iAmerican
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/store/useStore';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { setError, addNotification } = useStore();

  // Hero slides
  const heroSlides = [
    {
      id: 1,
      title: "DEFEND YOUR WALLET. UPGRADE YOUR POWER!",
      subtitle: "Tecnología de vanguardia a precios justos",
      description: "SSDs, memoria RAM y componentes de alta calidad para potenciar tu equipo",
      image: "/images/heroes/slide-1.jpg",
      cta: "Explorar Productos",
      link: "/productos"
    },
    {
      id: 2,
      title: "Soluciones Innovadoras",
      subtitle: "SSDs M.2 PCIe NVMe de última generación",
      description: "Experimenta velocidades extremas y rendimiento sin límites",
      image: "/images/heroes/slide-2.jpg",
      cta: "Ver SSDs",
      link: "/categoria/ssds"
    },
    {
      id: 3,
      title: "Memoria del Futuro",
      subtitle: "DDR4 y DDR5 para máximo rendimiento",
      description: "Revoluciona tu flujo de trabajo con nuestra tecnología de memoria avanzada",
      image: "/images/heroes/slide-3.jpg",
      cta: "Ver Memoria",
      link: "/categoria/memoria"
    }
  ];

  // Features
  const features = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En compras superiores a $50.000 a todo el país"
    },
    {
      icon: RotateCcw,
      title: "Devolución Gratis",
      description: "Hasta 30 días para devolver tu compra"
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Protegemos tus datos con la mejor tecnología"
    },
    {
      icon: CreditCard,
      title: "Múltiples Pagos",
      description: "Tarjetas, transferencia, efectivo y más"
    }
  ];

  // Categories
  const categories = [
    {
      name: "SSDs M.2",
      image: "/images/categories/ssd-m2.jpg",
      link: "/categoria/ssd-m2",
      description: "PCIe NVMe de alta velocidad"
    },
    {
      name: "SSDs 2.5\"",
      image: "/images/categories/ssd-sata.jpg",
      link: "/categoria/ssd-sata",
      description: "SATA III para máximo rendimiento"
    },
    {
      name: "Memoria DDR4",
      image: "/images/categories/ddr4.jpg",
      link: "/categoria/ddr4",
      description: "Módulos de memoria de alta velocidad"
    },
    {
      name: "Memoria DDR5",
      image: "/images/categories/ddr5.jpg",
      link: "/categoria/ddr5",
      description: "La nueva generación de memoria"
    },
    {
      name: "Componentes",
      image: "/images/categories/componentes.jpg",
      link: "/categoria/componentes",
      description: "Accesorios y componentes PC"
    },
    {
      name: "Gaming",
      image: "/images/categories/gaming.jpg",
      link: "/categoria/gaming",
      description: "Hardware optimizado para gaming"
    }
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    // Auto-slide del hero
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar productos destacados
      const featured = await productService.getFeaturedProducts(8);
      setFeaturedProducts(featured);

      // Cargar productos nuevos (simulado con los más recientes)
      const newProductsResponse = await productService.getProducts({
        per_page: 8,
        is_active: true
      });
      setNewProducts(newProductsResponse.data);

      // Cargar productos en oferta (simulado con productos que tienen descuento)
      const onSaleResponse = await productService.getProducts({
        per_page: 8,
        is_active: true
      });
      // Filtrar productos con descuento
      const onSale = onSaleResponse.data.filter(product => 
        product.metadata?.original_price && 
        product.metadata.original_price > product.unit_price
      );
      setOnSaleProducts(onSale);

    } catch (error) {
      console.error('Error loading home data:', error);
      setError('Error al cargar los datos de la página principal');
      addNotification({
        type: 'error',
        title: 'Error de carga',
        message: 'No se pudieron cargar algunos productos. Intenta recargar la página.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : 
                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              <div className="relative w-full h-full bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      {slide.title}
                    </h1>
                    <h2 className="text-xl md:text-2xl mb-4 text-blue-100">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg mb-8 text-blue-50">
                      {slide.description}
                    </p>
                    <Link to={slide.link}>
                      <Button size="lg" variant="secondary" className="text-lg px-8">
                        {slide.cta}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explora por Categorías</h2>
            <p className="text-lg text-muted-foreground">
              Encuentra exactamente lo que necesitas para tu hogar
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to={category.link}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">{category.name.charAt(0)}</span>
                        </div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
              <p className="text-muted-foreground">Los productos más populares de nuestra tienda</p>
            </div>
            <Link to="/productos?featured=true">
              <Button variant="outline">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Nuevos Productos</h2>
              <p className="text-muted-foreground">Las últimas incorporaciones a nuestro catálogo</p>
            </div>
            <Link to="/productos?sort=newest">
              <Button variant="outline">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Sale Products */}
      {onSaleProducts.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Ofertas Especiales
                  <Badge variant="destructive" className="ml-2">HOT</Badge>
                </h2>
                <p className="text-muted-foreground">Aprovecha estos descuentos por tiempo limitado</p>
              </div>
              <Link to="/ofertas">
                <Button variant="outline">
                  Ver Todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¡No te pierdas nuestras ofertas!</h2>
          <p className="text-lg mb-8 text-primary-foreground/80">
            Suscríbete a nuestro newsletter y recibe descuentos exclusivos
          </p>
          <div className="max-w-md mx-auto flex space-x-2">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-4 py-2 rounded-lg text-foreground"
            />
            <Button variant="secondary">
              Suscribirse
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
