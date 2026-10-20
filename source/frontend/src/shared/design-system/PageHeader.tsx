// Molecule: Header chuẩn cho mọi trang — title bên trái, actions bên phải.
// Thay thế pattern <Typography.Title level={2}> + <Space> lặp trong mỗi page.
//
// Ví dụ dùng:
//   <PageHeader
//     title="Tài khoản"
//     actions={<Button type="primary" onClick={...}>Thêm tài khoản</Button>}
//   />

import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Tiêu đề trang, hiển thị ở bên trái */
  title: string;
  /** Các nút hành động, hiển thị ở bên phải */
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ marginBottom: 16 }}
    >
      <Typography.Title level={2} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {actions && <Flex gap={8}>{actions}</Flex>}
    </Flex>
  );
}
