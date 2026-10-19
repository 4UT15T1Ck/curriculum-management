import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Select, Spin } from 'antd';
import { useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  courseOptionLabel,
  courseSearchQueryKey,
  searchCourses,
} from './courseSearch';

export const COURSE_SELECT_DEBOUNCE_MS = 300;
const DEFAULT_PLACEHOLDER = 'Tìm theo mã hoặc tên học phần';

interface CourseSelectProps {
  // Injected by Form.Item, which ties the field's label to it.
  id?: string;
  value?: string;
  onChange?: (courseId: string | undefined) => void;
  excludeIds?: readonly string[];
  placeholder?: string;
}

interface CourseMultiSelectProps {
  id?: string;
  value?: string[];
  onChange?: (courseIds: string[]) => void;
  excludeIds?: readonly string[];
  placeholder?: string;
}

interface LabelledOption {
  value?: unknown;
  label?: unknown;
}

// Remote search over the catalog by code or name. Labels of chosen courses are remembered
// (filled from the select's own change event), so a selection keeps its text after the next search replaces the options.
function useCourseOptions(excludeIds: readonly string[], selected: string[]) {
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term.trim(), COURSE_SELECT_DEBOUNCE_MS);
  const [known, setKnown] = useState<Record<string, string>>({});
  const { data, isFetching } = useQuery({
    queryKey: courseSearchQueryKey(debounced),
    queryFn: () => searchCourses(debounced),
    placeholderData: keepPreviousData,
  });
  const found = (data?.items ?? [])
    .filter((course) => !excludeIds.includes(course.id))
    .map((course) => ({
      value: course.id,
      label: courseOptionLabel(course),
    }));
  const kept = selected
    .filter((id) => !found.some((option) => option.value === id))
    .map((id) => ({ value: id, label: known[id] ?? id }));
  const remember = (chosen: LabelledOption | LabelledOption[] | undefined) => {
    const entries = [chosen ?? []]
      .flat()
      .filter(
        (option): option is { value: string; label: string } =>
          typeof option.value === 'string' && typeof option.label === 'string',
      )
      .map((option) => [option.value, option.label] as const);
    if (entries.length > 0)
      setKnown((current) => ({ ...current, ...Object.fromEntries(entries) }));
  };
  return {
    options: [...kept, ...found],
    isFetching,
    onSearch: setTerm,
    remember,
  };
}

export function CourseSelect({
  id,
  value,
  onChange,
  excludeIds = [],
  placeholder = DEFAULT_PLACEHOLDER,
}: CourseSelectProps) {
  const { options, isFetching, onSearch, remember } = useCourseOptions(
    excludeIds,
    value ? [value] : [],
  );
  return (
    <Select
      id={id}
      showSearch
      allowClear
      value={value}
      onChange={(next: string | undefined, chosen) => {
        remember(chosen);
        onChange?.(next);
      }}
      onSearch={onSearch}
      filterOption={false}
      loading={isFetching}
      options={options}
      placeholder={placeholder}
      notFoundContent={isFetching ? <Spin size="small" /> : 'Không tìm thấy'}
    />
  );
}

// A sibling rather than a `multiple` flag: the value type differs (string[]), and so do the callers.
export function CourseMultiSelect({
  id,
  value = [],
  onChange,
  excludeIds = [],
  placeholder = DEFAULT_PLACEHOLDER,
}: CourseMultiSelectProps) {
  const { options, isFetching, onSearch, remember } = useCourseOptions(
    excludeIds,
    value,
  );
  return (
    <Select
      id={id}
      mode="multiple"
      showSearch
      allowClear
      value={value}
      onChange={(next: string[], chosen) => {
        remember(chosen);
        onChange?.(next);
      }}
      onSearch={onSearch}
      filterOption={false}
      loading={isFetching}
      options={options}
      placeholder={placeholder}
      notFoundContent={isFetching ? <Spin size="small" /> : 'Không tìm thấy'}
    />
  );
}
