import {
  getApiConfig,
  getBrandingConfig,
  getCategoriesConfig,
  getFeaturesConfig,
  getImagesConfig,
  getNewsletterConfig,
  getShippingConfig,
  getUIConfig,
} from './runtime';

describe('runtime', () => {
  beforeEach(() => {
    window.__APP_CONFIG__ = {
      api: {
        url: 'https://api.example.com',
        accountId: 'account-1',
        accountSlug: 'warpla',
        extraHeaders: {
          'X-Channel': 'warpla',
        },
      },
      header: {
        topBarMessage: 'HOT SALE: promos por tiempo limitado - Envío fijo a todo el país $5.000',
      },
      branding: {
        logo: 'https://cdn.example.com/logo.png',
        headerLogo: 'https://cdn.example.com/header-logo.png',
      },
      features: {
        benefits: [
          {
            icon: 'Truck',
            title: 'Envio Gratis',
            description: 'En compras seleccionadas',
          },
        ],
      },
      shipping: {
        mode: 'flat_rate',
        bannerText: 'Envio a cargo del cliente',
        chargeAmount: 3500,
        chargeProductId: 'shipping-product',
      },
      newsletter: {
        endpoint: 'https://hooks.example.com/newsletter',
        successMessage: 'Alta ok',
      },
      images: {
        heroSlides: [
          {
            image: 'https://cdn.example.com/hero.jpg',
            mobileImage: 'https://cdn.example.com/hero-mobile.jpg',
            title: 'Hero',
            subtitle: 'Subtitle',
            cta: 'Ver mas',
            link: '/productos',
          },
        ],
        categories: [
          {
            name: 'Tablas',
            image: 'https://cdn.example.com/tablas.jpg',
            link: '/productos?category=tablas',
            description: 'Decks',
            group: 'Skateboarding',
          },
        ],
        placeholders: {
          product: '/placeholder-product.svg',
          category: '/placeholder-product.svg',
          user: '/placeholder-product.svg',
        },
        backgrounds: {
          hero: '',
          features: '',
          testimonials: '',
        },
        banners: {
          main: '',
          secondary: '',
          seasonal: '',
          sale: '',
        },
        productFallbacks: {
          default: 'https://cdn.example.com/default.jpg',
        },
      },
    };
  });

  afterEach(() => {
    delete window.__APP_CONFIG__;
  });

  it('normaliza extra headers y logos separados', () => {
    expect(getApiConfig().extraHeaders).toEqual({
      'X-Channel': 'warpla',
    });
    expect(getBrandingConfig()).toMatchObject({
      logo: 'https://cdn.example.com/logo.png',
      headerLogo: 'https://cdn.example.com/header-logo.png',
      footerLogo: 'https://cdn.example.com/header-logo.png',
    });
  });

  it('normaliza hero mobile image y grupos de categorias', () => {
    expect(getImagesConfig().heroSlides[0]).toMatchObject({
      mobileImage: 'https://cdn.example.com/hero-mobile.jpg',
    });
    expect(getCategoriesConfig()[0]).toMatchObject({
      slug: 'tablas',
      group: 'Skateboarding',
    });
  });

  it('usa beneficios configurables en features', () => {
    expect(getFeaturesConfig().benefits).toEqual([
      {
        icon: 'Truck',
        title: 'Envio Gratis',
        description: 'En compras seleccionadas',
      },
    ]);
  });

  it('expone shipping y newsletter configurables', () => {
    expect(getShippingConfig()).toMatchObject({
      mode: 'flat_rate',
      bannerText: 'Envio a cargo del cliente',
      chargeAmount: 3500,
      chargeProductId: 'shipping-product',
    });
    expect(getNewsletterConfig()).toMatchObject({
      endpoint: 'https://hooks.example.com/newsletter',
      successMessage: 'Alta ok',
    });
  });

  it('usa el mensaje promocional del header si ui.headerPromoMessages no viene de la API', () => {
    expect(getUIConfig().headerPromoMessages).toEqual([
      'HOT SALE: promos por tiempo limitado - Envío fijo a todo el país $5.000',
    ]);
  });
});
