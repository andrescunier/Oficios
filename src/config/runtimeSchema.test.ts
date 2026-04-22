import { getRuntimeConfigValidationErrors, parseRuntimeConfigPayload } from './runtimeSchema';

describe('runtimeSchema', () => {
  it('acepta payload parcial válido', () => {
    const payload = parseRuntimeConfigPayload({
      api: {
        extraHeaders: {
          'X-Channel': 'warpla',
        },
      },
      app: {
        name: 'Tenant Store',
      },
      branding: {
        headerLogo: 'https://cdn.example.com/header.png',
        footerLogo: 'https://cdn.example.com/footer.png',
      },
      observability: {
        enabled: true,
        endpoint: 'https://collector.example.com/frontend-events',
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
        chargeAmount: 2500,
        chargeProductId: 'shipping-product',
      },
      newsletter: {
        endpoint: 'https://hooks.example.com/newsletter',
        buttonLabel: 'Suscribirme',
      },
      business: {
        defaultCurrency: 'ARS',
      },
      images: {
        heroSlides: [
          {
            image: 'https://cdn.example.com/hero.jpg',
            mobileImage: 'https://cdn.example.com/hero-mobile.jpg',
          },
        ],
        categories: [
          {
            name: 'Tablas',
            group: 'Skateboarding',
          },
        ],
        productFallbacks: {
          default: '/placeholder-product.svg',
        },
      },
    });

    expect(payload).not.toBeNull();
    expect(payload?.app?.name).toBe('Tenant Store');
    expect(payload?.api?.extraHeaders?.['X-Channel']).toBe('warpla');
    expect(payload?.images?.heroSlides?.[0]).toMatchObject({
      mobileImage: 'https://cdn.example.com/hero-mobile.jpg',
    });
    expect(payload?.shipping?.chargeProductId).toBe('shipping-product');
    expect(payload?.newsletter?.buttonLabel).toBe('Suscribirme');
  });

  it('rechaza payloads inválidos', () => {
    const payload = parseRuntimeConfigPayload({
      app: 'invalid-shape',
    });

    expect(payload).toBeNull();
    expect(getRuntimeConfigValidationErrors({ app: 'invalid-shape' })[0]).toContain('app');
  });

  it('rechaza extraHeaders con valores no string', () => {
    expect(
      parseRuntimeConfigPayload({
        api: {
          extraHeaders: {
            'X-Bad': 123,
          },
        },
      }),
    ).toBeNull();
  });
});
