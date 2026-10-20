import { Select } from 'antd';
import { semesterLabel } from './semesters';
import { useSemesters } from './useReleaseOptions';

interface SemesterSelectProps {
  value?: string;
  onChange?: (id: string) => void;
  disabled?: boolean;
  id?: string;
}

// The semester of a release. A semester without a start date is listed (so R1 sees it exists) but cannot be chosen:
// a release is scheduled by the start date, never guessed from the signed date.
export function SemesterSelect({
  value,
  onChange,
  disabled,
  id,
}: SemesterSelectProps) {
  const { data, isPending } = useSemesters();
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      loading={isPending}
      disabled={disabled}
      placeholder="Chọn học kỳ"
      showSearch
      optionFilterProp="label"
      options={(data ?? []).map((semester) => ({
        value: semester.id,
        label: semesterLabel(semester),
        disabled: semester.startDate === null,
      }))}
    />
  );
}
