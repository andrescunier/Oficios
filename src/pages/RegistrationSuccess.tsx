import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export const RegistrationSuccess = () => {
  const navigate = useNavigate();

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
            Tu cuenta ha sido creada correctamente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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
              onClick={() => navigate('/login')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={() => navigate('/')}
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