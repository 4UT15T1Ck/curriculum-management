import { Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { RichTextView } from '../../../shared/components/rich-text/RichTextView';
import type { Clo, WeeklyContent } from '../api/syllabi';
import {
  EMPTY_SECTION,
  NO_WEEKS,
  WEEKLY_CLO_COLUMN,
} from '../constants/syllabusLabels';
import { CloCodes } from './CloCodes';

interface WeeklyContentViewProps {
  weeks: WeeklyContent[];
  clos: Clo[];
}

const columnsFor = (clos: Clo[]): TableColumnsType<WeeklyContent> => [
  { title: 'Tuần', dataIndex: 'weekLabel', width: 110 },
  {
    title: 'Nội dung',
    render: (_value, week) => (
      <RichTextView html={week.content} emptyText={EMPTY_SECTION} />
    ),
  },
  {
    title: WEEKLY_CLO_COLUMN,
    width: 110,
    render: (_value, week) => <CloCodes cloIds={week.cloIds} clos={clos} />,
  },
  {
    title: 'Hoạt động dạy học',
    render: (_value, week) => (
      <RichTextView html={week.teachingActivities} emptyText="—" />
    ),
  },
];

export function WeeklyContentView({ weeks, clos }: WeeklyContentViewProps) {
  if (weeks.length === 0)
    return <Typography.Text type="secondary">{NO_WEEKS}</Typography.Text>;
  return (
    <Table<WeeklyContent>
      size="small"
      rowKey="id"
      pagination={false}
      columns={columnsFor(clos)}
      dataSource={weeks}
    />
  );
}
