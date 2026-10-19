import { useEffect, useState } from 'react';
import { Flex, Input, Segmented, Select } from 'antd';
import { PERMISSIONS } from '../../../shared/auth/permissions';
import { useCan } from '../../../shared/auth/useCan';
import { OrgUnitSelect } from '../../../shared/org-units/OrgUnitSelect';
import { useSubjectGroups } from '../../../shared/subject-groups/useSubjectGroups';
import type { CourseQuery, CourseStatus, CourseType } from '../api/courses';
import {
  COURSE_STATUS_LABELS,
  COURSE_TYPE_LABELS,
  FOREIGN_COURSE_LABEL,
} from '../constants/courseLabels';

export const COURSE_SEARCH_DEBOUNCE_MS = 300;

type Origin = 'all' | 'own' | 'foreign';
const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'own', label: 'Của Khoa' },
  { value: 'foreign', label: FOREIGN_COURSE_LABEL },
];

interface CourseFiltersProps {
  value: CourseQuery;
  onChange: (filters: Partial<CourseQuery>) => void;
}

function toOrigin(foreign: boolean | undefined): Origin {
  if (foreign === undefined) return 'all';
  return foreign ? 'foreign' : 'own';
}

function toForeign(origin: Origin): boolean | undefined {
  if (origin === 'all') return undefined;
  return origin === 'foreign';
}

function options<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((key) => ({
    value: key,
    label: labels[key],
  }));
}

export function CourseFilters({ value, onChange }: CourseFiltersProps) {
  const [search, setSearch] = useState(value.q ?? '');
  const canEdit = useCan(PERMISSIONS.courseEdit);
  const canViewGroups = useCan(PERMISSIONS.subjectGroupView);
  const { data: groups = [] } = useSubjectGroups(
    { facultyId: value.ownerFacultyId },
    canViewGroups,
  );
  const wanted = search.trim();
  useEffect(() => {
    if (wanted === (value.q ?? '')) return;
    const timer = setTimeout(
      () => onChange({ q: wanted || undefined }),
      COURSE_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [wanted, value.q, onChange]);
  const statuses = canEdit
    ? COURSE_STATUS_LABELS
    : {
        ACTIVE: COURSE_STATUS_LABELS.ACTIVE,
        DISCONTINUED: COURSE_STATUS_LABELS.DISCONTINUED,
      };
  return (
    <Flex wrap gap="small">
      <Input.Search
        allowClear
        placeholder="Tìm theo mã hoặc tên học phần"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{ width: 280 }}
      />
      <OrgUnitSelect
        types={['FACULTY']}
        value={value.ownerFacultyId}
        onChange={(ownerFacultyId) =>
          onChange({
            ownerFacultyId: ownerFacultyId ?? undefined,
            ownerGroupId: undefined,
          })
        }
      />
      {canViewGroups && (
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Nhóm chuyên môn"
          style={{ minWidth: 200 }}
          value={value.ownerGroupId}
          options={groups.map((group) => ({
            value: group.id,
            label: group.groupName,
          }))}
          onChange={(ownerGroupId?: string) => onChange({ ownerGroupId })}
        />
      )}
      <Select
        allowClear
        placeholder="Loại học phần"
        style={{ minWidth: 160 }}
        value={value.courseType}
        options={options<CourseType>(COURSE_TYPE_LABELS)}
        onChange={(courseType?: CourseType) => onChange({ courseType })}
      />
      <Select
        allowClear
        placeholder="Trạng thái"
        style={{ minWidth: 150 }}
        value={value.status?.[0]}
        options={options<CourseStatus>(
          statuses as Record<CourseStatus, string>,
        )}
        onChange={(status?: CourseStatus) =>
          onChange({ status: status ? [status] : undefined })
        }
      />
      <Segmented<Origin>
        options={ORIGIN_OPTIONS}
        value={toOrigin(value.foreign)}
        onChange={(origin) => onChange({ foreign: toForeign(origin) })}
      />
    </Flex>
  );
}
