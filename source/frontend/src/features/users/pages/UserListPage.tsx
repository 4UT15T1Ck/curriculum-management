import { useState } from 'react';
import {
  Button,
  Input,
  Result,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { Link, generatePath } from 'react-router';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../../shared/api/pagination';
import { ROUTES } from '../../../routes';
import { OrgUnitSelect } from '../../../shared/org-units/OrgUnitSelect';
import {
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
} from '../constants/userLabels';
import { useUserList } from '../hooks/useUsers';
import type { CreatedUser, UserListParams, UserSummary } from '../api/users';
import { UserFormModal } from '../components/UserFormModal';
import { TemporaryPasswordModal } from '../components/TemporaryPasswordModal';

export function UserListPage() {
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const { data, isPending, isError } = useUserList(params);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedUser | null>(null);
  const columns: TableColumnsType<UserSummary> = [
    { title: 'Mã người dùng', dataIndex: 'userCode' },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (_, user) => (
        <Link to={generatePath(ROUTES.userDetail, { userId: user.id })}>
          {user.fullName}
        </Link>
      ),
    },
    { title: 'Tên đăng nhập', dataIndex: 'username' },
    { title: 'Đơn vị', render: (_, user) => user.orgUnit?.unitName ?? '—' },
    {
      title: 'Vai trò',
      dataIndex: 'activeRoleCodes',
      render: (roles: string[]) =>
        roles.map((role) => <Tag key={role}>{role}</Tag>),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: UserSummary['status']) => (
        <Tag color={USER_STATUS_COLORS[status]}>
          {USER_STATUS_LABELS[status]}
        </Tag>
      ),
    },
  ];
  if (isError)
    return <Result status="error" title="Không thể tải danh sách tài khoản" />;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography.Title level={2}>Tài khoản</Typography.Title>
      <Space wrap>
        <Input.Search
          placeholder="Tìm tài khoản"
          allowClear
          onSearch={(q) =>
            setParams((current) => ({ ...current, page: 1, q: q || undefined }))
          }
          onChange={(event) => {
            if (!event.target.value)
              setParams((current) => ({ ...current, page: 1, q: undefined }));
          }}
        />
        <OrgUnitSelect
          onChange={(orgUnitId) =>
            setParams((current) => ({
              ...current,
              page: 1,
              orgUnitId: orgUnitId ?? undefined,
            }))
          }
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          options={[
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'DISABLED', label: 'Vô hiệu hóa' },
          ]}
          onChange={(status) =>
            setParams((current) => ({ ...current, page: 1, status }))
          }
        />
        <Button type="primary" onClick={() => setCreating(true)}>
          Thêm tài khoản
        </Button>
      </Space>
      <Table<UserSummary>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isPending}
        locale={{ emptyText: 'Chưa có tài khoản' }}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: data?.total ?? 0,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          onChange: (page, pageSize) =>
            setParams((current) => ({ ...current, page, pageSize })),
        }}
      />
      <UserFormModal
        open={creating}
        mode="create"
        onClose={() => setCreating(false)}
        onSaved={(result) => {
          setCreating(false);
          setCreated(result as CreatedUser);
        }}
      />
      <TemporaryPasswordModal
        username={created?.user.username ?? ''}
        temporaryPassword={created?.temporaryPassword ?? null}
        onClose={() => setCreated(null)}
      />
    </Space>
  );
}
