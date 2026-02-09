                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    /**
 * Página de inicio de sesión
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/authService';
import log from '@/lib/logger';

// Schema de validación
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, addNotification, logout } = useStore();

  // Obtener la URL de redirección después del login
  const locationState = location.state as any;
  const from = locationState?.from?.pathname || locationState?.from || '/';
  log.auth.debug('Login page - redirect destino:', from);

  // Función para limpiar sesión corrupta
  const handleClearSession = () => {
    try {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      addNotification({
        type: 'success',
        title: 'Sesión limpiada',
        message: 'Todos los datos han sido eliminados correctamente',
      });
      // Recargar la página para asegurar estado limpio
      window.location.reload();
    } catch (error) {
      log.auth.error('Error al limpiar sesión:', error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      log.auth.info('Enviando login para:', data.email);

      const { user, token, account } = await authService.login(data);
      
      // Actualizar estado global
      login(user, token, account || undefined);

      // Mostrar notificación de éxito
      addNotification({
        type: 'success',
        title: 'Bienvenido',
        message: `Hola ${user.person?.first_name || 'Usuario'}!`,
      });

      // Redirigir a la página anterior o al inicio
      log.auth.info('Login exitoso, redirigiendo a:', from);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error de autenticación',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta de DIAP Store
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <a
                href="https://wa.me/5491126310884?text=Hola%2C%20necesito%20recuperar%20mi%20contrase%C3%B1a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link to="/registro" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>

          {/* Botón para limpiar sesión corrupta */}
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSession}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ¿Problemas con la sesión? Limpiar datos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
