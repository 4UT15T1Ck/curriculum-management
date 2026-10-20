import { Card, Col, List, Row, Space, Tag, Typography } from 'antd';
import type { Curriculum, CurriculumItem } from '../api/curriculum';
import {
  ELECTIVE_KIND_LABELS,
  EMPTY_SEMESTER_LABEL,
} from '../constants/curriculumLabels';
import { CurriculumItemActions } from './CurriculumItemActions';
import { itemElementId } from './CurriculumWarningsPanel';
import { RequisiteTags } from './RequisiteTags';

interface SemesterBoardProps {
  curriculum: Curriculum;
  items: CurriculumItem[];
  onEdit: (item: CurriculumItem) => void;
  onRequisites: (item: CurriculumItem) => void;
}

// One card per semester of the program, empty ones included (US-024 AC2), with the server's credit totals in the header.
export function SemesterBoard({
  curriculum,
  items,
  onEdit,
  onRequisites,
}: SemesterBoardProps) {
  return (
    <Row gutter={[16, 16]}>
      {curriculum.semesters.map((semester) => {
        const rows = items.filter(
          (item) => item.plannedSemester === semester.semester,
        );
        return (
          <Col key={semester.semester} xs={24} md={12} xl={8}>
            <Card
              size="small"
              title={`Học kỳ ${semester.semester} — ${semester.totalCredits} TC (BB ${semester.compulsoryCredits} / TC ${semester.electiveCredits})`}
            >
              {rows.length === 0 ? (
                <Typography.Text type="secondary">
                  {EMPTY_SEMESTER_LABEL}
                </Typography.Text>
              ) : (
                <List
                  size="small"
                  dataSource={rows}
                  renderItem={(item) => (
                    <List.Item
                      id={itemElementId(item.id)}
                      actions={[
                        <CurriculumItemActions
                          key="actions"
                          versionId={curriculum.version.id}
                          item={item}
                          onEdit={onEdit}
                          onRequisites={onRequisites}
                        />,
                      ]}
                    >
                      <Space direction="vertical" size={2}>
                        <span>
                          {item.course.courseCode} — {item.course.courseName} (
                          {item.course.credits} TC){' '}
                          {item.isElective && (
                            <Tag>{ELECTIVE_KIND_LABELS.elective}</Tag>
                          )}
                          {item.electiveGroup && (
                            <Tag>{item.electiveGroup.groupCode}</Tag>
                          )}
                        </span>
                        <RequisiteTags item={item} />
                      </Space>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
