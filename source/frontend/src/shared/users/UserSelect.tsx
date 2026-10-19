import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { fetchUserOptions, userOptionsQueryKey } from './userOptions';

export const USER_SEARCH_DEBOUNCE_MS = 300;
interface UserSelectProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
}
export function UserSelect({
  value,
  onChange,
  placeholder = 'Tìm theo mã, tên đăng nhập hoặc họ tên',
}: UserSelectProps) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(search.trim()),
      USER_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);
  const { data = [], isFetching } = useQuery({
    queryKey: userOptionsQueryKey(debounced),
    queryFn: () => fetchUserOptions(debounced),
    placeholderData: keepPreviousData,
  });
  return (
    <Select
      showSearch
      value={value}
      onChange={(next) => onChange?.(next)}
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
