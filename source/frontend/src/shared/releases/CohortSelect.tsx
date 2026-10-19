import { Select } from 'antd';
import { useCohorts } from './useReleaseOptions';

interface CohortSelectProps {
  value?: string[];
  onChange?: (ids: string[]) => void;
  disabled?: boolean;
  id?: string;
}

// Zero cohorts is a valid choice: the version is released first and cohorts are assigned later.
export function CohortSelect({
  value,
  onChange,
  disabled,
  id,
}: CohortSelectProps) {
  const { data, isPending } = useCohorts();
  return (
    <Select
      id={id}
      mode="multiple"
      value={value}
      onChange={onChange}
      loading={isPending}
      disabled={disabled}
      placeholder="Không gán khóa nào"
      showSearch
      optionFilterProp="label"
      options={(data ?? []).map((cohort) => ({
        value: cohort.id,
        label: `${cohort.cohortCode} (tuyển sinh ${cohort.intakeYear})`,
      }))}
    />
  );
}
