import { Card, Col, Row, Tooltip } from 'antd';
import type { ProgramDetail } from '../api/programs';
import { SECTION_NOT_BUILT_TOOLTIP } from '../constants/programLabels';

interface ProgramSectionLinksProps {
  program: ProgramDetail;
}

// Later features turn their card into a link when they add the route (F-07 the curriculum and elective groups, F-08 the check).
const SECTIONS = [
  'Khung chương trình',
  'Nhóm tự chọn',
  'Kiểm tra nhất quán',
] as const;

export function ProgramSectionLinks({ program }: ProgramSectionLinksProps) {
  return (
    <Row gutter={[16, 16]} data-program-id={program.id}>
      {SECTIONS.map((title) => (
        <Col key={title} xs={24} md={8}>
          <Tooltip title={SECTION_NOT_BUILT_TOOLTIP}>
            <Card size="small" title={title} aria-disabled>
              Chưa có
            </Card>
          </Tooltip>
        </Col>
      ))}
    </Row>
  );
}
