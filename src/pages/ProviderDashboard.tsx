import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  Lock,
  Plus,
  Save,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BRANDING } from '@/config/branding';
import { getBusinessConfig, getCategoriesConfig, getUIConfig } from '@/config/runtime';
import { getBusinessPartnerId } from '@/features/auth/session';
import { isSupplierPartner, isSupplierUserRole } from '@/services/businessPartnerService';
import {
  buildProviderSku,
  providerProductService,
  type ProviderProductInput,
} from '@/services/providerProductService';
import type { Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const flattenCategoryOptions = (): Array<{ value: string; label: string }> => {
  const categories = getCategoriesConfig();
  const options: Array<{ value: string; label: string }> = [];

  const walk = (items: typeof categories, prefix = '') => {
    for (const item of items) {
      const label = prefix ? `${prefix} › ${item.name}` : item.name;
      options.push({ value: item.name, label });
      if (item.subcategories?.length) {
        walk(item.subcategories, item.name);
      }
    }
  };

  walk(categories);
  return options;
};

export const ProviderDashboard: React.FC = () => {
  const { auth, addNotification } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const uiCfg = getUIConfig();
  const businessCfg = getBusinessConfig();
  const categoryOptions = useMemo(() => flattenCategoryOptions(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supplierAccess, setSupplierAccess] = useState<boolean | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const showCreateForm =
    location.pathname === '/proveedor/servicios/nuevo'
    || searchParams.get('nuevo') === '1'
    || searchParams.get('nuevo') === 'true';

  const [form, setForm] = useState<ProviderProductInput>({
    name: '',
    description: '',
    unit_price: 0,
    category: categoryOptions[0]?.value || '',
    sku: '',
    status: 'active',
  });

  const businessPartnerId = getBusinessPartnerId();

  useEffect(() => {
    if (!auth.isAuthenticated || !businessPartnerId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const allowedByRole = isSupplierUserRole(auth.user?.role);
        const allowedByPartner = allowedByRole || (await isSupplierPartner(businessPartnerId));
        if (cancelled) return;
        setSupplierAccess(allowedByPartner);

        if (!allowed) {
          setProducts([]);
          return;
        }

        const mine = await providerProductService.listMine();
        if (!cancelled) {
          setProducts(mine);
        }
      } catch (error) {
        if (!cancelled) {
          addNotification({
            type: 'error',
            title: 'No pudimos cargar tus servicios',
            message: error instanceof Error ? error.message : 'Intentá de nuevo en unos minutos.',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [addNotification, auth.isAuthenticated, businessPartnerId]);

  useEffect(() => {
    if (showCreateForm && !form.sku && form.name.trim()) {
      setForm((current) => ({
        ...current,
        sku: buildProviderSku(current.name),
      }));
    }
  }, [form.name, form.sku, showCreateForm]);

  const formatPrice = (price: number, currency?: string) =>
    new Intl.NumberFormat(businessCfg.locale, {
      style: 'currency',
      currency: currency || businessCfg.defaultCurrency,
      minimumFractionDigits: 0,
    }).format(price);

  const openCreateForm = () => {
    navigate('/proveedor/servicios/nuevo');
    setFormError(null);
    setForm({
      name: '',
      description: '',
      unit_price: 0,
      category: categoryOptions[0]?.value || '',
      sku: buildProviderSku('servicio'),
      status: 'active',
    });
  };

  const closeCreateForm = () => {
    navigate('/proveedor');
    setFormError(null);
  };

  const handleCreateService = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessPartnerId) return;

    if (!form.name.trim()) {
      setFormError('Ingresá un nombre para el servicio.');
      return;
    }
    if (!form.unit_price || form.unit_price <= 0) {
      setFormError('El precio tiene que ser mayor a cero.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      const created = await providerProductService.create(
        {
          ...form,
          sku: form.sku || buildProviderSku(form.name),
        },
        businessPartnerId,
      );
      setProducts((current) => [created, ...current]);
      addNotification({
        type: 'success',
        title: 'Servicio publicado',
        message: `"${created.name}" ya está visible en el marketplace.`,
      });
      closeCreateForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el servicio.';
      setFormError(message);
      addNotification({
        type: 'error',
        title: 'Error al crear servicio',
        message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const currentStatus = product.is_active === false || product.metadata?.status === 'inactive'
      ? 'inactive'
      : 'active';
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      setStatusUpdatingId(product.id);
      const updated = await providerProductService.update(product.id, { status: nextStatus });
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, ...updated } : item)),
      );
      addNotification({
        type: 'success',
        title: nextStatus === 'active' ? 'Servicio activado' : 'Servicio pausado',
        message: `"${product.name}" quedó ${nextStatus === 'active' ? 'activo' : 'inactivo'}.`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'No se pudo actualizar el estado',
        message: error instanceof Error ? error.message : 'Intentá de nuevo.',
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">{uiCfg.authRequiredTitle}</h2>
          <p className="text-gray-600 mb-6">Tenés que iniciar sesión para administrar tus servicios.</p>
          <Link
            to="/login"
            state={{ from: '/proveedor' }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {uiCfg.authLoginButtonLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (!businessPartnerId) {
    navigate('/login', { replace: true, state: { from: '/proveedor' } });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (supplierAccess === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Panel de proveedores
              </CardTitle>
              <CardDescription>
                Tu cuenta está registrada como cliente. Para publicar servicios necesitás una cuenta de proveedor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Registrate como proveedor y vas a poder cargar tus servicios, definir precios y recibir reseñas de quienes te contraten.
              </p>
              <Button asChild>
                <Link to="/registro-proveedor">Registrarme como proveedor</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis servicios</h1>
            <p className="text-muted-foreground mt-1">
              Administrá lo que ofrecés en el marketplace de {BRANDING.APP_NAME}.
            </p>
          </div>
          {!showCreateForm && (
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo servicio
            </Button>
          )}
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nuevo servicio</CardTitle>
              <CardDescription>Completá los datos básicos. Podés pausarlo o editarlo después.</CardDescription>
            </CardHeader>
            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleCreateService} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="service-name">Nombre del servicio</Label>
                    <Input
                      id="service-name"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Ej: Instalación de termotanque"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="service-description">Descripción</Label>
                    <Textarea
                      id="service-description"
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Contá qué incluye, tiempos estimados y zona de cobertura."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Precio referencial</Label>
                    <Input
                      id="service-price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.unit_price || ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          unit_price: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-category">Rubro</Label>
                    <select
                      id="service-category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.category || ''}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, category: event.target.value }))
                      }
                    >
                      {categoryOptions.length === 0 ? (
                        <option value="">Sin categorías configuradas</option>
                      ) : (
                        categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="service-sku">SKU</Label>
                    <Input
                      id="service-sku"
                      value={form.sku || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Publicar servicio
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeCreateForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Todavía no publicaste servicios</h2>
              <p className="text-muted-foreground mb-6">
                Creá tu primer servicio y empezá a aparecer en el catálogo.
              </p>
              <Button onClick={openCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo servicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const isActive = product.is_active !== false && product.metadata?.status !== 'inactive';
              return (
                <Card key={product.id}>
                  <CardContent className="py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      {product.category && (
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {product.description || 'Sin descripción'}
                      </p>
                      <p className="text-sm font-medium">{formatPrice(product.unit_price, product.currency)}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <Link to={`/productos/${product.id}`}>Ver ficha</Link>
                      </Button>
                      <Button
                        variant={isActive ? 'secondary' : 'default'}
                        disabled={statusUpdatingId === product.id}
                        onClick={() => handleToggleStatus(product)}
                      >
                        {statusUpdatingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isActive ? (
                          'Pausar'
                        ) : (
                          'Activar'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
