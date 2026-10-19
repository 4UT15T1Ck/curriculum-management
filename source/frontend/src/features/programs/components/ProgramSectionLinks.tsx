import { Card, Col, Row, Typography } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import type { ProgramDetail } from '../api/programs';

interface ProgramSectionLinksProps {
  program: ProgramDetail;
}

// The curriculum and its elective groups open the version being worked on: the Draft, else the current one.
export function ProgramSectionLinks({ program }: ProgramSectionLinksProps) {
  const workingVersion = program.draftVersion ?? program.currentVersion;
  const params = { programId: program.id, versionId: workingVersion.id };
  const sections = [
    {
      title: 'Khung chương trình',
      to: generatePath(ROUTES.curriculum, params),
    },
    {
      title: 'Nhóm tự chọn',
      to: generatePath(ROUTES.electiveGroups, params),
    },
    {
      title: 'Kiểm tra nhất quán',
      to: generatePath(ROUTES.consistency, params),
    },
  ];
  return (
    <Row gutter={[16, 16]} data-program-id={program.id}>
      {sections.map(({ title, to }) => (
        <Col key={title} xs={24} md={8}>
          <Link to={to} aria-label={title}>
            <Card size="small" title={title} hoverable>
              <Typography.Text>Mở</Typography.Text>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
}
