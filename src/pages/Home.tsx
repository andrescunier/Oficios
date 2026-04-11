/**
 * Página principal del ecommerce
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { ASSETS, BRANDING, BUSINESS, FEATURES } from '@/config/branding';
import { getImagesConfig } from '@/config/runtime';
import { handleImgError } from '@/utils/imageHelpers';
import { featuredProductsQueryOptions, productsQueryOptions } from '@/features/catalog/queries';
import { getFeatureBenefitIcon } from '@/components/ui/featureBenefitIcons';
import { groupProductsBySku } from '@/utils/skuGrouping';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setError, addNotification } = useStore();
  const featuredProductsQuery = useQuery(featuredProductsQueryOptions(BUSINESS.FEATURED_PRODUCTS_COUNT));
  const newProductsQuery = useQuery(productsQueryOptions({
    per_page: BUSINESS.FEATURED_PRODUCTS_COUNT,
    is_active: true,
  }));
  const onSaleProductsQuery = useQuery(productsQueryOptions({
    per_page: BUSINESS.FEATURED_PRODUCTS_COUNT,
    is_active: true,
  }));
  const featuredProducts = featuredProductsQuery.data || [];
  const newProducts = newProductsQuery.data?.data || [];
  const onSaleProducts = useMemo(() => {
    const products = onSaleProductsQuery.data?.data || [];
    return products.filter((product) =>
      product?.metadata?.original_price && product.metadata.original_price > product.unit_price
    );
  }, [onSaleProductsQuery.data]);
  const isLoading = featuredProductsQuery.isLoading || newProductsQuery.isLoading || onSaleProductsQuery.isLoading;

  const groupedFeatured = useMemo(() => groupProductsBySku(featuredProducts), [featuredProducts]);
  const groupedNew = useMemo(() => groupProductsBySku(newProducts), [newProducts]);
  const groupedOnSale = useMemo(() => groupProductsBySku(onSaleProducts), [onSaleProducts]);

  // Hero slides - solo lo que viene de la API, sin fallbacks hardcodeados
  const heroSlides = useMemo(() => {
    return (ASSETS.HERO_SLIDES || []).filter(
      (slide) => slide && typeof slide.image === 'string' && slide.image.trim().length > 0
    );
  }, []);
  
  // Pre-cargar imágenes para mejor rendimiento
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;

      if (slide.mobileImage) {
        const mobileImg = new Image();
        mobileImg.src = slide.mobileImage;
      }
    });
  }, [heroSlides]);

  const benefits = FEATURES.SHIPPING_BENEFITS;
  const heroSliderInterval = BUSINESS.HERO_SLIDER_INTERVAL;

  // Categories (desde runtime config)
  const runtimeImages = getImagesConfig();
  const categories = runtimeImages.categories;

  useEffect(() => {
    if (featuredProductsQuery.isError || newProductsQuery.isError || onSaleProductsQuery.isError) {
      setError('Error al cargar los datos de la página principal');
      addNotification({
        type: 'error',
        title: 'Error de carga',
        message: 'No se pudieron cargar algunos productos. Intenta recargar la página.',
      });
    }
  }, [
    addNotification,
    featuredProductsQuery.isError,
    newProductsQuery.isError,
    onSaleProductsQuery.isError,
    setError,
  ]);

  useEffect(() => {
    // Auto-slide del hero
    if (heroSlides.length <= 1) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, heroSliderInterval);

    return () => clearInterval(interval);
  }, [heroSlides, heroSliderInterval]);

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
      {/* Hero Section - solo si hay slides de la API */}
      {heroSlides.length > 0 && (
        <section className="relative min-h-[540px] overflow-hidden bg-gray-950 sm:min-h-[620px]">
          <div className="relative h-full min-h-[540px] w-full sm:min-h-[620px]">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'z-10 opacity-100' : 'z-0 opacity-0'
                }`}
              >
                <div className="relative min-h-[540px] sm:min-h-[620px]">
                  <picture className="absolute inset-0">
                    {slide.mobileImage ? (
                      <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                    ) : null}
                    <img
                      src={slide.image}
                      alt={slide.title || BRANDING.APP_NAME}
                      className="h-full w-full object-cover object-center"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="relative container mx-auto flex min-h-[540px] items-end px-4 pb-14 pt-24 sm:min-h-[620px] sm:items-center sm:pb-20">
                    <div className="max-w-2xl text-white">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/75">
                        {BRANDING.COMPANY_NAME}
                      </p>
                      <h1 className="mb-4 text-4xl font-bold leading-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
                        {slide.title}
                      </h1>
                      <h2 className="mb-6 max-w-xl text-base text-white/85 drop-shadow-md sm:text-xl lg:text-2xl">
                        {slide.subtitle}
                      </h2>
                      <Link to={slide.link}>
                        <Button
                          size="lg"
                          variant="secondary"
                          className="px-6 text-base shadow-lg transition-shadow hover:shadow-xl sm:px-8 sm:text-lg"
                        >
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
          {heroSlides.length > 1 ? (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 transition-transform hover:scale-110 md:inline-flex"
                onClick={prevSlide}
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 transition-transform hover:scale-110 md:inline-flex"
                onClick={nextSlide}
                aria-label="Siguiente slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          ) : null}

          {/* Dots indicator */}
          {heroSlides.length > 1 ? (
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {benefits.map((feature, index) => {
              const Icon = getFeatureBenefitIcon(feature.icon);
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section - solo si la API devolvió categorías */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Explora por Categorías</h2>
              <p className="text-lg text-muted-foreground">
                Encuentra exactamente lo que necesitas para tu hogar
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              {categories.map((category, index) => (
                <Link key={index} to={category.link}>
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) =>
                            handleImgError(
                              e,
                              runtimeImages.productFallbacks.default || '/images/categories/componentes.jpg',
                            )
                          }
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-blue-300">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-200">{category.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
              {groupedFeatured.map((item) => {
                if (item.type === 'group') {
                  return <ProductGroupCard key={item.groupKey} group={item} />;
                }
                return <ProductCard key={item.product.id} product={item.product} />;
              })}
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
            {groupedNew.slice(0, 4).map((item) => {
              if (item.type === 'group') {
                return <ProductGroupCard key={item.groupKey} group={item} />;
              }
              return <ProductCard key={item.product.id} product={item.product} />;
            })}
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
              {groupedOnSale.slice(0, 4).map((item) => {
                if (item.type === 'group') {
                  return <ProductGroupCard key={item.groupKey} group={item} />;
                }
                return <ProductCard key={item.product.id} product={item.product} />;
              })}
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
