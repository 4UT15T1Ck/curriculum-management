import { List, Typography } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { versionLabel } from '../../../shared/constants/versionLabels';
import type { CourseUsage } from '../api/courses';
import { NOT_USED_BY_PROGRAMS } from '../constants/courseLabels';

interface ProgramsUsingListProps {
  programs: CourseUsage[];
}

// One line per program version still in play, with the semester the course is planned in (FR-17, US-028).
export function ProgramsUsingList({ programs }: ProgramsUsingListProps) {
  if (programs.length === 0)
    return (
      <Typography.Text type="secondary">{NOT_USED_BY_PROGRAMS}</Typography.Text>
    );
  return (
    <List
      size="small"
      dataSource={programs}
      renderItem={(program) => (
        <List.Item>
          <Link
            to={generatePath(ROUTES.programDetail, {
              programId: program.programId,
            })}
          >
            {program.programCode} — {program.programName}
          </Link>
          {` (${versionLabel({ versionNumber: program.versionLabel })}, học kỳ ${program.plannedSemester})`}
        </List.Item>
      )}
    />
  );
}
