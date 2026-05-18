import { buildCheckoutPayload, buildInitialShippingInfo, getDefaultPaymentMethod, validateShippingInfo } from './model';
import type { CartItem } from '@/types/api';

describe('checkout model', () => {
  beforeEach(() => {
    window.__APP_CONFIG__ = {
      app: {
        requireAuthForCart: true,
      },
      business: {
        defaultCurrency: 'ARS',
        defaultTaxRate: 0.21,
        defaultCountry: 'Argentina',
        locale: 'es-AR',
      },
      paymentMethods: {
        transferencia: true,
        efectivo: false,
        mercadopago: false,
        tarjeta: false,
      },
    };
  });

  it('builds initial shipping info from auth and draft', () => {
    const shipping = buildInitialShippingInfo({
      authUser: {
        email: 'test@example.com',
        person: { first_name: 'Ana', last_name: 'Lopez', phone: '123' },
      },
      registrationDraft: {
        address: 'Street 123',
        city: 'Buenos Aires',
      },
    });

    expect(shipping.firstName).toBe('Ana');
    expect(shipping.address).toBe('Street 123');
  });

  it('validates required shipping info', () => {
    expect(validateShippingInfo({
      firstName: '',
      lastName: 'Lopez',
      email: 'test@example.com',
      phone: '123',
      address: 'Street 123',
      city: 'Buenos Aires',
      state: '',
      zipCode: '1000',
      country: 'Argentina',
    })).toMatchObject({ valid: false, missingField: 'firstName' });
  });

  it('builds checkout payload from cart items', () => {
    const items = [{
      line_id: '1',
      quantity: 2,
      unit_price: 100,
      product: {
        id: 'prod-1',
        created_at: '',
        updated_at: '',
        sku: 'sku',
        name: 'SSD',
        unit_price: 100,
        currency: 'ARS',
        tax_rate: 0.21,
      },
      selected_options: {},
    }] as CartItem[];

    const payload = buildCheckoutPayload({
      shippingInfo: {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
        phone: '123',
        address: 'Street 123',
        city: 'Buenos Aires',
        state: 'BA',
        zipCode: '1000',
        country: 'Argentina',
      },
      items,
      currency: 'ARS',
      totalAmount: 242,
      paymentMethod: getDefaultPaymentMethod(),
    });

    expect(payload.items[0].product_id).toBe('prod-1');
    expect(payload.items[0]).not.toHaveProperty('sku');
    expect(payload.lineItemsMetadata[0]).toMatchObject({
      product_id: 'prod-1',
      product_sku: 'sku',
      kind: 'product',
    });
    expect(payload.totalAmount).toBe(242);
  });
});
