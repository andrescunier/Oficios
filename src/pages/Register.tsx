/**
 * Página de registro de usuario
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BRANDING, ASSETS } from '@/config/branding';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/store/useStore';
import { getBusinessConfig } from '@/config/runtime';
import { useRegisterMutation } from '@/features/auth/mutations';

// Schema de validación actualizado para el nuevo API
const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  company_name: z
    .string()
    .min(1, 'El nombre de empresa es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/\d/, 'Debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  title: z.string().min(1, 'El cargo es requerido'),
  tax_id: z.string().min(1, 'El CUIT/RUT es requerido'),
  currency: z.string().min(1, 'La moneda es requerida'),
  industry: z.string().min(1, 'La industria es requerida'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { login, addNotification } = useStore();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
      currency: getBusinessConfig().defaultCurrency,
      first_name: '',
      last_name: '',
      email: '',
      company_name: '',
      password: '',
      confirmPassword: '',
      phone: '',
      title: '',
      tax_id: '',
      industry: '',
      username: '',
    },
  });

  const password = watch('password');

  // Validaciones de contraseña en tiempo real
  const passwordValidations = [
    { label: 'Al menos 8 caracteres', valid: password?.length >= 8 },
    { label: 'Una mayúscula', valid: /[A-Z]/.test(password || '') },
    { label: 'Una minúscula', valid: /[a-z]/.test(password || '') },
    { label: 'Un número', valid: /\d/.test(password || '') },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user, token, account } = await registerMutation.mutateAsync({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        companyName: data.company_name,
        taxId: data.tax_id,
        title: data.title,
        industry: data.industry,
        username: data.username,
        currency: data.currency,
      });
      
      // Actualizar estado global
      login(user, token, account || undefined);

      // Mostrar notificación de éxito
      addNotification({
        type: 'success',
        title: '¡Registro completado!',
        message: `Usuario registrado correctamente.`,
      });

      // Redirigir a página de éxito con los datos del registro
      navigate('/registro-exitoso', { 
        replace: true, 
        state: { 
          user: {
            email: user.email,
            username: user.username
          }
        } 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cuenta';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error de registro',
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
                // Fallback si no existe la imagen
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl">Crear Cuenta B2B</CardTitle>
          <CardDescription>
            Únete a {BRANDING.APP_NAME} y accede a precios especiales para empresas
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="first_name"
                  placeholder="Juan"
                  {...register('first_name')}
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  placeholder="Pérez"
                  {...register('last_name')}
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+54 11 1234-5678"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Cargo / Puesto *</Label>
              <Input
                id="title"
                placeholder="Gerente General"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de Empresa *</Label>
              <Input
                id="company_name"
                placeholder="Mi Empresa S.A."
                {...register('company_name')}
                className={errors.company_name ? 'border-destructive' : ''}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">CUIT / RUT *</Label>
              <Input
                id="tax_id"
                placeholder="12345678-9"
                {...register('tax_id')}
                className={errors.tax_id ? 'border-destructive' : ''}
              />
              {errors.tax_id && (
                <p className="text-sm text-destructive">{errors.tax_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industria *</Label>
              <Input
                id="industry"
                placeholder="Tecnología"
                {...register('industry')}
                className={errors.industry ? 'border-destructive' : ''}
              />
              {errors.industry && (
                <p className="text-sm text-destructive">{errors.industry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario *</Label>
              <Input
                id="username"
                placeholder="jperez"
                {...register('username')}
                className={errors.username ? 'border-destructive' : ''}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              
              {/* Indicadores de validación de contraseña */}
              {password && (
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
              
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu contraseña"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

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
                Acepto los{' '}
                <Link to="/terminos" className="text-primary hover:underline">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" className="text-primary hover:underline">
                  política de privacidad
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Cuenta
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
