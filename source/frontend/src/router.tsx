import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from './layout/AppLayout';
import { HealthPage } from './pages/HealthPage';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.health} replace /> },
      { path: ROUTES.health, element: <HealthPage /> },
    ],
  },
]);
