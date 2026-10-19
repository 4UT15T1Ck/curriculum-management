import { Tag } from 'antd';
import type { SubjectGroupSummary } from '../../../shared/subject-groups/subjectGroups';
import { NO_COORDINATOR_LABEL } from '../constants/subjectGroupLabels';
interface CoordinatorCellProps {
  group: SubjectGroupSummary;
}
export function CoordinatorCell({ group }: CoordinatorCellProps) {
  if (group.status === 'ACTIVE' && !group.hasActiveCoordinator)
    return <Tag color="orange">{NO_COORDINATOR_LABEL}</Tag>;
  return (
    <>
      {group.activeCoordinators.map((person) => person.fullName).join(', ') ||
        '—'}
    </>
  );
}
