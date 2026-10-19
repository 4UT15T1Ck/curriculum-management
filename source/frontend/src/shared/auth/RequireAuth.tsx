import { Result, Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '../../routes';
import { useMe } from './useMe';

export interface LoginRedirectState {
  from: string;
}

export function RequireAuth() {
  const { data: me, isPending, isError } = useMe();
  const { pathname } = useLocation();
  if (isPending) return <Spin fullscreen />;
  if (isError)
    return (
      <Result status="error" title="Không kết nối được máy chủ ứng dụng" />
    );
  if (me === null)
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: pathname } satisfies LoginRedirectState}
      />
    );
  if (me.mustChangePassword && pathname !== ROUTES.account)
    return <Navigate to={ROUTES.account} replace />;
  return <Outlet />;
}
