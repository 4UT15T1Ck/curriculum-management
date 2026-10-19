import { Badge, Flex, Result, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { NO_GAPS } from '../constants/outcomeLabels';

interface CoverageSectionProps<T extends object> {
  title: string;
  rows: readonly T[];
  rowKey: (row: T) => string;
  columns: TableColumnsType<T>;
}

// One gap list: its title, how many rows it has, and either the rows or a success note.
export function CoverageSection<T extends object>({
  title,
  rows,
  rowKey,
  columns,
}: CoverageSectionProps<T>) {
  return (
    <section>
      <Flex align="center" gap="small">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        <Badge
          count={rows.length}
          showZero
          color={rows.length ? 'orange' : 'green'}
        />
      </Flex>
      {rows.length === 0 ? (
        <Result status="success" title={NO_GAPS} />
      ) : (
        <Table<T>
          size="small"
          rowKey={rowKey}
          pagination={false}
          columns={columns}
          dataSource={[...rows]}
        />
      )}
    </section>
  );
}
