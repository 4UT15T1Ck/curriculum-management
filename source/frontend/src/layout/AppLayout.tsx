import { Layout, Menu, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router';
import { ROUTES } from '../routes';

const MENU_ITEMS = [
  {
    key: ROUTES.health,
    label: <Link to={ROUTES.health}>Trạng thái hệ thống</Link>,
  },
];

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
          Quản lý Chương trình đào tạo
        </Typography.Title>
      </Layout.Header>
      <Layout>
        <Layout.Sider breakpoint="lg" collapsedWidth={0} theme="light">
          <Menu mode="inline" selectedKeys={[pathname]} items={MENU_ITEMS} />
        </Layout.Sider>
        <Layout.Content style={{ padding: 24 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
