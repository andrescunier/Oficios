/**
 * Página de perfil del usuario
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getBusinessConfig, getUIConfig } from '@/config/runtime';
import { authService } from '@/services/authService';
import { saveShippingAddress, type AddressFormData } from '@/services/addressService';
import { saveRegistrationDraft } from '@/features/auth/session';

export const ProfilePage: React.FC = () => {
  const { auth, logout, addNotification } = useStore();
  const navigate = useNavigate();
  const uiCfg = getUIConfig();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: auth.user?.person?.first_name || '',
    lastName: auth.user?.person?.last_name || '',
    email: auth.user?.email || '',
    phone: auth.user?.person?.phone || '',
  });

  // Estado de dirección de envío (se carga desde /auth/me)
  const [addressLoading, setAddressLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<{
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  } | null>(null);
  const [addressForm, setAddressForm] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country_code: 'AR',
  });

  // Cargar dirección desde /auth/me al montar
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    let cancelled = false;
    authService.getMe().then((me) => {
      if (cancelled) return;
      const s = me?.data?.shipping;
      if (s) {
        setShippingAddress({
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          zip_code: s.zip_code || '',
          country: s.country || '',
        });
        setAddressForm({
          line1: s.address || '',
          line2: '',
          city: s.city || '',
          state: s.state || '',
          postal_code: s.zip_code || '',
          country_code: s.country || 'AR',
        });
      }
    });
    return () => { cancelled = true; };
  }, [auth.isAuthenticated]);

  // Redirigir si no está autenticado
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">{uiCfg.authRequiredTitle}</h2>
          <p className="text-gray-600 mb-6">{uiCfg.profileAuthMessage}</p>
          <Link 
            to="/login" 
            state={{ from: '/perfil' }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {uiCfg.authLoginButtonLabel}
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aquí llamarías a la API para actualizar el perfil
      // await authService.updateProfile(formData);
      
      addNotification({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Tu información ha sido actualizada correctamente',
      });
      
      setIsEditing(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al actualizar',
        message: 'No se pudo actualizar tu perfil. Intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.line1.trim() || !addressForm.city.trim()) {
      addNotification({ type: 'warning', title: 'Datos incompletos', message: 'Calle y ciudad son obligatorias.' });
      return;
    }
    setAddressLoading(true);
    try {
      const payload: AddressFormData = {
        line1: addressForm.line1,
        line2: addressForm.line2 || undefined,
        city: addressForm.city,
        state: addressForm.state || undefined,
        postal_code: addressForm.postal_code || undefined,
        country_code: addressForm.country_code || 'AR',
      };
      await saveShippingAddress(payload);

      // Refrescar desde /auth/me
      const me = await authService.getMe();
      const s = me?.data?.shipping;
      if (s) {
        setShippingAddress({
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          zip_code: s.zip_code || '',
          country: s.country || '',
        });
        // Actualizar draft de checkout
        saveRegistrationDraft({
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          zipCode: s.zip_code || '',
        });
      }
      setIsEditingAddress(false);
      addNotification({ type: 'success', title: 'Dirección guardada', message: 'Tu dirección de envío fue actualizada.' });
    } catch (error: any) {
      addNotification({ type: 'error', title: 'Error al guardar', message: error?.message || 'No se pudo guardar la dirección.' });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      addNotification({
        type: 'success',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión correctamente',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Hubo un problema al cerrar sesión',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(getBusinessConfig().locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {uiCfg.profileBackLabel}
              </Link>
              <h1 className="text-2xl font-bold">{uiCfg.profilePageTitle}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {uiCfg.profileEditLabel}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {uiCfg.profileCancelLabel}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? uiCfg.profileSavingLabel : uiCfg.profileSaveLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Información principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">{uiCfg.profilePersonalInfoTitle}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.profileFirstNameLabel}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {auth.user?.person?.first_name || uiCfg.profileNotSpecified}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.profileLastNameLabel}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {auth.user?.person?.last_name || uiCfg.profileNotSpecified}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.profileEmailLabel}</label>
                  <p className="text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                    {auth.user?.email}
                    <span className="ml-2 text-xs text-gray-500">{uiCfg.profileEmailReadOnly}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.profilePhoneLabel}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {auth.user?.person?.phone || uiCfg.profileNotSpecified}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold">Dirección de envío</h2>
                </div>
                {!isEditingAddress ? (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="flex items-center px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      disabled={addressLoading}
                      className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      {addressLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>

              {isEditingAddress ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calle y número *</label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Corrientes 1234"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Piso / Depto (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 3° B"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                      <input
                        type="text"
                        placeholder="Buenos Aires"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                      <input
                        type="text"
                        placeholder="Buenos Aires"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
                      <input
                        type="text"
                        placeholder="1043"
                        value={addressForm.postal_code}
                        onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                      <select
                        value={addressForm.country_code}
                        onChange={(e) => setAddressForm({ ...addressForm, country_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="AR">Argentina</option>
                        <option value="UY">Uruguay</option>
                        <option value="CL">Chile</option>
                        <option value="BR">Brasil</option>
                        <option value="PY">Paraguay</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : shippingAddress && (shippingAddress.address || shippingAddress.city) ? (
                <div className="space-y-2 text-sm text-gray-700">
                  {shippingAddress.address && <p>{shippingAddress.address}</p>}
                  <p>
                    {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ')}
                    {shippingAddress.zip_code && ` (${shippingAddress.zip_code})`}
                  </p>
                  {shippingAddress.country && <p className="text-gray-500">{shippingAddress.country}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No tenés una dirección de envío guardada.{' '}
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Agregar ahora
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="font-semibold mb-4">{uiCfg.profileAccountInfoTitle}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{uiCfg.profileUsernameLabel}</span>
                  <span className="text-sm font-medium">{auth.user?.username}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{uiCfg.profileStatusLabel}</span>
                  <span className="text-sm font-medium text-green-600">{uiCfg.profileStatusActive}</span>
                </div>
                
                {auth.user?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{uiCfg.profileMemberSinceLabel}</span>
                    <span className="text-sm font-medium">{formatDate(auth.user.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold mb-4">{uiCfg.profileActionsTitle}</h2>
              
              <div className="space-y-3">
                <Link 
                  to="/pedidos"
                  className="flex items-center w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm">{uiCfg.profileViewOrdersLabel}</span>
                </Link>
                
                <Link 
                  to="/favoritos"
                  className="flex items-center w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm">{uiCfg.profileFavoritesLabel}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm">{uiCfg.profileLogoutLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
