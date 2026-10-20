import { useState } from 'react';
import { Button, Flex, Input, Result, Select, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Link, generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../../shared/api/pagination';
import { PERMISSIONS } from '../../../shared/auth/permissions';
import { useCanEditSchoolWide } from '../../../shared/auth/useCan';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import type {
  DegreeLevel,
  ProgramQuery,
  ProgramStatus,
  ProgramSummary,
} from '../api/programs';
import { ProgramStatusTag } from '../components/ProgramStatusTag';
import {
  ALL_STATUSES_LABEL,
  DEGREE_LEVEL_LABELS,
  PROGRAM_STATUS_LABELS,
  versionLabel,
} from '../constants/programLabels';
import { useProgramList } from '../hooks/usePrograms';

export const PROGRAM_SEARCH_DEBOUNCE_MS = 300;
const ALL_STATUSES = 'ALL';
const NO_DIRECTOR_LABEL = '—';

const levelOptions = (Object.keys(DEGREE_LEVEL_LABELS) as DegreeLevel[]).map(
  (value) => ({ value, label: DEGREE_LEVEL_LABELS[value] }),
);
const statusOptions = [
  { value: ALL_STATUSES, label: ALL_STATUSES_LABEL },
  ...(Object.keys(PROGRAM_STATUS_LABELS) as ProgramStatus[]).map((value) => ({
    value,
    label: PROGRAM_STATUS_LABELS[value],
  })),
];

export function ProgramListPage() {
  const [filters, setFilters] = useState<
    Pick<ProgramQuery, 'degreeLevel' | 'status'>
  >({ status: 'ACTIVE' });
  const [search, setSearch] = useState('');
  const [paging, setPaging] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const q = useDebouncedValue(search.trim(), PROGRAM_SEARCH_DEBOUNCE_MS);
  const query: ProgramQuery = { ...paging, ...filters, q: q || undefined };
  const { data, isFetching, isError } = useProgramList(query);
  const canCreate = useCanEditSchoolWide(PERMISSIONS.programEditInfo);
  const navigate = useNavigate();
  const applyFilters = (next: typeof filters) => {
    setFilters(next);
    setPaging((current) => ({ ...current, page: 1 }));
  };
  const columns: TableColumnsType<ProgramSummary> = [
    {
      title: 'Mã',
      dataIndex: 'programCode',
      render: (code: string, row) => (
        <Link to={generatePath(ROUTES.programDetail, { programId: row.id })}>
          {code}
        </Link>
      ),
    },
    { title: 'Tên chương trình', dataIndex: 'programName' },
    {
      title: 'Trình độ',
      dataIndex: 'degreeLevel',
      render: (level: DegreeLevel) => DEGREE_LEVEL_LABELS[level],
    },
    {
      title: 'Phiên bản hiện hành',
      render: (_value, row) => versionLabel(row.currentVersion),
    },
    {
      title: 'Giám đốc CTĐT',
      render: (_value, row) =>
        row.directors.map((user) => user.fullName).join(', ') ||
        NO_DIRECTOR_LABEL,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: ProgramStatus) => <ProgramStatusTag status={status} />,
    },
  ];
  if (isError)
    return (
      <Result status="error" title="Không thể tải danh sách chương trình" />
    );
  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Chương trình đào tạo
        </Typography.Title>
        {canCreate && (
          <Button
            type="primary"
            onClick={() => void navigate(ROUTES.programNew)}
          >
            Thêm chương trình
          </Button>
        )}
      </Flex>
      <Flex wrap gap="small">
        <Input.Search
          allowClear
          placeholder="Tìm theo mã hoặc tên chương trình"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPaging((current) => ({ ...current, page: 1 }));
          }}
          style={{ width: 280 }}
        />
        <Select
          allowClear
          placeholder="Trình độ"
          style={{ minWidth: 140 }}
          value={filters.degreeLevel}
          options={levelOptions}
          onChange={(degreeLevel?: DegreeLevel) =>
            applyFilters({ ...filters, degreeLevel })
          }
        />
        <Select
          aria-label="Trạng thái"
          style={{ minWidth: 160 }}
          value={filters.status ?? ALL_STATUSES}
          options={statusOptions}
          onChange={(status: string) =>
            applyFilters({
              ...filters,
              status:
                status === ALL_STATUSES ? undefined : (status as ProgramStatus),
            })
          }
        />
      </Flex>
      <Table<ProgramSummary>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isFetching}
        locale={{ emptyText: 'Chưa có chương trình' }}
        pagination={{
          current: paging.page,
          pageSize: paging.pageSize,
          total: data?.total ?? 0,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
        }}
        onChange={(pagination) =>
          setPaging({
            page: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
          })
        }
      />
    </Flex>
  );
}
