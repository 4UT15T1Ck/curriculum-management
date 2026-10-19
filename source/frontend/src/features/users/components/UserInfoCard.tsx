import { useState } from 'react';
import { App, Button, Card, Descriptions, Popconfirm, Space, Tag } from 'antd';
import { useMe } from '../../../shared/auth/useMe';
import type { UserDetail } from '../api/users';
import {
  useDisableUser,
  useEnableUser,
  useResetUserPassword,
} from '../hooks/useUsers';
import {
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
} from '../constants/userLabels';
import { UserFormModal } from './UserFormModal';
import { TemporaryPasswordModal } from './TemporaryPasswordModal';

interface UserInfoCardProps {
  user: UserDetail;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const { data: me } = useMe();
  const { modal } = App.useApp();
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const disable = useDisableUser();
  const enable = useEnableUser();
  const reset = useResetUserPassword();
  function confirmDisable() {
    modal.confirm({
      title: 'Vô hiệu hóa tài khoản?',
      content:
        'Người này sẽ bị đăng xuất ở lần thao tác tiếp theo và không đăng nhập được nữa. Dữ liệu và lịch sử của họ vẫn giữ nguyên.',
      onOk: () => disable.mutate(user.id),
    });
  }
  return (
    <Card
      title="Thông tin tài khoản"
      extra={
        <Space>
          <Button onClick={() => setEditing(true)}>Sửa</Button>
          <Button
            onClick={() =>
              reset.mutate(user.id, {
                onSuccess: (result) => setPassword(result.temporaryPassword),
              })
            }
          >
            Đặt lại mật khẩu
          </Button>
          {user.status === 'ACTIVE' && me?.id !== user.id && (
            <Button danger onClick={confirmDisable}>
              Vô hiệu hóa
            </Button>
          )}
          {user.status === 'DISABLED' && (
            <Popconfirm
              title="Kích hoạt lại tài khoản?"
              onConfirm={() => enable.mutate(user.id)}
            >
              <Button>Kích hoạt lại</Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <Descriptions column={2}>
        <Descriptions.Item label="Tên đăng nhập">
          {user.username}
        </Descriptions.Item>
        <Descriptions.Item label="Mã người dùng">
          {user.userCode}
        </Descriptions.Item>
        <Descriptions.Item label="Họ tên">{user.fullName}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Đơn vị">
          {user.orgUnit?.unitName ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={USER_STATUS_COLORS[user.status]}>
            {USER_STATUS_LABELS[user.status]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Mật khẩu">
          {user.mustChangePassword ? 'Cần đổi khi đăng nhập' : 'Đã thiết lập'}
        </Descriptions.Item>
      </Descriptions>
      <UserFormModal
        open={editing}
        mode="edit"
        initial={user}
        onClose={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
      <TemporaryPasswordModal
        username={user.username}
        temporaryPassword={password}
        onClose={() => setPassword(null)}
      />
    </Card>
  );
}
