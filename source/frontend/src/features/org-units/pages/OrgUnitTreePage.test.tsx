import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { OrgUnitTreePage } from './OrgUnitTreePage';
import type { OrgUnit } from '../../../shared/org-units/orgUnits';

describe('OrgUnitTreePage', () => {
  it('renders units and groups from their list endpoints', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) =>
      Promise.resolve(
        new Response(
          JSON.stringify(
            String(input).endsWith('/org-units')
              ? [
                  {
                    id: 'u',
                    unitCode: 'UNI',
                    unitName: 'Trường',
                    unitType: 'UNIVERSITY',
                    parentUnitId: null,
                    status: 'ACTIVE',
                  },
                  {
                    id: 'f',
                    unitCode: 'F',
                    unitName: 'Khoa Toán',
                    unitType: 'FACULTY',
                    parentUnitId: 'u',
                    status: 'ACTIVE',
                  },
                ]
              : [
                  {
                    id: 'g',
                    groupCode: 'G',
                    groupName: 'Đại số',
                    faculty: { id: 'f', unitCode: 'F', unitName: 'Khoa Toán' },
                    status: 'ACTIVE',
                    activeMemberCount: 1,
                    activeCoordinators: [],
                    hasActiveCoordinator: false,
                  },
                ],
          ),
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <App>
          <OrgUnitTreePage />
        </App>
      </QueryClientProvider>,
    );
    expect(await screen.findByText('Khoa Toán')).toBeInTheDocument();
    expect(await screen.findByText('Đại số')).toBeInTheDocument();
  });
  it('creates a faculty and refetches the shared org-unit list', async () => {
    const root: OrgUnit = {
      id: 'u',
      unitCode: 'UNI',
      unitName: 'Trường',
      unitType: 'UNIVERSITY',
      parentUnitId: null,
      status: 'ACTIVE',
    };
    const created: OrgUnit = {
      id: 'f',
      unitCode: 'F',
      unitName: 'Khoa Toán',
      unitType: 'FACULTY',
      parentUnitId: 'u',
      status: 'ACTIVE',
    };
    let units: OrgUnit[] = [root];
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/org-units') && init?.method === 'POST') {
        units = [...units, created];
        return Promise.resolve(new Response(JSON.stringify(created)));
      }
      if (url.endsWith('/org-units'))
        return Promise.resolve(new Response(JSON.stringify(units)));
      return Promise.resolve(new Response('[]'));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <App>
          <OrgUnitTreePage />
        </App>
      </QueryClientProvider>,
    );
    await screen.findByText('Trường');
    fireEvent.click(screen.getByRole('button', { name: 'Thêm đơn vị' }));
    fireEvent.change(screen.getByLabelText('Mã đơn vị'), {
      target: { value: 'F' },
    });
    fireEvent.change(screen.getByLabelText('Tên đơn vị'), {
      target: { value: 'Khoa Toán' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(await screen.findByText('Khoa Toán')).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).endsWith('/org-units') && init?.method === 'POST',
      ),
    ).toBe(true);
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) =>
          String(url).endsWith('/org-units') && init?.method !== 'POST',
      ).length,
    ).toBeGreaterThan(1);
  });
});
