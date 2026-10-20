// Template: Layout chuẩn cho trang danh sách.
// Dùng khi trang gồm: header (title + action) + filter bar + table.
//
// Ví dụ dùng:
//   <ListPageLayout
//     header={<PageHeader title="Tài khoản" actions={<Button>Thêm</Button>} />}
//     filters={
//       <>
//         <Input.Search ... />
//         <Select ... />
//       </>
//     }
//     table={<DataTable ... />}
//   />

import { Space } from 'antd';
import type { ReactNode } from 'react';

interface ListPageLayoutProps {
  /** PageHeader component (title + action buttons) */
  header: ReactNode;
  /** Filter controls — wrapped trong Space wrap tự động */
  filters: ReactNode;
  /** DataTable hoặc Table component */
  table: ReactNode;
}

export function ListPageLayout({ header, filters, table }: ListPageLayoutProps) {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', display: 'flex' }}>
      {header}
      <Space wrap>{filters}</Space>
      {table}
    </Space>
  );
}
