import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react';
import { getUIConfig } from '@/config/runtime';

export const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const uiCfg = getUIConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            {uiCfg.registrationSuccessTitle}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {uiCfg.registrationSuccessSubtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">{uiCfg.registrationSuccessReadyTitle}</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ {uiCfg.registrationSuccessBullet1}</li>
              <li>✓ {uiCfg.registrationSuccessBullet2}</li>
              <li>✓ {uiCfg.registrationSuccessBullet3}</li>
              <li>✓ {uiCfg.registrationSuccessBullet4}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/productos')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {uiCfg.registrationSuccessViewProductsLabel}
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              {uiCfg.registrationSuccessHomeLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;