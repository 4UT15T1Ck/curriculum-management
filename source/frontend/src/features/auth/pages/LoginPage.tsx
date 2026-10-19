import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { Navigate, useLocation, useNavigate } from 'react-router';
import type { LoginRedirectState } from '../../../shared/auth/RequireAuth';
import { useMe } from '../../../shared/auth/useMe';
import { ROUTES } from '../../../routes';
import type { LoginRequest } from '../api/auth';
import { useLogin } from '../hooks/useLogin';
import { REQUIRED_PASSWORD, REQUIRED_USERNAME } from '../schema/authRules';

const CARD_WIDTH = 360;

export function LoginPage() {
  const { data: me } = useMe();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const from =
    (useLocation().state as LoginRedirectState | null)?.from ?? ROUTES.home;
  if (me) return <Navigate to={from} replace />;
  const onFinish = (values: LoginRequest) =>
    loginMutation.mutate(values, {
      onSuccess: () => void navigate(from, { replace: true }),
    });
  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: CARD_WIDTH }}>
        <Typography.Title level={4}>
          Quản lý Chương trình đào tạo
        </Typography.Title>
        {loginMutation.isError && (
          <Alert
            type="error"
            showIcon
            title={loginMutation.error.message}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form<LoginRequest>
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={REQUIRED_USERNAME}
          >
            <Input autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={REQUIRED_PASSWORD}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loginMutation.isPending}
          >
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </Flex>
  );
}
