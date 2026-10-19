import { Card, Col, Row, Tooltip, Typography } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import type { ProgramDetail } from '../api/programs';
import { SECTION_NOT_BUILT_TOOLTIP } from '../constants/programLabels';

interface ProgramSectionLinksProps {
  program: ProgramDetail;
}

// The curriculum and its elective groups open the version being worked on: the Draft, else the current one.
// Later features turn their card into a link when they add the route (F-08 the consistency check).
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
      <Col xs={24} md={8}>
        <Tooltip title={SECTION_NOT_BUILT_TOOLTIP}>
          <Card size="small" title="Kiểm tra nhất quán" aria-disabled>
            Chưa có
          </Card>
        </Tooltip>
      </Col>
    </Row>
  );
}
