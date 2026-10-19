import { Card, Col, Row, Typography } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { useCan } from '../../../shared/auth/useCan';
import { useSeesMatrices } from '../../../shared/outcomes/useSeesMatrices';
import type { ProgramDetail } from '../api/programs';

interface ProgramSectionLinksProps {
  program: ProgramDetail;
}

// The curriculum, its elective groups and the outcomes open the version being worked on: the Draft, else the current one.
// A student sees the PLO card only; the matrices and the coverage report are staff screens (F11-05).
export function ProgramSectionLinks({ program }: ProgramSectionLinksProps) {
  const canViewOutcomes = useCan('outcome.view');
  const seesMatrices = useSeesMatrices();
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
    ...(canViewOutcomes
      ? [{ title: 'PLO', to: generatePath(ROUTES.plos, params) }]
      : []),
    ...(seesMatrices
      ? [
          {
            title: 'Ma trận học phần–PLO',
            to: generatePath(ROUTES.coursePloMatrix, params),
          },
          {
            title: 'Ma trận CLO–PLO',
            to: generatePath(ROUTES.cloPloMatrix, params),
          },
          {
            title: 'Kiểm tra phủ chuẩn đầu ra',
            to: generatePath(ROUTES.outcomeCoverage, params),
          },
        ]
      : []),
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
