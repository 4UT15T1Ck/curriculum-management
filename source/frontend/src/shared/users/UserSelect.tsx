import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Select, Spin } from 'antd';
import { useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  fetchUserOptions,
  USERS_SEARCH_PATH,
  userOptionsQueryKey,
} from './userOptions';

export const USER_SEARCH_DEBOUNCE_MS = 300;
interface UserSelectProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  // Called with the option's text ("CODE — name") beside onChange, for callers that show the choice later.
  onPick?: (value: string | undefined, label: string | undefined) => void;
  placeholder?: string;
  // Where to search; defaults to the account list, which only R1 may read.
  searchPath?: string;
}
export function UserSelect({
  value,
  onChange,
  onPick,
  placeholder = 'Tìm theo mã, tên đăng nhập hoặc họ tên',
  searchPath = USERS_SEARCH_PATH,
}: UserSelectProps) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), USER_SEARCH_DEBOUNCE_MS);
  const { data = [], isFetching } = useQuery({
    queryKey: userOptionsQueryKey(debounced, searchPath),
    queryFn: () => fetchUserOptions(debounced, searchPath),
    placeholderData: keepPreviousData,
  });
  return (
    <Select
      showSearch
      value={value}
      onChange={(next) => {
        const picked = data.find((user) => user.id === next);
        onChange?.(next);
        onPick?.(next, picked && `${picked.userCode} — ${picked.fullName}`);
      }}
      onSearch={setSearch}
      filterOption={false}
      loading={isFetching}
      placeholder={placeholder}
      notFoundContent={isFetching ? <Spin size="small" /> : 'Không tìm thấy'}
      options={data.map((user) => ({
        value: user.id,
        label: `${user.userCode} — ${user.fullName}`,
      }))}
    />
  );
}
