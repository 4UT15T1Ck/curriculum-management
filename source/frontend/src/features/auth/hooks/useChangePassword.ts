import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meQueryKey } from '../../../shared/auth/me';
import { changePassword } from '../api/auth';

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meQueryKey }),
  });
}
