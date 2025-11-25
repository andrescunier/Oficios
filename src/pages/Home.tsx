/**
 * Página principal del ecommerce DIAP Store
 */

import React, { useEffect, useMemo, useState } from 'react';
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
import { ASSETS, BRANDING } from '@/config/branding';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [slidesError, setSlidesError] = useState<string | null>(null);
  
  const { setError, addNotification } = useStore();

  // Hero slides - usando configuración de branding
  const { heroSlides, usedFallbackSlides } = useMemo(() => {
    const configuredSlides = (ASSETS.HERO_SLIDES || []).filter(
      (slide) => slide && typeof slide.image === 'string' && slide.image.trim().length > 0
    );

    if (configuredSlides.length) {
      return { heroSlides: configuredSlides, usedFallbackSlides: false };
    }

    return {
      heroSlides: [
        {
          image: '/images/heroes/slide-1.jpg',
          title: 'Tecnología Profesional para Empresas',
          subtitle: 'Soluciones B2B en componentes de alta gama',
          cta: 'Ver catálogo',
          link: '/productos',
        },
        {
          image: '/images/heroes/slide-2.jpg',
          title: 'SSDs de Alto Rendimiento',
          subtitle: 'Almacenamiento profesional para tu negocio',
          cta: 'Explorar SSDs',
          link: '/productos',
        },
        {
          image: '/images/heroes/slide-3.jpg',
          title: 'Memorias RAM DDR4 & DDR5',
          subtitle: 'Maximiza el rendimiento de tus equipos',
          cta: 'Ver memorias',
          link: '/productos',
        },
      ],
      usedFallbackSlides: true,
    };
  }, []);

  useEffect(() => {
    if (usedFallbackSlides) {
      setSlidesError('No se encontraron diapositivas configuradas. Mostrando contenido por defecto.');
    } else {
      setSlidesError(null);
    }
  }, [usedFallbackSlides]);
  
  // Pre-cargar imágenes para mejor rendimiento
  useEffect(() => {
    heroSlides.forEach((slide, index) => {
      const img = new Image();
      img.onerror = () => {
        setSlidesError('No se pudieron cargar algunas imágenes del slider. Revisa la configuración del CDN.');
      };
      img.src = slide.image;
    });
  }, [heroSlides]);

  // Features
  const features = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En todas tus compras"
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Protegemos tus datos con la mejor tecnología"
    },
    {
      icon: CreditCard,
      title: "Transferencia Bancaria",
      description: "Método de pago seguro"
    }
  ];

  // Categories
  const categories = [
    {
      name: "SSD SATA",
      image: "https://dcdn-us.mitiendanube.com/stores/001/498/293/products/f058c1e20b671761b713f47be922719-a2fcf586850d775dac17482988864670-480-0.webp",
      link: "/categoria/ssd-sata",
      description: "SATA III para máximo rendimiento"
    },
    {
      name: "Memoria RAM",
      image: "https://dcdn-us.mitiendanube.com/stores/001/498/293/products/2-78f8d07cb6d82d11a217234745342405-480-0.webp",
      link: "/categoria/memoria-ram",
      description: "Módulos de memoria de alta velocidad"
    }
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    // Auto-slide del hero
    if (heroSlides.length <= 1) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar productos destacados
      const featured = await productService.getFeaturedProducts(8);
      setFeaturedProducts(featured);

      const normalizeProducts = (response: any): Product[] => {
        const productsData = Array.isArray(response) ? response : 
                           (response?.data && Array.isArray(response.data) ? response.data : []);
        
        if (!Array.isArray(productsData)) {
          return [];
        }
        
        return productsData;
      };

      // Cargar productos nuevos (simulado con los más recientes)
      const newProductsResponse = await productService.getProducts({
        per_page: 8,
        is_active: true
      });
      setNewProducts(normalizeProducts(newProductsResponse));

      // Cargar productos en oferta (simulado con productos que tienen descuento)
      const onSaleResponse = await productService.getProducts({
        per_page: 8,
        is_active: true
      });
      const normalizedOnSale = normalizeProducts(onSaleResponse);
      const onSale = normalizedOnSale.filter(product => 
        product?.metadata?.original_price && 
        product.metadata.original_price > product.unit_price
      );
      setOnSaleProducts(onSale);

    } catch (error) {
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
      <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div 
                className="relative w-full h-full"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${slide.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="relative container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <h2 className="text-xl md:text-2xl mb-6 text-blue-100 drop-shadow-md">
                      {slide.subtitle}
                    </h2>
                    <Link to={slide.link}>
                      <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow">
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 hover:scale-110 transition-transform"
          onClick={prevSlide}
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 hover:scale-110 transition-transform"
          onClick={nextSlide}
          aria-label="Siguiente slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <Link key={index} to={category.link}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/images/categories/componentes.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-blue-300 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-200">
                          {category.description}
                        </p>
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
              <Link to="/productos">
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
