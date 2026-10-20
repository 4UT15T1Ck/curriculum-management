import { Button, Flex, Input, Segmented, Select } from 'antd';
import type { Curriculum } from '../api/curriculum';
import {
  ELECTIVE_KIND_LABELS,
  NO_BLOCK_LABEL,
} from '../constants/curriculumLabels';
import {
  EMPTY_CURRICULUM_FILTERS,
  type CurriculumFilters,
  type CurriculumKind,
} from '../hooks/useCurriculumFilters';

interface CurriculumFiltersBarProps {
  curriculum: Curriculum;
  filters: CurriculumFilters;
  filtered: boolean;
  onChange: (filters: CurriculumFilters) => void;
}

// A Select value cannot be null, so "rows without a symbol" gets a sentinel.
const NO_BLOCK_VALUE = '\u0000none';

const KIND_OPTIONS: { value: CurriculumKind; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'compulsory', label: ELECTIVE_KIND_LABELS.compulsory },
  { value: 'elective', label: ELECTIVE_KIND_LABELS.elective },
];

export function CurriculumFiltersBar({
  curriculum,
  filters,
  filtered,
  onChange,
}: CurriculumFiltersBarProps) {
  const patch = (next: Partial<CurriculumFilters>) =>
    onChange({ ...filters, ...next });
  const blockValue =
    filters.blockSymbol === undefined
      ? undefined
      : (filters.blockSymbol ?? NO_BLOCK_VALUE);
  return (
    <Flex wrap gap="small" align="center">
      <Input.Search
        allowClear
        placeholder="Tìm theo mã hoặc tên học phần"
        value={filters.search}
        onChange={(event) => patch({ search: event.target.value })}
        style={{ width: 280 }}
      />
      <Select
        allowClear
        placeholder="Học kỳ"
        style={{ minWidth: 120 }}
        value={filters.semester ?? undefined}
        options={curriculum.semesters.map((semester) => ({
          value: semester.semester,
          label: `Học kỳ ${semester.semester}`,
        }))}
        onChange={(semester?: number) => patch({ semester: semester ?? null })}
      />
      <Select
        allowClear
        placeholder="Khối kiến thức"
        style={{ minWidth: 180 }}
        value={blockValue}
        options={curriculum.blocks.map((block) => ({
          value: block.symbol ?? NO_BLOCK_VALUE,
          label: block.symbol ?? NO_BLOCK_LABEL,
        }))}
        onChange={(value?: string) =>
          patch({
            blockSymbol:
              value === undefined
                ? undefined
                : value === NO_BLOCK_VALUE
                  ? null
                  : value,
          })
        }
      />
      <Segmented<CurriculumKind>
        options={KIND_OPTIONS}
        value={filters.kind}
        onChange={(kind) => patch({ kind })}
      />
      {filtered && (
        <Button onClick={() => onChange(EMPTY_CURRICULUM_FILTERS)}>
          Xóa lọc
        </Button>
      )}
    </Flex>
  );
}
