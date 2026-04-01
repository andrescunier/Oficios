import {
  buildRegistrationDraftFromUser,
  clearAuthSession,
  extractCustomerIdFromPersistedSession,
  getPersistedRegistrationDraft,
  saveBusinessPartnerId,
  saveRegistrationDraft,
} from './session';

describe('auth session', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.__APP_CONFIG__ = {
      api: {
        url: 'http://127.0.0.1:8000',
        accountId: 'tenant-1',
        accountSlug: 'tenant',
        channel: 'ecommerce',
      },
    };
  });

  it('persists and reads registration draft', () => {
    saveRegistrationDraft({ first_name: 'Ana', city: 'Buenos Aires' });
    expect(getPersistedRegistrationDraft()).toMatchObject({ first_name: 'Ana', city: 'Buenos Aires' });
  });

  it('extracts customer id from persisted sources', () => {
    saveBusinessPartnerId('bp-1');
    expect(extractCustomerIdFromPersistedSession()).toBe('bp-1');
  });

  it('clears auth session keys', () => {
    saveBusinessPartnerId('bp-1');
    clearAuthSession();
    expect(localStorage.getItem('business_partner_id')).toBeNull();
  });

  it('preserves cart snapshot when invalidating session with preserveCart', () => {
    localStorage.setItem('diapstore-store', JSON.stringify({
      state: {
        auth: {
          user: { id: 'user-1' },
          isAuthenticated: true,
          token: 'token-1234567890',
        },
        cart: {
          items: [{ line_id: '1', quantity: 2 }],
          subtotal: 10,
          tax_amount: 2,
          total_amount: 12,
          currency: 'ARS',
        },
        ui: {
          theme: 'dark',
        },
        recentProducts: ['prod-1'],
      },
      version: 0,
    }));

    clearAuthSession({ preserveCart: true });

    const persisted = JSON.parse(localStorage.getItem('diapstore-store') || '{}');
    expect(persisted.state.auth).toMatchObject({
      user: null,
      isAuthenticated: false,
      token: null,
    });
    expect(persisted.state.cart.items).toHaveLength(1);
    expect(persisted.state.ui.theme).toBe('dark');
  });

  it('builds draft from user data', () => {
    expect(buildRegistrationDraftFromUser({
      id: '1',
      created_at: '',
      updated_at: '',
      person_id: 'p1',
      email: 'ana@example.com',
      username: 'ana',
      role: 'customer',
      status: 'active',
      person: {
        id: 'p1',
        created_at: '',
        updated_at: '',
        email: 'ana@example.com',
        first_name: 'Ana',
        last_name: 'Lopez',
        phone: '123',
      },
    })).toMatchObject({ first_name: 'Ana', phone: '123' });
  });
});
