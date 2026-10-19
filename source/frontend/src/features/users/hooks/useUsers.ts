import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createUser,
  disableUser,
  enableUser,
  fetchUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
} from '../api/users';
import type { UserDetail, UserListParams } from '../api/users';

export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  list: (params: UserListParams) => ['users', 'list', params] as const,
  detail: (userId: string) => ['users', 'detail', userId] as const,
  assignments: (userId: string) =>
    ['users', 'detail', userId, 'role-assignments'] as const,
};

export function useUserList(params: UserListParams) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(userId),
    queryFn: () => fetchUser(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: USER_QUERY_KEYS.all }),
  });
}

function useUserMutation(mutationFn: (userId: string) => Promise<UserDetail>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (user) => {
      client.setQueryData(USER_QUERY_KEYS.detail(user.id), user);
      return client.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
}

export function useUpdateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: Parameters<typeof updateUser>[1];
    }) => updateUser(userId, body),
    onSuccess: (user) => {
      client.setQueryData(USER_QUERY_KEYS.detail(user.id), user);
      return client.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
}
export function useDisableUser() {
  return useUserMutation(disableUser);
}
export function useEnableUser() {
  return useUserMutation(enableUser);
}
export function useResetUserPassword() {
  return useMutation({ mutationFn: resetUserPassword });
}
