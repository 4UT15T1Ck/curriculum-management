import { Select, Spin } from 'antd';
import { useState } from 'react';
import { CourseSelect } from '../../../shared/courses/CourseSelect';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import type { ChangeTargetType, TargetOption } from '../api/changeRequests';
import { TARGET_SEARCH_DEBOUNCE_MS } from '../constants/changeRequestLimits';
import {
  useProgramOptions,
  useSubjectGroupOptions,
} from '../hooks/useChangeRequests';

interface TargetSelectProps {
  id?: string;
  targetType: ChangeTargetType;
  value?: string;
  onChange?: (targetId: string | undefined) => void;
  // "CODE — name" of a value the form starts with, which no search has returned yet.
  initialLabel?: string;
}

const optionLabel = (option: TargetOption) => `${option.code} — ${option.name}`;

// The picker follows the target kind of the chosen type. Each kind reads its own list endpoint.
export function TargetSelect({
  id,
  targetType,
  value,
  onChange,
  initialLabel,
}: TargetSelectProps) {
  if (targetType === 'COURSE')
    return (
      <CourseSelect
        id={id}
        value={value}
        onChange={onChange}
        statuses={['ACTIVE', 'DISCONTINUED']}
        initialLabels={value && initialLabel ? { [value]: initialLabel } : {}}
      />
    );
  if (targetType === 'PROGRAM')
    return (
      <ProgramSelect
        id={id}
        value={value}
        onChange={onChange}
        initialLabel={initialLabel}
      />
    );
  return (
    <GroupSelect
      id={id}
      value={value}
      onChange={onChange}
      initialLabel={initialLabel}
    />
  );
}

interface KindSelectProps {
  id?: string;
  value?: string;
  onChange?: (targetId: string | undefined) => void;
  initialLabel?: string;
}

function withSelected(
  options: readonly TargetOption[],
  value: string | undefined,
  initialLabel: string | undefined,
) {
  const listed = options.map((option) => ({
    value: option.id,
    label: optionLabel(option),
  }));
  return value && initialLabel && !listed.some((o) => o.value === value)
    ? [{ value, label: initialLabel }, ...listed]
    : listed;
}

function ProgramSelect({ id, value, onChange, initialLabel }: KindSelectProps) {
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term.trim(), TARGET_SEARCH_DEBOUNCE_MS);
  const { data = [], isFetching } = useProgramOptions(debounced, true);
  return (
    <Select
      id={id}
      showSearch
      allowClear
      value={value}
      onChange={(next: string | undefined) => onChange?.(next)}
      onSearch={setTerm}
      filterOption={false}
      loading={isFetching}
      options={withSelected(data, value, initialLabel)}
      placeholder="Tìm theo mã hoặc tên chương trình"
      notFoundContent={isFetching ? <Spin size="small" /> : 'Không tìm thấy'}
    />
  );
}

function GroupSelect({ id, value, onChange, initialLabel }: KindSelectProps) {
  const { data = [], isFetching } = useSubjectGroupOptions(true);
  return (
    <Select
      id={id}
      showSearch
      allowClear
      value={value}
      onChange={(next: string | undefined) => onChange?.(next)}
      optionFilterProp="label"
      loading={isFetching}
      options={withSelected(data, value, initialLabel)}
      placeholder="Chọn nhóm chuyên môn"
      notFoundContent={isFetching ? <Spin size="small" /> : 'Không tìm thấy'}
    />
  );
}
