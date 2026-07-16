import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';

export interface ReviewDimensions {
  service: number;
  cleanliness: number;
  punctuality: number;
  quality: number;
}

export interface ProductReview {
  id: string;
  overall_rating: number;
  dimensions: ReviewDimensions;
  comment?: string;
  business_partner_id?: string;
  sales_order_id?: string;
  created_at?: string;
}

export interface ReviewSummary {
  overall_rating_avg?: number;
  /** Alias backend actual: `rating` */
  rating?: number;
  review_count?: number;
  dimensions_avg?: Partial<ReviewDimensions>;
  /** Alias backend actual: `dimensions` */
  dimensions?: Partial<ReviewDimensions>;
  rating_dimensions?: Partial<ReviewDimensions>;
}

export interface UpsertReviewPayload {
  overall_rating: number;
  dimensions: ReviewDimensions;
  comment?: string;
  sales_order_id?: string;
}

interface ListEnvelope {
  data?: ProductReview[];
}

interface SummaryEnvelope {
  data?: ReviewSummary;
}

const extractReviews = (response: unknown): ProductReview[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object') {
    const envelope = response as ListEnvelope;
    if (Array.isArray(envelope.data)) {
      return envelope.data;
    }
  }
  return [];
};

const normalizeSummary = (raw: ReviewSummary): ReviewSummary => {
  return {
    ...raw,
    overall_rating_avg: raw.overall_rating_avg ?? raw.rating,
    dimensions_avg: raw.dimensions_avg || raw.dimensions || raw.rating_dimensions,
    rating_dimensions: raw.rating_dimensions || raw.dimensions || raw.dimensions_avg,
  };
};

const extractSummary = (response: unknown): ReviewSummary | null => {
  if (response && typeof response === 'object') {
    if (
      'overall_rating_avg' in response
      || 'rating' in response
      || 'review_count' in response
      || 'dimensions_avg' in response
      || 'dimensions' in response
    ) {
      return normalizeSummary(response as ReviewSummary);
    }
    const envelope = response as SummaryEnvelope;
    if (envelope.data && typeof envelope.data === 'object') {
      return normalizeSummary(envelope.data);
    }
  }
  return null;
};

const extractReview = (response: unknown): ProductReview => {
  if (response && typeof response === 'object') {
    if ('overall_rating' in response) {
      return response as ProductReview;
    }
    const envelope = response as { data?: ProductReview };
    if (envelope.data && typeof envelope.data === 'object') {
      return envelope.data;
    }
  }
  throw new Error('No se pudo procesar la reseña');
};

export class ReviewService {
  async list(productId: string): Promise<ProductReview[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get<unknown>(
      API_ENDPOINTS.PRODUCT_REVIEWS(accountId, productId),
    );
    return extractReviews(response);
  }

  async summary(productId: string): Promise<ReviewSummary | null> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get<unknown>(
      API_ENDPOINTS.PRODUCT_REVIEW_SUMMARY(accountId, productId),
    );
    return extractSummary(response);
  }

  async upsert(
    productId: string,
    businessPartnerId: string,
    payload: UpsertReviewPayload,
  ): Promise<ProductReview> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.PRODUCT_REVIEWS(accountId, productId),
      payload,
      {
        params: {
          business_partner_id: businessPartnerId,
        },
      },
    );
    return extractReview(response);
  }
}

export const reviewService = new ReviewService();
