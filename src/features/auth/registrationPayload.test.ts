import { buildRegisterDataFromForm } from './registrationPayload';
import type { RegistrationFieldConfig } from '@/config/runtime';

describe('buildRegisterDataFromForm', () => {
  it('fills backend-required fields when they are not part of the visible form', () => {
    const fields: RegistrationFieldConfig[] = [
      { name: 'email', visible: true, required: true },
      { name: 'password', visible: true, required: true, type: 'password' },
    ];

    expect(buildRegisterDataFromForm({
      email: 'ana@example.com',
      password: 'Secret123',
    }, fields, 'ARS')).toMatchObject({
      firstName: 'Cliente',
      lastName: 'Ecommerce',
      companyName: 'Cliente Ecommerce',
      email: 'ana@example.com',
      password: 'Secret123',
      currency: 'ARS',
    });
  });

  it('uses valid fallback values for configured hidden fields', () => {
    const fields: RegistrationFieldConfig[] = [
      { name: 'email', visible: true, required: true },
      { name: 'password', visible: true, required: true, type: 'password' },
      { name: 'first_name', visible: false, required: true },
      { name: 'last_name', visible: false, required: true },
      { name: 'company_name', visible: false, required: true },
      { name: 'phone', visible: false },
      { name: 'tax_id', visible: false },
      { name: 'title', visible: false },
      { name: 'industry', visible: false },
      { name: 'username', visible: false },
    ];

    expect(buildRegisterDataFromForm({
      email: 'ventas@example.com',
      password: 'Secret123',
    }, fields, 'USD')).toEqual({
      firstName: 'Cliente',
      lastName: 'Ecommerce',
      email: 'ventas@example.com',
      password: 'Secret123',
      phone: '0',
      companyName: 'Cliente Ecommerce',
      taxId: '0',
      title: 'Cliente',
      industry: 'General',
      username: 'ventas',
      currency: 'USD',
    });
  });

  it('keeps values typed by the customer over fallbacks', () => {
    const fields: RegistrationFieldConfig[] = [
      { name: 'email', visible: true, required: true },
      { name: 'password', visible: true, required: true, type: 'password' },
      { name: 'first_name', visible: true, required: true },
      { name: 'last_name', visible: true, required: true },
      { name: 'company_name', visible: true, required: true },
    ];

    expect(buildRegisterDataFromForm({
      first_name: '  Ana  ',
      last_name: ' Gomez ',
      company_name: '  Ana SRL ',
      email: 'ana@example.com',
      password: 'Secret123',
      currency: 'EUR',
    }, fields, 'ARS')).toMatchObject({
      firstName: 'Ana',
      lastName: 'Gomez',
      companyName: 'Ana SRL',
      currency: 'EUR',
    });
  });
});
