import { Flex, Select } from 'antd';
import type { PloHeader } from '../api/outcomes';

export interface ProgramCloPloFilterValues {
  semester: number | null;
  ploId: string | null;
}

interface ProgramCloPloFiltersProps {
  semesters: readonly number[];
  plos: readonly PloHeader[];
  value: ProgramCloPloFilterValues;
  onChange: (value: ProgramCloPloFilterValues) => void;
}

export function ProgramCloPloFilters({
  semesters,
  plos,
  value,
  onChange,
}: ProgramCloPloFiltersProps) {
  return (
    <Flex gap="small" wrap>
      <Select
        allowClear
        placeholder="Học kỳ"
        aria-label="Lọc theo học kỳ"
        style={{ width: 140 }}
        value={value.semester}
        options={semesters.map((semester) => ({
          value: semester,
          label: `Học kỳ ${semester}`,
        }))}
        onChange={(semester: number | undefined) =>
          onChange({ ...value, semester: semester ?? null })
        }
      />
      <Select
        allowClear
        placeholder="PLO"
        aria-label="Lọc theo PLO"
        style={{ width: 160 }}
        value={value.ploId}
        options={plos.map((plo) => ({ value: plo.id, label: plo.ploCode }))}
        onChange={(ploId: string | undefined) =>
          onChange({ ...value, ploId: ploId ?? null })
        }
      />
    </Flex>
  );
}
