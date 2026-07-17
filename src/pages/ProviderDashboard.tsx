import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BRANDING } from '@/config/branding';
import { getBusinessConfig, getCategoriesConfig, getFiltersConfig, getUIConfig } from '@/config/runtime';
import { getBusinessPartnerId } from '@/features/auth/session';
import { isSupplierPartner, isSupplierUserRole } from '@/services/businessPartnerService';
import {
  buildProviderSku,
  providerProductService,
  type ProviderProductInput,
} from '@/services/providerProductService';
import {
  getServiceReservation,
  providerOrderService,
  type ProviderCobro,
  type ProviderOrder,
} from '@/services/providerOrderService';
import {
  getServiceListing,
  PRICING_MODE_OPTIONS,
  TRADE_RANK_OPTIONS,
  type PricingMode,
  type TradeRank,
} from '@/utils/serviceListing';
import { taskService, type ProviderTask } from '@/services/taskService';
import type { Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type TabId = 'servicios' | 'reservas' | 'capacitaciones' | 'cobros' | 'plataforma';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'servicios', label: 'Servicios', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'reservas', label: 'Reservas', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'capacitaciones', label: 'Capacitaciones', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'cobros', label: 'Cobros', icon: <Wallet className="h-4 w-4" /> },
  { id: 'plataforma', label: 'Plataforma', icon: <ShieldCheck className="h-4 w-4" /> },
];

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

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: 'Borrador',
    submitted: 'Reservada',
    pending_payment: 'Pago pendiente',
    payment_review: 'En revisión de pago',
    confirmed: 'Confirmada',
    preparing: 'En preparación',
    ready_to_ship: 'Lista',
    shipped: 'En camino',
    delivered: 'Entregada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    open: 'Pendiente',
    in_progress: 'En curso',
    done: 'Hecha',
    paid: 'Pagado',
    partially_paid: 'Pago parcial',
    validated: 'Pago validado',
    pending_backend_validation: 'A validar',
    pending_accept: 'Espera tu aceptación',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    held_until_quality_ok: 'Retenido hasta OK de calidad',
    ready_to_charge: 'Listo para cobrar',
  };
  return map[status] || status;
};

export const ProviderDashboard: React.FC = () => {
  const { auth, addNotification } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const uiCfg = getUIConfig();
  const businessCfg = getBusinessConfig();
  const categoryOptions = useMemo(() => flattenCategoryOptions(), []);
  const barrioOptions = getFiltersConfig().barrioOptions || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [tasks, setTasks] = useState<ProviderTask[]>([]);
  const [cobros, setCobros] = useState<ProviderCobro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supplierAccess, setSupplierAccess] = useState<boolean | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [taskUpdatingId, setTaskUpdatingId] = useState<string | null>(null);
  const [respondingOrderId, setRespondingOrderId] = useState<string | null>(null);
  const [reservaStatusFilter, setReservaStatusFilter] = useState<string>('all');
  const [reservaBarrioFilter, setReservaBarrioFilter] = useState<string>('');

  const tabParam = searchParams.get('tab') as TabId | null;
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : 'servicios';

  const showCreateForm =
    location.pathname === '/proveedor/servicios/nuevo'
    || searchParams.get('nuevo') === '1'
    || searchParams.get('nuevo') === 'true';

  const [form, setForm] = useState<ProviderProductInput>({
    name: '',
    description: '',
    unit_price: 0,
    category: categoryOptions[0]?.value || '',
    zone: barrioOptions[0]?.value || '',
    tradeRank: 'particular',
    pricingMode: 'fixed',
    personName: '',
    imageUrl: '',
    sku: '',
    status: 'active',
  });

  const businessPartnerId = getBusinessPartnerId();

  const setTab = (tab: TabId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    next.delete('nuevo');
    setSearchParams(next, { replace: true });
    if (location.pathname !== '/proveedor') {
      navigate(`/proveedor?tab=${tab}`, { replace: true });
    }
  };

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

        if (!allowedByPartner) {
          setProducts([]);
          setOrders([]);
          setTasks([]);
          setCobros([]);
          return;
        }

        const [mine, orderList, taskList] = await Promise.all([
          providerProductService.listMine(),
          providerOrderService.listMine().catch(() => [] as ProviderOrder[]),
          taskService.listMine({ project: 'capacitacion' }).catch(() => [] as ProviderTask[]),
        ]);
        if (cancelled) return;
        setProducts(mine);
        setOrders(orderList);
        setTasks(taskList);
        const cobroList = await providerOrderService.listCobros(orderList).catch(() => [] as ProviderCobro[]);
        if (!cancelled) setCobros(cobroList);
      } catch (error) {
        if (!cancelled) {
          addNotification({
            type: 'error',
            title: 'No pudimos cargar tu panel',
            message: error instanceof Error ? error.message : 'Intentá de nuevo en unos minutos.',
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [addNotification, auth.isAuthenticated, auth.user?.role, businessPartnerId]);

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

  const formatDate = (value?: string | null) => {
    if (!value) return 'A coordinar';
    try {
      return new Intl.DateTimeFormat(businessCfg.locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const openCreateForm = () => {
    navigate('/proveedor/servicios/nuevo');
    setFormError(null);
    setForm({
      name: '',
      description: '',
      unit_price: 0,
      category: categoryOptions[0]?.value || '',
      zone: barrioOptions[0]?.value || '',
      tradeRank: 'particular',
      pricingMode: 'fixed',
      personName: '',
      imageUrl: '',
      sku: buildProviderSku('servicio'),
      status: 'active',
    });
  };

  const closeCreateForm = () => {
    navigate('/proveedor?tab=servicios');
    setFormError(null);
  };

  const handleCreateService = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessPartnerId) return;

    if (!form.name.trim()) {
      setFormError('Ingresá un nombre para el servicio.');
      return;
    }
    if ((form.pricingMode || 'fixed') === 'fixed' && (!form.unit_price || form.unit_price <= 0)) {
      setFormError('Con precio fijo, el monto tiene que ser mayor a cero. Si no sabés el valor, elegí “A convenir”.');
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

  const handleTaskDone = async (task: ProviderTask) => {
    try {
      setTaskUpdatingId(task.id);
      const updated = await taskService.updateStatus(task.id, 'done');
      setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));
      addNotification({
        type: 'success',
        title: 'Capacitación marcada',
        message: `"${task.title}" quedó como hecha.`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'No se pudo actualizar la capacitación',
        message: error instanceof Error ? error.message : 'Intentá de nuevo.',
      });
    } finally {
      setTaskUpdatingId(null);
    }
  };

  const handleRespondReservation = async (order: ProviderOrder, action: 'accept' | 'reject') => {
    try {
      setRespondingOrderId(order.id);
      const updated = await providerOrderService.respond(
        order.id,
        action,
        action === 'reject' ? 'No puedo tomar esta reserva' : undefined,
      );
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, ...updated } : item)));
      const cobroList = await providerOrderService.listCobros(
        orders.map((item) => (item.id === order.id ? { ...item, ...updated } : item)),
      ).catch(() => cobros);
      setCobros(cobroList);
      addNotification({
        type: 'success',
        title: action === 'accept' ? 'Reserva aceptada' : 'Reserva rechazada',
        message: action === 'accept'
          ? 'Coordiná el trabajo por OficiosHub. El cobro se libera con el OK de calidad del cliente.'
          : 'El cliente podrá ver que no tomaste esta reserva.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'No se pudo responder la reserva',
        message: error instanceof Error ? error.message : 'Intentá de nuevo.',
      });
    } finally {
      setRespondingOrderId(null);
    }
  };

  const filteredReservas = useMemo(() => {
    return orders.filter((order) => {
      const reservation = getServiceReservation(order);
      const matchesStatus =
        reservaStatusFilter === 'all'
        || reservation.providerStatus === reservaStatusFilter;
      const matchesBarrio =
        !reservaBarrioFilter
        || (reservation.barrio || '').toLowerCase().includes(reservaBarrioFilter.toLowerCase());
      return matchesStatus && matchesBarrio;
    });
  }, [orders, reservaStatusFilter, reservaBarrioFilter]);

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">{uiCfg.authRequiredTitle}</h2>
          <p className="text-gray-600 mb-6">Tenés que iniciar sesión para ver tu panel de oficio.</p>
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
                Tu oficio en OficiosHub
              </CardTitle>
              <CardDescription>
                Esta cuenta es de cliente. Para publicar lo que sabés hacer necesitás registrarte como persona con oficio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Sumate como particular: cargá un servicio, recibí reservas como órdenes de venta, capacitaciones como tareas y el seguimiento de cobros.
              </p>
              <Button asChild>
                <Link to="/registro-proveedor">Ofrecer mi oficio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const cobrosTotal = cobros.reduce((acc, item) => acc + (item.paidAmount || 0), 0);

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

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi panel</h1>
          <p className="text-muted-foreground mt-1">
            Servicios, reservas (órdenes de venta), capacitaciones y cobros en {BRANDING.APP_NAME}.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className="shrink-0"
              onClick={() => setTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'plataforma' && (
          <Card className="mb-6 border-primary/20 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Cómo te acompaña OficiosHub
              </CardTitle>
              <CardDescription>
                La plataforma valida idoneidad y antecedentes, y reinvierta la intermediación en tu capacitación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Antes de que aparezcas ante clientes, revisamos tu idoneidad como persona con oficio
                y antecedentes relevantes. No sos una empresa de rubro: sos vos, con un servicio concreto.
              </p>
              <p>
                Con lo que recauda la intermediación, OficiosHub te acerca capacitaciones para mejorar
                calidad de trabajo y nivel de vida. Esas capacitaciones te llegan acá como <strong>tareas</strong>.
              </p>
              <p>
                Cuando un cliente te contrata, la reserva llega como <strong>orden de venta</strong>.
                Tenés que <strong>aceptarla</strong> con fecha y zona. No hay contacto directo:
                toda la comunicación pasa por OficiosHub. El cobro se libera recién con el
                <strong> OK de calidad</strong> del cliente.
              </p>
              <Button type="button" variant="outline" onClick={() => setTab('capacitaciones')}>
                Ver mis capacitaciones
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'servicios' && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Lo que ofrezco</h2>
                <p className="text-sm text-muted-foreground">Un oficio claro, sin catálogo de empresa.</p>
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
                  <CardTitle>Publicar mi oficio</CardTitle>
                  <CardDescription>
                    Contá qué hacés vos (una persona). Mejor un servicio concreto que muchas categorías.
                  </CardDescription>
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
                          placeholder="Ej: Destape de caños en casa"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="service-description">Descripción</Label>
                        <Textarea
                          id="service-description"
                          value={form.description}
                          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                          placeholder="Contá qué incluye, zona y cómo coordinás."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-price">
                          {(form.pricingMode || 'fixed') === 'a_convenir'
                            ? 'Referencia opcional (puede quedar en 0)'
                            : 'Precio del servicio'}
                        </Label>
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
                        <Label htmlFor="service-category">Oficio</Label>
                        <select
                          id="service-category"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={form.category || ''}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, category: event.target.value }))
                          }
                        >
                          {categoryOptions.length === 0 ? (
                            <option value="">Sin oficios configurados</option>
                          ) : (
                            categoryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-zone">Localidad / barrio</Label>
                        {barrioOptions.length > 0 ? (
                          <select
                            id="service-zone"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={form.zone || ''}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, zone: event.target.value }))
                            }
                          >
                            <option value="">Elegí zona</option>
                            {barrioOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id="service-zone"
                            value={form.zone || ''}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, zone: event.target.value }))
                            }
                            placeholder="Ej: Palermo, Ramos Mejía"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-person">Tu nombre (como aparece)</Label>
                        <Input
                          id="service-person"
                          value={form.personName || ''}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, personName: event.target.value }))
                          }
                          placeholder="Ej: Martín Acosta"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-rank">Título del oficio</Label>
                        <select
                          id="service-rank"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={form.tradeRank || 'particular'}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              tradeRank: event.target.value as TradeRank,
                            }))
                          }
                        >
                          {TRADE_RANK_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-pricing">Cómo cobrás</Label>
                        <select
                          id="service-pricing"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={form.pricingMode || 'fixed'}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              pricingMode: event.target.value as PricingMode,
                            }))
                          }
                        >
                          {PRICING_MODE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="service-photo">Foto tuya (URL)</Label>
                        <Input
                          id="service-photo"
                          value={form.imageUrl || ''}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, imageUrl: event.target.value }))
                          }
                          placeholder="https://… o /branding/oficioshub/photos/person-….jpg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tiene que verse una persona, no una foto de herramientas o stock.
                        </p>
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
                  const listing = getServiceListing(product);
                  return (
                    <Card key={product.id}>
                      <CardContent className="py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            {listing.tradeRankLabel && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {listing.tradeRankLabel}
                              </span>
                            )}
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
                          <p className="text-sm font-medium">
                            {listing.isAConvenir
                              ? 'A convenir'
                              : formatPrice(product.unit_price, product.currency)}
                          </p>
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
          </>
        )}

        {activeTab === 'reservas' && (
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-semibold">Ficha de reservas</h2>
              <p className="text-sm text-muted-foreground">
                Aceptá o rechazá cada pedido con fecha y zona. Sin contacto directo: todo pasa por OficiosHub.
              </p>
            </div>
            {orders.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="reserva-status-filter">Estado de aceptación</Label>
                  <select
                    id="reserva-status-filter"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={reservaStatusFilter}
                    onChange={(event) => setReservaStatusFilter(event.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="pending_accept">Pendientes de aceptar</option>
                    <option value="accepted">Aceptadas</option>
                    <option value="rejected">Rechazadas</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reserva-barrio-filter">Localidad / barrio</Label>
                  {barrioOptions.length > 0 ? (
                    <select
                      id="reserva-barrio-filter"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={reservaBarrioFilter}
                      onChange={(event) => setReservaBarrioFilter(event.target.value)}
                    >
                      <option value="">Todas las zonas</option>
                      {barrioOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="reserva-barrio-filter"
                      value={reservaBarrioFilter}
                      onChange={(event) => setReservaBarrioFilter(event.target.value)}
                      placeholder="Filtrar por barrio"
                    />
                  )}
                </div>
              </div>
            )}
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Todavía no tenés reservas. Cuando alguien te contrate, la orden aparece acá.
                </CardContent>
              </Card>
            ) : filteredReservas.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay reservas con esos filtros.
                </CardContent>
              </Card>
            ) : (
              filteredReservas.map((order) => {
                const reservation = getServiceReservation(order);
                const scheduled =
                  reservation.scheduledAt
                  || (reservation.serviceDate && reservation.serviceTime
                    ? `${reservation.serviceDate}T${reservation.serviceTime}:00`
                    : reservation.serviceDate)
                  || order.due_at
                  || order.created_at;
                const address = order.shipping_address
                  ? [order.shipping_address.line1, order.shipping_address.city, order.shipping_address.state]
                      .filter(Boolean)
                      .join(', ')
                  : 'Zona a coordinar por OficiosHub';
                const pendingAccept = reservation.providerStatus === 'pending_accept'
                  || reservation.providerStatus === 'pending';
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                        Reserva {order.order_number}
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {statusLabel(order.status)}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {statusLabel(reservation.providerStatus)}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Cliente: {order.customer?.name || 'Cliente'} · {formatDate(scheduled)}
                        {reservation.barrio ? ` · ${reservation.barrio}` : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p>
                        <span className="font-medium">Servicio: </span>
                        {order.items?.map((i) => i.description).filter(Boolean).join(', ') || 'Servicio'}
                      </p>
                      <p>
                        <span className="font-medium">Dónde: </span>
                        {address}
                      </p>
                      {(reservation.workDetail || order.notes) && (
                        <p>
                          <span className="font-medium">Detalle del trabajo: </span>
                          {reservation.workDetail || order.notes}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        Coordinación solo por OficiosHub · cobro tras OK de calidad del cliente
                        {reservation.qualityOk ? ' · OK de calidad recibido' : ''}
                      </p>
                      <p className="font-medium">{formatPrice(Number(order.total || 0), order.currency)}</p>
                      {pendingAccept && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            type="button"
                            disabled={respondingOrderId === order.id}
                            onClick={() => handleRespondReservation(order, 'accept')}
                          >
                            {respondingOrderId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aceptar reserva
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={respondingOrderId === order.id}
                            onClick={() => handleRespondReservation(order, 'reject')}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'capacitaciones' && (
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-semibold">Capacitaciones</h2>
              <p className="text-sm text-muted-foreground">
                Te llegan como tareas. Completalas para mejorar calidad y seguimiento de OficiosHub.
              </p>
            </div>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No tenés capacitaciones asignadas por ahora. Cuando la plataforma te asigne una, aparece acá.
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{task.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                          {statusLabel(task.status)}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Vence: {formatDate(task.due_at)}</p>
                    </div>
                    {task.status !== 'done' && (
                      <Button
                        type="button"
                        disabled={taskUpdatingId === task.id}
                        onClick={() => handleTaskDone(task)}
                      >
                        {taskUpdatingId === task.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar hecha
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'cobros' && (
          <div className="space-y-4">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Cobros por servicios prestados</h2>
                <p className="text-sm text-muted-foreground">
                  El cobro queda retenido hasta el OK de calidad del cliente. OficiosHub intermedia el pago.
                </p>
              </div>
              <p className="text-lg font-semibold">
                Acumulado: {formatPrice(cobrosTotal)}
              </p>
            </div>
            {cobros.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Todavía no hay cobros. Aparecen cuando hay órdenes de tus servicios.
                </CardContent>
              </Card>
            ) : (
              cobros.map((cobro) => (
                <Card key={cobro.orderId}>
                  <CardContent className="py-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{cobro.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{cobro.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(cobro.createdAt)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">{formatPrice(cobro.grossTotal, cobro.currency)}</p>
                      <p className="text-sm">
                        Cobrado: {formatPrice(cobro.paidAmount, cobro.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Orden: {statusLabel(cobro.status)} · Pago: {statusLabel(cobro.paymentStatus)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
