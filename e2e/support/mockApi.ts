import type { Page, Route } from '@playwright/test';

const now = '2026-03-28T12:00:00.000Z';
const accountId = 'test-account';

const mockAccount = {
  id: accountId,
  name: 'QA Store',
  slug: 'qa-store',
  default_currency: 'ARS',
  timezone: 'America/Argentina/Buenos_Aires',
  status: 'active',
  created_at: now,
  updated_at: now,
};

const mockUser = {
  id: 'user-1',
  person_id: 'person-1',
  email: 'qa@example.com',
  username: 'qa-user',
  role: 'customer',
  status: 'active',
  created_at: now,
  updated_at: now,
  person: {
    id: 'person-1',
    first_name: 'QA',
    last_name: 'Tester',
    email: 'qa@example.com',
    phone: '+54 9 11 5555 5555',
    created_at: now,
    updated_at: now,
  },
};

const mockProducts = [
  {
    id: 'prod-1',
    sku: 'NOTE-QA-1',
    name: 'Notebook QA',
    description: 'Equipo principal para pruebas end-to-end.',
    unit_price: 1500000,
    currency: 'ARS',
    tax_rate: 0.105,
    has_variants: false,
    stock_quantity: 10,
    allow_backorders: false,
    image_url: '/placeholder-product.svg',
    category: 'notebooks',
    is_featured: true,
    is_active: true,
    metadata: {
      original_price: 1700000,
    },
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-2',
    sku: 'MON-QA-2',
    name: 'Monitor QA',
    description: 'Monitor secundario para catálogo.',
    unit_price: 420000,
    currency: 'ARS',
    tax_rate: 0.105,
    has_variants: false,
    stock_quantity: 6,
    allow_backorders: false,
    image_url: '/placeholder-product.svg',
    category: 'monitores',
    is_featured: false,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

const validRuntimeConfig = {
  api: {
    url: 'http://127.0.0.1:4010',
    accountId,
    accountSlug: 'qa-store',
    channel: 'ecommerce',
  },
  app: {
    name: 'Tienda QA',
    companyName: 'QA Store SA',
    slogan: 'Todo por API',
    hidePricesForGuests: false,
    requireAuthForCart: true,
  },
  business: {
    defaultCurrency: 'ARS',
    locale: 'es-AR',
    maxQuantityPerProduct: 5,
    productsPerPage: 12,
    featuredProductsCount: 4,
    defaultTaxRate: 0.105,
  },
  paymentMethods: {
    transferencia: true,
    efectivo: true,
  },
  payment: {
    bankName: 'Banco QA',
    accountHolder: 'QA Store SA',
    cbu: '0000000000000000000001',
    alias: 'qa.store',
    whatsappVerification: '+5491111111111',
  },
  images: {
    heroSlides: [
      {
        image: '/placeholder-product.svg',
        title: 'Todo por API',
        subtitle: 'Bootstrap y checkout bajo prueba',
        cta: 'Ver productos',
        link: '/productos',
      },
    ],
    categories: [
      {
        name: 'Notebooks',
        image: '/placeholder-product.svg',
        link: '/categoria/notebooks',
        slug: 'notebooks',
      },
    ],
    productFallbacks: {
      default: '/placeholder-product.svg',
    },
  },
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

interface MockApiOptions {
  runtimePayload?: unknown;
  submitFailure?: {
    status?: number;
    message: string;
  };
}

const buildProductsResponse = (featuredOnly: boolean) => {
  const data = featuredOnly ? mockProducts.filter((product) => product.is_featured) : mockProducts;
  return {
    data,
    pagination: {
      page: 1,
      per_page: data.length,
      total: data.length,
      total_pages: 1,
    },
  };
};

export async function installMockApi(
  page: Page,
  options?: MockApiOptions
) {
  const runtimePayload = options?.runtimePayload ?? validRuntimeConfig;

  await page.route('**/config.js', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `window.__APP_CONFIG__ = ${JSON.stringify({
        api: {
          url: 'http://127.0.0.1:4010',
          accountId,
          accountSlug: 'qa-store',
          channel: 'ecommerce',
        },
      })};`,
    });
  });

  await page.route('http://127.0.0.1:4010/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname, searchParams } = url;

    if (pathname === `/api/accounts/${accountId}/ecommerce-config`) {
      return json(route, { data: runtimePayload });
    }

    if (
      (pathname === `/api/accounts/${accountId}/products` ||
        pathname === `/api/accounts/${accountId}/products/public`) &&
      request.method() === 'GET'
    ) {
      return json(route, buildProductsResponse(searchParams.get('is_featured') === 'true'));
    }

    if (pathname === `/api/accounts/${accountId}/products/prod-1`) {
      return json(route, { data: mockProducts[0] });
    }

    if (pathname === `/api/accounts/${accountId}/products/prod-1/variants`) {
      return json(route, { data: [] });
    }

    if (pathname === `/api/accounts/${accountId}/products/prod-1/variant-options`) {
      return json(route, { data: [] });
    }

    if (pathname === '/api/auth/login' && request.method() === 'POST') {
      return json(route, {
        success: true,
        data: {
          access_token: 'token-12345678901234567890',
          token_type: 'bearer',
          user: mockUser,
          account: mockAccount,
          accessible_accounts: [
            {
              ...mockAccount,
              role: 'customer',
              is_default: true,
            },
          ],
          customer: {
            business_partner_id: 'bp-1',
          },
          business_partner_id: 'bp-1',
        },
      });
    }

    if (pathname === '/api/auth/me' && request.method() === 'GET') {
      return json(route, {
        success: true,
        data: {
          account: mockAccount,
          accessible_accounts: [
            {
              ...mockAccount,
              role: 'customer',
              is_default: true,
            },
          ],
          user: mockUser,
          person: mockUser.person,
          billing: {
            business_partner_id: 'bp-1',
          },
          customer: {
            business_partner_id: 'bp-1',
          },
          business_partner_id: 'bp-1',
        },
      });
    }

    if (pathname === `/api/accounts/${accountId}/sales-orders` && request.method() === 'POST') {
      const body = request.postDataJSON() as Record<string, unknown>;
      return json(route, {
        success: true,
        data: {
          id: 'so-1',
          order_number: body.order_number || 'SO-1',
          customer_id: body.customer_id || 'bp-1',
          currency: body.currency || 'ARS',
          status: 'draft',
          total_amount: 1657500,
          items: body.items || [],
          created_at: now,
          updated_at: now,
        },
      });
    }

    if (pathname === `/api/accounts/${accountId}/sales-orders/so-1/submit` && request.method() === 'POST') {
      if (options?.submitFailure) {
        return json(route, {
          message: options.submitFailure.message,
          details: {
            reason: options.submitFailure.message,
          },
        }, options.submitFailure.status ?? 400);
      }

      return json(route, {
        success: true,
        message: 'submitted',
        data: {
          status: 'pending_payment',
        },
      });
    }

    return json(route, { message: `Unhandled mock route: ${request.method()} ${pathname}` }, 404);
  });
}
