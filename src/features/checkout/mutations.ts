import { useMutation } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import type { CheckoutPayload } from './model';
import type { CheckoutProcessResult } from '@/services/orderService';

export const useCheckoutMutation = () =>
  useMutation<CheckoutProcessResult, Error, { payload: CheckoutPayload; businessPartnerId?: string }>({
    mutationKey: ['checkout', 'process'],
    mutationFn: ({ payload, businessPartnerId }: { payload: CheckoutPayload; businessPartnerId?: string }) =>
      orderService.processCheckout(payload, businessPartnerId),
  });
