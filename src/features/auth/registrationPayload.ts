import type { RegistrationFieldConfig } from '@/config/runtime';
import type { RegisterData } from '@/services/authService';

export type RegisterFormData = Record<string, string | boolean | undefined>;

const HIDDEN_FIELD_FALLBACKS: Record<string, string> = {
  first_name: 'Cliente',
  last_name: 'Ecommerce',
  company_name: 'Cliente Ecommerce',
  phone: '0',
  tax_id: '0',
  title: 'Cliente',
  industry: 'General',
  username: 'cliente',
};


const BACKEND_REQUIRED_FIELDS = new Set(['first_name', 'last_name', 'company_name']);

const readText = (data: RegisterFormData, name: string): string => {
  const value = data[name];
  return typeof value === 'string' ? value.trim() : '';
};

const isHiddenField = (fieldsByName: Map<string, RegistrationFieldConfig>, name: string): boolean => {
  return fieldsByName.get(name)?.visible === false;
};

const readTextWithFallback = (
  data: RegisterFormData,
  fieldsByName: Map<string, RegistrationFieldConfig>,
  name: string,
  fallback: string,
): string => {
  const value = readText(data, name);
  if (value) return value;

  if (BACKEND_REQUIRED_FIELDS.has(name) || isHiddenField(fieldsByName, name)) {
    return fallback;
  }

  return '';
};

export const buildRegisterDataFromForm = (
  data: RegisterFormData,
  fields: RegistrationFieldConfig[],
  defaultCurrency: string,
): RegisterData => {
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));
  const firstName = readTextWithFallback(data, fieldsByName, 'first_name', HIDDEN_FIELD_FALLBACKS.first_name);
  const lastName = readTextWithFallback(data, fieldsByName, 'last_name', HIDDEN_FIELD_FALLBACKS.last_name);
  const companyName = readTextWithFallback(
    data,
    fieldsByName,
    'company_name',
    `${firstName} ${lastName}`.trim() || HIDDEN_FIELD_FALLBACKS.company_name,
  );
  const email = readText(data, 'email');

  return {
    firstName,
    lastName,
    email,
    password: readText(data, 'password'),
    phone: readTextWithFallback(data, fieldsByName, 'phone', HIDDEN_FIELD_FALLBACKS.phone),
    companyName,
    taxId: readTextWithFallback(data, fieldsByName, 'tax_id', HIDDEN_FIELD_FALLBACKS.tax_id),
    title: readTextWithFallback(data, fieldsByName, 'title', HIDDEN_FIELD_FALLBACKS.title),
    industry: readTextWithFallback(data, fieldsByName, 'industry', HIDDEN_FIELD_FALLBACKS.industry),
    username: readTextWithFallback(
      data,
      fieldsByName,
      'username',
      email.split('@')[0] || HIDDEN_FIELD_FALLBACKS.username,
    ),
    currency: readTextWithFallback(data, fieldsByName, 'currency', defaultCurrency) || defaultCurrency,
  };
};