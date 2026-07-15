/** Skeleton alineado a ProductCard (caja con borde y sombra). */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-2 w-16 bg-muted" />
        <div className="h-4 bg-muted w-full" />
        <div className="h-4 bg-muted w-2/3" />
        <div className="h-5 bg-muted w-1/2" />
      </div>
    </div>
  );
}
