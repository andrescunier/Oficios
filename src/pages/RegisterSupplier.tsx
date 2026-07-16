import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodType } from 'zod';
import { getRegistrationConfig, getUIConfig, getValidationConfig } from '@/config/runtime';
import type { RegistrationFieldConfig } from '@/config/runtime';
import {
  buildEmailSchema,
  buildPasswordSchema,
  fieldRequiredMessage,
} from '@/lib/validationMessages';
import { Eye, EyeOff, Briefcase, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BRANDING, ASSETS } from '@/config/branding';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/store/useStore';
import { getBusinessConfig } from '@/config/runtime';
import { useRegisterSupplierMutation } from '@/features/auth/mutations';
import { buildRegisterDataFromForm, type RegisterFormData } from '@/features/auth/registrationPayload';

const SUPPLIER_COMPANY_LABEL = 'Nombre comercial / oficio';

export const RegisterSupplier: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login, addNotification } = useStore();
  const registerMutation = useRegisterSupplierMutation();
  const registrationConfig = getRegistrationConfig();
  const uiConfig = getUIConfig();
  const validationCfg = getValidationConfig();

  const buildSchema = (): ZodType<RegisterFormData> => {
    const shape: Record<string, z.ZodTypeAny> = {};
    const fields = registrationConfig.fields || [];

    for (const f of fields) {
      if (!f.visible) continue;

      switch (f.name) {
        case 'email':
          shape.email = buildEmailSchema();
          break;
        case 'password':
          shape.password = buildPasswordSchema({ enforceComplexity: true });
          break;
        case 'confirmPassword':
          shape.confirmPassword = z.string().optional();
          break;
        default:
          shape[f.name] = f.required
            ? z.string().min(1, fieldRequiredMessage(f.label || f.name))
            : z.string().optional();
      }
    }

    if (!shape.email) shape.email = buildEmailSchema();
    if (!shape.password) shape.password = buildPasswordSchema({ enforceComplexity: true });

    shape.acceptTerms = z
      .boolean()
      .refine((val) => val === true, { message: validationCfg.messages.acceptTermsRequired });

    const schema = z.object(shape);

    return schema.refine((data) => {
      const pw = typeof data.password === 'string' ? data.password : '';
      const cpw = typeof data.confirmPassword === 'string' ? data.confirmPassword : '';
      if (pw && cpw) return pw === cpw;
      return true;
    }, {
      message: validationCfg.messages.passwordsDontMatch,
      path: ['confirmPassword'],
    }) as ZodType<RegisterFormData>;
  };

  const registerSchema = buildSchema();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: Object.fromEntries([
      ['acceptTerms', false],
      ['currency', getBusinessConfig().defaultCurrency],
      ...registrationConfig.fields.map((f: RegistrationFieldConfig) => [f.name, '']),
    ]),
  });

  const watchedPassword = watch('password');
  const password = typeof watchedPassword === 'string' ? watchedPassword : '';

  const passwordValidations = [
    { label: uiConfig.passwordValidationLength, valid: password?.length >= validationCfg.passwordMinLength, enabled: true },
    { label: uiConfig.passwordValidationUppercase, valid: /[A-Z]/.test(password || ''), enabled: validationCfg.passwordRequireUppercase },
    { label: uiConfig.passwordValidationLowercase, valid: /[a-z]/.test(password || ''), enabled: validationCfg.passwordRequireLowercase },
    { label: uiConfig.passwordValidationNumber, valid: /\d/.test(password || ''), enabled: validationCfg.passwordRequireNumber },
  ].filter((v) => v.enabled);

  const resolveFieldLabel = (field: RegistrationFieldConfig) => {
    if (field.name === 'company_name') {
      return SUPPLIER_COMPANY_LABEL;
    }
    return field.label || field.name;
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user, token, account } = await registerMutation.mutateAsync(
        buildRegisterDataFromForm(data, registrationConfig.fields, getBusinessConfig().defaultCurrency),
      );

      login(user, token, account || undefined);

      addNotification({
        type: 'success',
        title: '¡Listo!',
        message: 'Tu cuenta de proveedor quedó creada. Ya podés publicar tus servicios.',
      });

      navigate('/proveedor', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : validationCfg.messages.registerGenericError;
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: uiConfig.registerErrorTitle,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={ASSETS.LOGO_PATH}
              alt={BRANDING.APP_NAME}
              className="h-12 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl">Registro de proveedores</CardTitle>
          <CardDescription>
            Sumate al marketplace y publicá tus servicios para que te encuentren.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(registrationConfig.fields || [])
              .filter((f: RegistrationFieldConfig) => f.visible !== false)
              .map((field: RegistrationFieldConfig) => {
                const isPasswordType = field.type === 'password';
                const isPasswordField = field.name === 'password';
                const fieldError = errors[field.name];
                const fieldErrorMessage = typeof fieldError?.message === 'string' ? fieldError.message : undefined;
                return (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{resolveFieldLabel(field)}</Label>
                    <div className={isPasswordType ? 'relative' : ''}>
                      <Input
                        id={field.name}
                        type={isPasswordType ? (passwordVisible[field.name] ? 'text' : 'password') : (field.type || 'text')}
                        placeholder={field.name === 'company_name' ? 'Ej: Plomería García' : (field.placeholder || '')}
                        {...register(field.name)}
                        className={fieldError ? (isPasswordType ? 'border-destructive pr-10' : 'border-destructive') : (isPasswordType ? 'pr-10' : '')}
                      />
                      {isPasswordType && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setPasswordVisible(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
                        >
                          {passwordVisible[field.name] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                    {isPasswordField && password && (
                      <div className="space-y-1 mt-2">
                        {passwordValidations.map((validation, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            {validation.valid ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={validation.valid ? 'text-green-600' : 'text-muted-foreground'}>
                              {validation.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {fieldErrorMessage && (
                      <p className="text-sm text-destructive">{fieldErrorMessage}</p>
                    )}
                  </div>
                );
              })}

            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={(checked: unknown) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                {registrationConfig.acceptTermsLabel}
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">
                {typeof errors.acceptTerms.message === 'string' ? errors.acceptTerms.message : ''}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uiConfig.registerLoadingLabel}
                </>
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Crear cuenta de proveedor
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">¿Ya tenés cuenta? </span>
              <Link to="/login" className="text-primary hover:underline">
                Iniciá sesión
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">¿Buscás contratar servicios? </span>
              <Link to="/registro" className="text-primary hover:underline">
                Registrate como cliente
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
