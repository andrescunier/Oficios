import { useMutation } from '@tanstack/react-query';
import { authService, type LoginCredentials, type RegisterData } from '@/services/authService';

export const useLoginMutation = () =>
  useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: (payload: RegisterData) => authService.register(payload),
  });
