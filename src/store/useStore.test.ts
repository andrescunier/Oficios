import { useStore } from './useStore';

describe('useStore', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.__APP_CONFIG__ = {
      business: {
        defaultCurrency: 'USD',
        defaultTaxRate: 0.1,
        maxQuantityPerProduct: 3,
        defaultCountry: 'USA',
        locale: 'en-US',
      },
    };

    useStore.setState({
      auth: {
        user: null,
        account: null,
        isAuthenticated: false,
        token: null,
      },
      cart: {
        items: [],
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        currency: 'ARS',
      },
      favorites: [],
      recentProducts: [],
      hasHydrated: false,
    });
  });

  it('syncs runtime currency into cart when cart is empty', () => {
    useStore.getState().syncRuntimeConfig();
    expect(useStore.getState().cart.currency).toBe('USD');
  });

  it('limits quantity according to runtime config', () => {
    const product = {
      id: 'prod-1',
      created_at: '',
      updated_at: '',
      sku: 'sku',
      name: 'SSD',
      unit_price: 100,
      currency: 'USD',
      tax_rate: 0.1,
      stock_quantity: 10,
    };

    useStore.getState().addToCart(product as any, 5);

    expect(useStore.getState().cart.items[0].quantity).toBe(3);
  });
});
