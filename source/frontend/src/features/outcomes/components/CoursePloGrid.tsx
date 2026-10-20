import { Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { CoursePloMatrix, CoursePloRow } from '../api/outcomes';
import { WeightCell } from './WeightCell';

interface CoursePloGridProps {
  matrix: CoursePloMatrix;
}

// Rows are the curriculum rows in semester order, columns the PLOs; a filled cell is a course that contributes.
export function CoursePloGrid({ matrix }: CoursePloGridProps) {
  const columns: TableColumnsType<CoursePloRow> = [
    {
      title: 'HK',
      dataIndex: 'plannedSemester',
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Học phần',
      fixed: 'left',
      width: 260,
      render: (_value, row) =>
        `${row.course.courseCode} — ${row.course.courseName}`,
    },
    ...matrix.plos.map((plo) => ({
      key: plo.id,
      width: 90,
      title: <Tooltip title={plo.description}>{plo.ploCode}</Tooltip>,
      render: (_value: unknown, row: CoursePloRow) => (
        <WeightCell
          itemId={row.itemId}
          ploId={plo.id}
          cell={row.cells.find((cell) => cell.ploId === plo.id)}
          canEdit={matrix.canEdit}
        />
      ),
    })),
  ];
  return (
    <Table<CoursePloRow>
      size="small"
      rowKey="itemId"
      pagination={false}
      columns={columns}
      dataSource={matrix.rows}
      scroll={{ x: 'max-content' }}
    />
  );
}
