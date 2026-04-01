/**
 * Página de perfil del usuario
 */

import React, { useState } from 'react';
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
import { getBusinessConfig } from '@/config/runtime';

export const ProfilePage: React.FC = () => {
  const { auth, logout, addNotification } = useStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: auth.user?.person?.first_name || '',
    lastName: auth.user?.person?.last_name || '',
    email: auth.user?.email || '',
    phone: auth.user?.person?.phone || '',
  });

  // Redirigir si no está autenticado
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tu perfil</p>
          <Link 
            to="/login" 
            state={{ from: '/perfil' }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
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
                Volver
              </Link>
              <h1 className="text-2xl font-bold">Mi Perfil</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Guardando...' : 'Guardar'}
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
                <h2 className="text-lg font-semibold">Información Personal</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {auth.user?.person?.first_name || 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {auth.user?.person?.last_name || 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                    {auth.user?.email}
                    <span className="ml-2 text-xs text-gray-500">(No editable)</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {auth.user?.person?.phone || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="font-semibold mb-4">Información de Cuenta</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usuario:</span>
                  <span className="text-sm font-medium">{auth.user?.username}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className="text-sm font-medium text-green-600">✓ Activo</span>
                </div>
                
                {auth.user?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Miembro desde:</span>
                    <span className="text-sm font-medium">{formatDate(auth.user.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold mb-4">Acciones</h2>
              
              <div className="space-y-3">
                <Link 
                  to="/pedidos"
                  className="flex items-center w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm">Ver mis pedidos</span>
                </Link>
                
                <Link 
                  to="/favoritos"
                  className="flex items-center w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm">Mis favoritos</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
