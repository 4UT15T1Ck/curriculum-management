import { Card, List } from 'antd';
import type { CourseUsage } from '../api/courses';

interface ProgramsUsingListProps {
  programs: CourseUsage[];
}

// Empty until the curriculum exists (F-07); shown only when there is something to list (FR-17).
export function ProgramsUsingList({ programs }: ProgramsUsingListProps) {
  if (programs.length === 0) return null;
  return (
    <Card title="Được dùng ở">
      <List
        dataSource={programs}
        renderItem={(program) => (
          <List.Item>
            {program.programCode} — {program.programName}
            {program.versionLabel ? ` (${program.versionLabel})` : ''}
          </List.Item>
        )}
      />
    </Card>
  );
}
