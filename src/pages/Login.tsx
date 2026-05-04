                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BRANDING, CONTACT } from '@/config/branding';
import { getUIConfig, getValidationConfig } from '@/config/runtime';
import { buildEmailSchema, buildPasswordSchema, formatTemplate } from '@/lib/validationMessages';
import { useStore } from '@/store/useStore';
import log from '@/lib/logger';
import { clearAuthSession } from '@/features/auth/session';
import { useLoginMutation } from '@/features/auth/mutations';

// Schema construido dinámicamente desde validation config (sin reglas de complejidad para login)
const loginSchema = z.object({
  email: buildEmailSchema(),
  password: buildPasswordSchema({ enforceComplexity: false }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uiConfig = getUIConfig();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, addNotification, logout } = useStore();
  const loginMutation = useLoginMutation();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionSuperseded, setSessionSuperseded] = useState(false);

    // Detectar parámetro de sesión expirada / reemplazada por otro login
    React.useEffect(() => {
      const params = new URLSearchParams(location.search);
      const reason = params.get('session');
      if (reason === 'superseded') {
        setSessionSuperseded(true);
      } else if (
        reason === 'invalid' ||
        reason === 'expired'
      ) {
        setSessionExpired(true);
      }
    }, [location.search]);

  // Obtener la URL de redirección después del login
  const locationState = location.state as any;
  const from = locationState?.from?.pathname || locationState?.from || '/';
  log.auth.debug('Login page - redirect destino:', from);

  // Función para limpiar sesión corrupta
  const handleClearSession = () => {
    try {
      logout();
      clearAuthSession();
      const v = getValidationConfig().messages;
      addNotification({
        type: 'success',
        title: v.sessionCleanedTitle,
        message: v.sessionCleanedMessage,
      });
      navigate('/login', { replace: true });
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

      const { user, token, account } = await loginMutation.mutateAsync(data);
      
      // Actualizar estado global
      login(user, token, account || undefined);

      // Mostrar notificación de éxito
      addNotification({
        type: 'success',
        title: uiConfig.loginSuccessTitle,
        message: formatTemplate(getValidationConfig().messages.loginGreeting, {
          name: user.person?.first_name || 'Usuario',
        }),
      });

      // Redirigir a la página anterior o al inicio
      log.auth.info('Login exitoso, redirigiendo a:', from);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : getValidationConfig().messages.loginGenericError;
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: uiConfig.loginErrorTitle,
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
          <CardTitle className="text-2xl">{uiConfig.loginTitle}</CardTitle>
          <CardDescription>
            {uiConfig.loginSubtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
            {sessionSuperseded && (
              <Alert variant="warning" className="mb-6">
                <AlertDescription>
                  Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo. Volvé a ingresar para continuar acá.
                </AlertDescription>
              </Alert>
            )}
            {sessionExpired && (
              <Alert variant="warning" className="mb-6">
                <AlertDescription>
                  {uiConfig.loginSessionExpiredMessage}
                </AlertDescription>
              </Alert>
            )}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{uiConfig.loginEmailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={uiConfig.loginEmailPlaceholder}
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{uiConfig.loginPasswordLabel}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={uiConfig.loginPasswordPlaceholder}
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

            <div className="flex items-center justify-end">
              <Link to="/registro" className="text-sm text-muted-foreground hover:text-foreground">
                {uiConfig.loginNoAccountLinkText} →
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uiConfig.loginLoadingLabel}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {uiConfig.loginSubmitLabel}
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
              asChild
            >
              <a
                href={`${CONTACT.WHATSAPP_LINK}?text=${encodeURIComponent(uiConfig.loginForgotPasswordMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {uiConfig.loginForgotPasswordLabel}
              </a>
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{uiConfig.loginNoAccountText} </span>
            <Link to="/registro" className="text-primary hover:underline">
              {uiConfig.loginNoAccountLinkText}
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
              {uiConfig.loginClearSessionLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
