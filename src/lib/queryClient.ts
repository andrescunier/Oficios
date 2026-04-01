import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from '@/config/api';
import { recordQueryError } from '@/lib/observability';

export const queryClient = new QueryClient({
  ...QUERY_CONFIG,
  queryCache: new QueryCache({
    onError: (error, query) => {
      recordQueryError('query_error', query.queryKey.join(' > '), error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const mutationKey = Array.isArray(mutation.options.mutationKey)
        ? mutation.options.mutationKey.join(' > ')
        : 'anonymous-mutation';
      recordQueryError('mutation_error', mutationKey, error);
    },
  }),
});
