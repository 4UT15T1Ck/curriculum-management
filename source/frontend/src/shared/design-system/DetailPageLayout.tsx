// Template: Layout chuẩn cho trang chi tiết.
// Dùng khi trang gồm nhiều Card/section xếp dọc (UserDetailPage, SubjectGroupDetailPage, …)
//
// Ví dụ dùng:
//   <DetailPageLayout>
//     <UserInfoCard user={user} />
//     <RoleAssignmentsCard userId={userId} />
//     <UserSubjectGroupsCard userId={userId} />
//   </DetailPageLayout>

import { Flex } from 'antd';
import type { ReactNode } from 'react';

interface DetailPageLayoutProps {
  children: ReactNode;
}

export function DetailPageLayout({ children }: DetailPageLayoutProps) {
  return (
    <Flex vertical gap="middle" style={{ maxWidth: 1200 }}>
      {children}
    </Flex>
  );
}
