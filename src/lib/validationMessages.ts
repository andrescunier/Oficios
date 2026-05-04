/**
 * Builds Zod validators using rules + messages from ecommerce-config.
 */
import { z } from 'zod';
import { getValidationConfig } from '@/config/runtime';

function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export function buildEmailSchema() {
  const v = getValidationConfig();
  let schema = z.string().min(1, v.messages.emailRequired);
  if (v.emailRegex) {
    try {
      const re = new RegExp(v.emailRegex);
      schema = schema.refine((val) => re.test(val), { message: v.messages.emailInvalid }) as any;
    } catch {
      schema = schema.email(v.messages.emailInvalid) as any;
    }
  } else {
    schema = schema.email(v.messages.emailInvalid) as any;
  }
  return schema;
}

export function buildPasswordSchema(opts: { enforceComplexity?: boolean } = {}) {
  const v = getValidationConfig();
  const enforce = opts.enforceComplexity !== false;
  let schema: z.ZodType<string> = z
    .string()
    .min(1, v.messages.passwordRequired)
    .min(v.passwordMinLength, format(v.messages.passwordMinLength, { min: v.passwordMinLength }));

  if (enforce) {
    if (v.passwordRequireUppercase) {
      schema = schema.refine((val) => /[A-Z]/.test(val), { message: v.messages.passwordUppercase });
    }
    if (v.passwordRequireLowercase) {
      schema = schema.refine((val) => /[a-z]/.test(val), { message: v.messages.passwordLowercase });
    }
    if (v.passwordRequireNumber) {
      schema = schema.refine((val) => /\d/.test(val), { message: v.messages.passwordNumber });
    }
    if (v.passwordRequireSymbol) {
      schema = schema.refine((val) => /[^A-Za-z0-9]/.test(val), { message: v.messages.passwordSymbol });
    }
  }
  return schema;
}

export function fieldRequiredMessage(label: string): string {
  const v = getValidationConfig();
  return format(v.messages.fieldRequired, { field: label });
}

export function checkoutFieldRequiredMessage(label: string): string {
  const v = getValidationConfig();
  return format(v.messages.checkoutFieldRequiredTemplate, { field: label });
}

export function getValidationMessages() {
  return getValidationConfig().messages;
}

export { format as formatTemplate };
