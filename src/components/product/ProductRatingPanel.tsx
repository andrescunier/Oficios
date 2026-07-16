import React, { useEffect, useMemo, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getBusinessPartnerId } from '@/features/auth/session';
import {
  reviewService,
  type ReviewDimensions,
  type ReviewSummary,
} from '@/services/reviewService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DIMENSION_LABELS: Record<keyof ReviewDimensions, string> = {
  service: 'Atención',
  cleanliness: 'Limpieza',
  punctuality: 'Puntualidad',
  quality: 'Calidad',
};

const DEFAULT_DIMENSIONS: ReviewDimensions = {
  service: 5,
  cleanliness: 5,
  punctuality: 5,
  quality: 5,
};

interface ProductRatingPanelProps {
  productId: string;
  productMetadata?: Record<string, unknown> | null;
}

const renderStars = (rating: number, sizeClass = 'w-4 h-4') => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i += 1) {
    if (i < fullStars) {
      stars.push(<Star key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} className={`${sizeClass} fill-yellow-400/50 text-yellow-400`} />);
    } else {
      stars.push(<Star key={i} className={`${sizeClass} text-gray-300`} />);
    }
  }

  return stars;
};

const readMetadataDimensions = (metadata?: Record<string, unknown> | null): Partial<ReviewDimensions> | null => {
  const raw = metadata?.rating_dimensions;
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const dimensions = raw as Partial<ReviewDimensions>;
  return dimensions;
};

const resolveSummaryDimensions = (summary: ReviewSummary | null): Partial<ReviewDimensions> | null => {
  if (!summary) return null;
  return summary.dimensions_avg || summary.dimensions || summary.rating_dimensions || null;
};

const StarPicker: React.FC<{
  value: number;
  onChange: (value: number) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div className="space-y-1">
    <Label className="text-sm">{label}</Label>
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const score = index + 1;
        const active = score <= value;
        return (
          <button
            key={score}
            type="button"
            aria-label={`${label}: ${score} estrellas`}
            onClick={() => onChange(score)}
            className="p-0.5"
          >
            <Star
              className={`h-5 w-5 ${active ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        );
      })}
    </div>
  </div>
);

export const ProductRatingPanel: React.FC<ProductRatingPanelProps> = ({
  productId,
  productMetadata,
}) => {
  const { auth, addNotification } = useStore();
  const businessPartnerId = getBusinessPartnerId();

  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [dimensions, setDimensions] = useState<ReviewDimensions>(DEFAULT_DIMENSIONS);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      setIsLoading(true);
      try {
        const response = await reviewService.summary(productId);
        if (!cancelled) {
          setSummary(response);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const metadataDimensions = useMemo(
    () => readMetadataDimensions(productMetadata),
    [productMetadata],
  );

  const displayDimensions = resolveSummaryDimensions(summary) || metadataDimensions;
  const overallAverage =
    summary?.overall_rating_avg
    ?? summary?.rating
    ?? (typeof productMetadata?.rating === 'number' ? productMetadata.rating : undefined);
  const reviewCount =
    summary?.review_count ??
    (typeof productMetadata?.review_count === 'number' ? productMetadata.review_count : 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessPartnerId) {
      addNotification({
        type: 'warning',
        title: 'Iniciá sesión',
        message: 'Tenés que estar logueado para dejar una reseña.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.upsert(productId, businessPartnerId, {
        overall_rating: overallRating,
        dimensions,
        comment: comment.trim() || undefined,
      });
      const refreshed = await reviewService.summary(productId);
      setSummary(refreshed);
      setComment('');
      addNotification({
        type: 'success',
        title: '¡Gracias!',
        message: 'Tu reseña quedó registrada.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'No se pudo enviar la reseña',
        message: error instanceof Error ? error.message : 'Intentá de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Reseñas y calificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando calificaciones...
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(overallAverage || 0, 'w-5 h-5')}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {overallAverage ? overallAverage.toFixed(1) : 'Sin calificaciones'}
                </p>
                {reviewCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {reviewCount} reseña{reviewCount === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            </div>

            {displayDimensions && (
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(DIMENSION_LABELS) as Array<keyof ReviewDimensions>).map((key) => {
                  const value = displayDimensions[key];
                  if (typeof value !== 'number') {
                    return null;
                  }
                  return (
                    <div key={key} className="rounded-md border px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">{DIMENSION_LABELS[key]}</span>
                        <span className="text-sm font-medium">{value.toFixed(1)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-0.5">
                        {renderStars(value, 'w-3.5 h-3.5')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {auth.isAuthenticated && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <p className="text-sm font-medium">Dejá tu calificación</p>
            <StarPicker
              label="Calificación general"
              value={overallRating}
              onChange={setOverallRating}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(DIMENSION_LABELS) as Array<keyof ReviewDimensions>).map((key) => (
                <StarPicker
                  key={key}
                  label={DIMENSION_LABELS[key]}
                  value={dimensions[key]}
                  onChange={(value) =>
                    setDimensions((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comentario (opcional)</Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Contanos cómo fue la experiencia con este servicio."
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Publicar reseña'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
