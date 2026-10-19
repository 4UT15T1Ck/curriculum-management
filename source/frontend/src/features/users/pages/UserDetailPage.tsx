import { Flex, Result, Skeleton } from 'antd';
import { useParams } from 'react-router';
import { useUser } from '../hooks/useUsers';
import { UserInfoCard } from '../components/UserInfoCard';
import { RoleAssignmentsCard } from '../components/RoleAssignmentsCard';
import { UserSubjectGroupsCard } from '../components/UserSubjectGroupsCard';

export function UserDetailPage() {
  const { userId = '' } = useParams();
  const { data: user, isPending, isError } = useUser(userId);
  if (isPending) return <Skeleton active />;
  if (isError || !user)
    return <Result status="404" title="Không tìm thấy tài khoản" />;
  return (
    <Flex vertical gap="middle">
      <UserInfoCard user={user} />
      <RoleAssignmentsCard userId={userId} />
      <UserSubjectGroupsCard userId={userId} />
    </Flex>
  );
}
