import { Loader2 } from 'lucide-react';

export function RouteLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Cargando...</span>
      </div>
    </div>
  );
}
