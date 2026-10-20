import { Collapse, Empty, Flex, Table, Tag, Typography } from 'antd';
import type { ChangeDiff, DiffSection } from '../api/changeRequests';
import {
  DIFF_CHANGE_COLORS,
  DIFF_CHANGE_LABELS,
  LIVE_DIFF_NOTE,
  NO_CHANGES_YET,
} from '../constants/changeRequestLabels';

interface DiffViewProps {
  diff: ChangeDiff;
}

type DiffRow = DiffSection['rows'][number];
type DiffField = DiffRow['fields'][number];

const EMPTY_VALUE = '—';
const LONG_TEXT_LENGTH = 80;

function FieldValue({ value }: { value: string | null }) {
  if (value === null)
    return <Typography.Text type="secondary">{EMPTY_VALUE}</Typography.Text>;
  // Long text (syllabus sections, weekly rows) keeps its line breaks and scrolls instead of widening the page.
  return value.length > LONG_TEXT_LENGTH || value.includes('\n') ? (
    <pre
      style={{
        margin: 0,
        maxHeight: 240,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {value}
    </pre>
  ) : (
    <>{value}</>
  );
}

function RowBlock({ row }: { row: DiffRow }) {
  return (
    <Flex vertical gap="small">
      <Flex gap="small" align="center" wrap>
        <Tag color={DIFF_CHANGE_COLORS[row.change]}>
          {DIFF_CHANGE_LABELS[row.change]}
        </Tag>
        <Typography.Text strong>{row.label}</Typography.Text>
      </Flex>
      {row.fields.length > 0 && (
        <Table<DiffField>
          size="small"
          rowKey="name"
          pagination={false}
          dataSource={row.fields}
          columns={[
            { title: 'Trường', dataIndex: 'label', width: '22%' },
            {
              title: 'Trước',
              dataIndex: 'before',
              render: (value: string | null) => <FieldValue value={value} />,
            },
            {
              title: 'Sau',
              dataIndex: 'after',
              render: (value: string | null) => <FieldValue value={value} />,
            },
          ]}
        />
      )}
    </Flex>
  );
}

// One panel per kind of change; rows of a panel show what the approvers will read before and after.
export function DiffView({ diff }: DiffViewProps) {
  if (diff.sections.length === 0) return <Empty description={NO_CHANGES_YET} />;
  return (
    <Flex vertical gap="small">
      {diff.live && (
        <Typography.Text type="secondary">{LIVE_DIFF_NOTE}</Typography.Text>
      )}
      <Collapse
        defaultActiveKey={diff.sections.map((section) => section.entityType)}
        items={diff.sections.map((section) => ({
          key: section.entityType,
          label: `${section.title} (${section.rows.length})`,
          children: (
            <Flex vertical gap="middle">
              {section.rows.map((row) => (
                <RowBlock key={row.itemKey} row={row} />
              ))}
            </Flex>
          ),
        }))}
      />
    </Flex>
  );
}
