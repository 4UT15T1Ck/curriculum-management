import { Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { RichTextView } from '../../../shared/components/rich-text/RichTextView';
import type { WeeklyContent } from '../api/syllabi';
import { EMPTY_SECTION, NO_WEEKS } from '../constants/syllabusLabels';

interface WeeklyContentViewProps {
  weeks: WeeklyContent[];
}

const COLUMNS: TableColumnsType<WeeklyContent> = [
  { title: 'Tuần', dataIndex: 'weekLabel', width: 110 },
  {
    title: 'Nội dung',
    render: (_value, week) => (
      <RichTextView html={week.content} emptyText={EMPTY_SECTION} />
    ),
  },
  {
    title: 'Hoạt động dạy học',
    render: (_value, week) => (
      <RichTextView html={week.teachingActivities} emptyText="—" />
    ),
  },
];

export function WeeklyContentView({ weeks }: WeeklyContentViewProps) {
  if (weeks.length === 0)
    return <Typography.Text type="secondary">{NO_WEEKS}</Typography.Text>;
  return (
    <Table<WeeklyContent>
      size="small"
      rowKey="id"
      pagination={false}
      columns={COLUMNS}
      dataSource={weeks}
    />
  );
}
