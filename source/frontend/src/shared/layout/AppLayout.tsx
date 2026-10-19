import { Suspense } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Layout, Menu, Spin, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useLocation } from 'react-router';
import { useMe } from '../auth/useMe';
import { useLogout } from '../auth/useLogout';
import { ROUTES } from '../../routes';
import { APP_MENU, toMenuItems } from './menuItems';

export function AppLayout() {
  const { pathname } = useLocation();
  const { data: me } = useMe();
  const logoutMutation = useLogout();
  const userMenu: MenuProps['items'] = [
    {
      key: ROUTES.account,
      label: <Link to={ROUTES.account}>Tài khoản của tôi</Link>,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      onClick: () => logoutMutation.mutate(),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
          Quản lý Chương trình đào tạo
        </Typography.Title>
        <Dropdown menu={{ items: userMenu }} trigger={['click']}>
          <Button type="text" icon={<UserOutlined />} style={{ color: '#fff' }}>
            {me?.fullName}
          </Button>
        </Dropdown>
      </Layout.Header>
      <Layout>
        <Layout.Sider breakpoint="lg" collapsedWidth={0} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[
              APP_MENU.find(
                (item) =>
                  pathname === item.path ||
                  (item.path !== ROUTES.home &&
                    pathname.startsWith(`${item.path}/`)),
              )?.path ?? pathname,
            ]}
            items={toMenuItems(APP_MENU, me?.permissions ?? [])}
          />
        </Layout.Sider>
        <Layout.Content style={{ padding: 24 }}>
          <Suspense fallback={<Spin />}>
            <Outlet />
          </Suspense>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
