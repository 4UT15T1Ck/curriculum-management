import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meQueryKey } from '../../../shared/auth/me';
import { login } from '../api/auth';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (me) => queryClient.setQueryData(meQueryKey, me),
  });
}
