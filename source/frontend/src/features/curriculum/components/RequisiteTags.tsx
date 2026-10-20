import { Space, Tag, Tooltip } from 'antd';
import type { CurriculumItem } from '../api/curriculum';
import {
  REQUISITE_LATER_TOOLTIP,
  REQUISITE_TYPE_LABELS,
} from '../constants/curriculumLabels';

interface RequisiteTagsProps {
  item: CurriculumItem;
}

// Prior-study and prerequisite sources should sit in an earlier semester; a corequisite may share or follow it.
const ORDERED_TYPES = ['PRIOR', 'PREREQUISITE'];

export function RequisiteTags({ item }: RequisiteTagsProps) {
  if (item.requisites.length === 0) return null;
  return (
    <Space size={[4, 4]} wrap>
      {item.requisites.map((requisite) => {
        const later =
          ORDERED_TYPES.includes(requisite.relationType) &&
          requisite.sourceSemester !== null &&
          requisite.sourceSemester >= item.plannedSemester;
        const tag = (
          <Tag
            key={requisite.id}
            color={later ? 'error' : undefined}
            variant={later ? 'outlined' : undefined}
          >
            {REQUISITE_TYPE_LABELS[requisite.relationType]}:{' '}
            {requisite.sourceCourse.courseCode}
            {requisite.minScore !== null && ` ≥ ${requisite.minScore}`}
          </Tag>
        );
        return later && requisite.sourceSemester !== null ? (
          <Tooltip
            key={requisite.id}
            title={REQUISITE_LATER_TOOLTIP(requisite.sourceSemester)}
          >
            {tag}
          </Tooltip>
        ) : (
          tag
        );
      })}
    </Space>
  );
}
