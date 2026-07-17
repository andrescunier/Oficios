/**
 * Página principal del ecommerce
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CategoryConfig } from '@/config/runtime';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { ASSETS, BRANDING, BUSINESS, FEATURES, NEWSLETTER } from '@/config/branding';
import { getImagesConfig, getLoanConfig, getUIConfig } from '@/config/runtime';
import { handleImgError } from '@/utils/imageHelpers';
import { featuredProductsQueryOptions, productsQueryOptions } from '@/features/catalog/queries';
import { getFeatureBenefitIcon } from '@/components/ui/featureBenefitIcons';
import { groupProductsBySku } from '@/utils/skuGrouping';
import { ProductGroupCard } from '@/components/product/ProductGroupCard';
import { subscribeToNewsletter } from '@/services/newsletterService';

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const { setError, addNotification } = useStore();
  const featuredProductsQuery = useQuery(featuredProductsQueryOptions(BUSINESS.FEATURED_PRODUCTS_COUNT));
  const newProductsQuery = useQuery(productsQueryOptions({
    per_page: BUSINESS.PRODUCTS_PER_PAGE,
    is_active: true,
    sort_by: 'created',
    sort_order: 'desc',
  }));
  const onSaleProductsQuery = useQuery(productsQueryOptions({
    per_page: BUSINESS.PRODUCTS_PER_PAGE,
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
  const uiCfg = getUIConfig();
  const loanCfg = getLoanConfig();
  const featuredEyebrow = loanCfg.enabled ? loanCfg.badgeLabel : 'Best sellers';

  useEffect(() => {
    if (featuredProductsQuery.isError || newProductsQuery.isError || onSaleProductsQuery.isError) {
      setError('Error al cargar los datos de la página principal');
      addNotification({
        type: 'error',
        title: 'Error de carga',
        message: 'No se pudieron cargar algunos oficios. Intentá recargar la página.',
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) {
      return;
    }

    setIsSubmittingNewsletter(true);
    try {
      await subscribeToNewsletter(newsletterEmail.trim());
      addNotification({
        type: 'success',
        title: 'Suscripcion registrada',
        message: NEWSLETTER.SUCCESS_MESSAGE,
      });
      setNewsletterEmail('');
    } catch {
      addNotification({
        type: 'error',
        title: 'No pudimos suscribirte',
        message: NEWSLETTER.ERROR_MESSAGE,
      });
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - solo si hay slides de la API */}
      {heroSlides.length > 0 && (
        <section className="relative min-h-[540px] overflow-hidden bg-gray-950 sm:min-h-[620px]">
          <div className="relative h-full min-h-[540px] w-full sm:min-h-[620px]">
            {heroSlides.map((slide, index) => (
              <div
                key={`${slide.link}-${slide.image}-${index}`}
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
                  key={`${heroSlides[index]?.link || ''}-${heroSlides[index]?.image || ''}-${index}`}
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
      {uiCfg.showHomeBenefits !== false && benefits.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {benefits.map((feature) => {
                const Icon = getFeatureBenefitIcon(feature.icon);
                return (
                  <div key={`${feature.icon}-${feature.title}-${feature.description}`} className="text-center">
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
      )}

      {/* Categories Section - slider horizontal de imágenes rectangulares */}
      {categories.length > 0 && (
        <CategoriesSlider
          categories={categories}
          fallbackImage={runtimeImages.productFallbacks.default || '/images/categories/componentes.jpg'}
        />
      )}

      {/* Featured Products */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
            <div>
              <p className="eyebrow mb-2">{featuredEyebrow}</p>
              <h2 className="section-title">{uiCfg.homeFeaturedTitle}</h2>
              <p className="text-muted-foreground mt-2">{uiCfg.homeFeaturedSubtitle}</p>
            </div>
            <Link to="/productos?featured=true" className="self-start md:self-end">
              <Button variant="outline" className="rounded-none uppercase tracking-[0.2em] text-xs">
                {uiCfg.homeViewAllLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
            <div>
              <p className="eyebrow mb-2">Nuevos</p>
              <h2 className="section-title">{uiCfg.homeNewTitle}</h2>
              <p className="text-muted-foreground mt-2">{uiCfg.homeNewSubtitle}</p>
            </div>
            <Link to="/productos?sort=newest" className="self-start md:self-end">
              <Button variant="outline" className="rounded-none uppercase tracking-[0.2em] text-xs">
                {uiCfg.homeViewAllLabel}
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
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
              <div>
                <p className="eyebrow mb-2">Demanda</p>
                <h2 className="section-title flex items-center gap-3">
                  {uiCfg.homeSaleTitle}
                </h2>
                <p className="text-muted-foreground mt-2">{uiCfg.homeSaleSubtitle}</p>
              </div>
              <Link to="/productos" className="self-start md:self-end">
                <Button variant="outline" className="rounded-none uppercase tracking-[0.2em] text-xs">
                  {uiCfg.homeViewAllLabel}
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
      {NEWSLETTER.ENABLED && (
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{NEWSLETTER.TITLE}</h2>
          <p className="text-lg mb-8 text-primary-foreground/80">
            {NEWSLETTER.DESCRIPTION}
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex space-x-2">
            <input
              type="email"
              placeholder={NEWSLETTER.PLACEHOLDER}
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 rounded-lg border border-white/40 bg-white px-4 py-2 text-gray-900 shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-primary"
              required
            />
            <Button variant="secondary" type="submit" disabled={isSubmittingNewsletter}>
              {isSubmittingNewsletter ? 'Enviando...' : NEWSLETTER.BUTTON_LABEL}
            </Button>
          </form>
        </div>
      </section>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Categories slider (full-width, rectangular tiles + arrows)                */
/* -------------------------------------------------------------------------- */

interface CategoriesSliderProps {
  categories: CategoryConfig[];
  fallbackImage: string;
}

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({ categories, fallbackImage }) => {
  const uiCfg = getUIConfig();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, categories.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  // Configurable: cantidad por vista y padding lateral
  const configuredPerView = Math.max(1, Math.min(uiCfg.homeCategoriesPerView ?? 3, 8));
  const desktopPerView = Math.min(categories.length, configuredPerView) || 1;
  const tabletPerView = Math.min(categories.length, Math.max(1, Math.min(2, configuredPerView))) || 1;
  const showArrows = categories.length > desktopPerView;
  const sidePadding = Math.max(0, uiCfg.homeCategoriesSidePadding ?? 0);
  const loanCfg = getLoanConfig();
  const categoriesEyebrow = loanCfg.enabled
    ? loanCfg.providerName
    : (uiCfg.homeCategoriesEyebrow || uiCfg.homeCategoriesSubtitle || 'Elegí un oficio');

  return (
    <section className="py-12 md:py-16">
      <div
        className="mx-auto w-full"
        style={{ paddingLeft: `${sidePadding}px`, paddingRight: `${sidePadding}px` }}
      >
        {uiCfg.showHomeCategoriesHeader !== false && (uiCfg.homeCategoriesTitle || uiCfg.homeCategoriesSubtitle) && (
          <div className="mb-8 text-center md:mb-10">
            <p className="eyebrow mb-2">{categoriesEyebrow}</p>
            {uiCfg.homeCategoriesTitle && (
              <h2 className="section-title">{uiCfg.homeCategoriesTitle}</h2>
            )}
            {uiCfg.homeCategoriesSubtitle && (
              <p className="text-muted-foreground mx-auto mt-2 max-w-2xl">{uiCfg.homeCategoriesSubtitle}</p>
            )}
          </div>
        )}

        <div className="relative">
          {showArrows && canScrollPrev && (
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-black/10 backdrop-blur transition hover:bg-background md:flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {showArrows && canScrollNext && (
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-black/10 backdrop-blur transition hover:bg-background md:flex"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 md:gap-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              ['--cats-desktop' as string]: String(desktopPerView),
              ['--cats-tablet' as string]: String(tabletPerView),
            }}
          >
            {categories.map((category) => (
              <Link
                key={category.slug || category.link || category.name}
                to={category.link}
                className="group relative flex w-[88%] shrink-0 snap-start flex-col sm:w-[calc((100%-(var(--cats-tablet)-1)*1.25rem)/var(--cats-tablet))] lg:w-[calc((100%-(var(--cats-desktop)-1)*1.25rem)/var(--cats-desktop))]"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 group-hover:shadow-xl">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => handleImgError(e, fallbackImage)}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center text-background">
                    <h3 className="text-2xl font-bold uppercase tracking-[0.12em] drop-shadow-md md:text-3xl">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
