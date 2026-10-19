import { Card, Col, Row, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { sumDecimals } from '../../../shared/decimal/decimal';
import type { BlockTotal, Curriculum, SemesterTotal } from '../api/curriculum';
import { NO_BLOCK_LABEL } from '../constants/curriculumLabels';

interface CurriculumTotalsProps {
  curriculum: Curriculum;
  // When a block is filtered, its total is the one worth reading.
  highlightedBlock?: string | null;
}

const SEMESTER_COLUMNS: TableColumnsType<SemesterTotal> = [
  { title: 'Học kỳ', dataIndex: 'semester' },
  { title: 'Số HP', dataIndex: 'itemCount', align: 'right' },
  { title: 'Bắt buộc', dataIndex: 'compulsoryCredits', align: 'right' },
  { title: 'Tự chọn', dataIndex: 'electiveCredits', align: 'right' },
  { title: 'Tổng TC', dataIndex: 'totalCredits', align: 'right' },
];

// Totals come from the server; the client only adds the semester strings for the grand total, without float arithmetic.
export function CurriculumTotals({
  curriculum,
  highlightedBlock,
}: CurriculumTotalsProps) {
  const grandTotal = sumDecimals(
    curriculum.semesters.map((semester) => semester.totalCredits),
  );
  const blockColumns: TableColumnsType<BlockTotal> = [
    {
      title: 'Khối kiến thức',
      render: (_value, block) => (
        <span title={block.blockName ?? undefined}>
          {block.symbol ?? NO_BLOCK_LABEL}
          {block.blockName ? ` — ${block.blockName}` : ''}
        </span>
      ),
    },
    { title: 'Số HP', dataIndex: 'itemCount', align: 'right' },
    { title: 'Tổng TC', dataIndex: 'totalCredits', align: 'right' },
  ];
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card size="small" title="Tín chỉ theo học kỳ">
          <Table<SemesterTotal>
            size="small"
            rowKey="semester"
            pagination={false}
            columns={SEMESTER_COLUMNS}
            dataSource={curriculum.semesters}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Typography.Text strong>Tổng cộng</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Typography.Text strong>{grandTotal}</Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card size="small" title="Tín chỉ theo khối kiến thức">
          <Table<BlockTotal>
            size="small"
            rowKey={(block) => block.symbol ?? '\u0000none'}
            pagination={false}
            columns={blockColumns}
            dataSource={curriculum.blocks}
            rowClassName={(block) =>
              highlightedBlock !== undefined &&
              block.symbol === highlightedBlock
                ? 'ant-table-row-selected'
                : ''
            }
          />
        </Card>
      </Col>
    </Row>
  );
}
