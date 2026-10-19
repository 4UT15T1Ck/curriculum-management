import { Flex, Result, Segmented, Skeleton, Space, Typography } from 'antd';
import { useState } from 'react';
import { generatePath, Link, useParams } from 'react-router';
import { ROUTES } from '../../../routes';
import { ApiError } from '../../../shared/api/client';
import { versionLabel } from '../../../shared/constants/versionLabels';
import type { CurriculumItem } from '../api/curriculum';
import { CurriculumAddButton } from '../components/CurriculumAddButton';
import { CurriculumFiltersBar } from '../components/CurriculumFiltersBar';
import { CurriculumItemModal } from '../components/CurriculumItemModal';
import { CurriculumTable } from '../components/CurriculumTable';
import { CurriculumTotals } from '../components/CurriculumTotals';
import { CurriculumWarningsPanel } from '../components/CurriculumWarningsPanel';
import { RequisitesModal } from '../components/RequisitesModal';
import { SemesterBoard } from '../components/SemesterBoard';
import {
  CURRICULUM_VIEW,
  CURRICULUM_VIEW_LABELS,
  type CurriculumView,
} from '../constants/curriculumLabels';
import { useCurriculum } from '../hooks/useCurriculum';
import { useCurriculumFilters } from '../hooks/useCurriculumFilters';

const VIEW_OPTIONS = (
  Object.keys(CURRICULUM_VIEW_LABELS) as CurriculumView[]
).map((value) => ({ value, label: CURRICULUM_VIEW_LABELS[value] }));

export function CurriculumPage() {
  const { programId = '', versionId = '' } = useParams();
  const { data: curriculum, isPending, error } = useCurriculum(versionId);
  const [view, setView] = useState<CurriculumView>(CURRICULUM_VIEW.rows);
  const { filters, setFilters, visible, filtered } = useCurriculumFilters(
    curriculum?.items ?? [],
  );
  const [editing, setEditing] = useState<CurriculumItem | 'new' | null>(null);
  const [requisitesOf, setRequisitesOf] = useState<CurriculumItem | null>(null);
  if (isPending) return <Skeleton active />;
  if (!curriculum) {
    if (error instanceof ApiError && error.status === 403)
      return (
        <Result
          status="403"
          title="Bạn không có quyền xem khung chương trình này"
        />
      );
    return <Result status="404" title="Không tìm thấy khung chương trình" />;
  }
  const { version } = curriculum;
  return (
    <Flex vertical gap="middle">
      <Link to={generatePath(ROUTES.programDetail, { programId })}>
        ← Chương trình {version.programCode}
      </Link>
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Khung chương trình — {version.programCode} ({versionLabel(version)})
        </Typography.Title>
        <Space wrap>
          <Segmented<CurriculumView>
            options={VIEW_OPTIONS}
            value={view}
            onChange={setView}
          />
          <Link
            to={generatePath(ROUTES.electiveGroups, {
              programId,
              versionId,
            })}
          >
            Nhóm tự chọn
          </Link>
          <CurriculumAddButton
            curriculum={curriculum}
            onAdd={() => setEditing('new')}
          />
        </Space>
      </Flex>
      <CurriculumWarningsPanel warnings={curriculum.warnings} />
      <CurriculumFiltersBar
        curriculum={curriculum}
        filters={filters}
        filtered={filtered}
        onChange={setFilters}
      />
      {view === CURRICULUM_VIEW.rows ? (
        <CurriculumTable
          curriculum={curriculum}
          items={visible}
          sortable={!filtered && curriculum.canEditStructure}
          onEdit={setEditing}
          onRequisites={setRequisitesOf}
        />
      ) : (
        <SemesterBoard
          curriculum={curriculum}
          items={visible}
          onEdit={setEditing}
          onRequisites={setRequisitesOf}
        />
      )}
      <CurriculumTotals
        curriculum={curriculum}
        highlightedBlock={filters.blockSymbol}
      />
      {editing && (
        <CurriculumItemModal
          curriculum={curriculum}
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {requisitesOf && (
        <RequisitesModal
          versionId={version.id}
          item={requisitesOf}
          onClose={() => setRequisitesOf(null)}
        />
      )}
    </Flex>
  );
}
