import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, Building2, User, Mail, Phone } from 'lucide-react';

interface RegistrationSuccessData {
  user: {
    email: string;
    username: string;
  };
  businessPartner: {
    name: string;
  };
}

const RegistrationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener los datos del registro exitoso del state
  const registrationData = location.state as RegistrationSuccessData | null;

  const handleContinue = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            ¡Registro Exitoso!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tu cuenta empresarial ha sido creada correctamente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {registrationData && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Información de Usuario
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{registrationData.user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Usuario:</span>
                    <span className="ml-2">{registrationData.user.username}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Información Empresarial
                </h3>
                <div className="text-sm">
                  <div className="flex items-center text-gray-700">
                    <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Empresa:</span>
                    <span className="ml-2">{registrationData.businessPartner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Próximos Pasos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tu cuenta está lista para usar</li>
              <li>• Puedes iniciar sesión con tus credenciales</li>
              <li>• Explora nuestro catálogo de productos</li>
              <li>• Contacta a nuestro equipo para soporte</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleContinue}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex-1"
            >
              Ir al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;