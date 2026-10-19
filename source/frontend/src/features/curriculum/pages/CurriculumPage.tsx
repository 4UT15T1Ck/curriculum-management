import {
  Button,
  Flex,
  Result,
  Segmented,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { generatePath, Link, useParams, useSearchParams } from 'react-router';
import { FOCUS_PARAM, ROUTES } from '../../../routes';
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
import {
  EMPTY_CURRICULUM_FILTERS,
  useCurriculumFilters,
} from '../hooks/useCurriculumFilters';
import { itemElementId } from '../components/CurriculumWarningsPanel';

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
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get(FOCUS_PARAM);
  const focusVisible = visible.some((row) => row.id === focusId);
  const focusKnown = Boolean(
    focusId && curriculum?.items.some((row) => row.id === focusId),
  );
  // Arriving from the consistency result: clear a filter that hides the row, then bring it into view.
  useEffect(() => {
    if (!focusKnown) return;
    if (!focusVisible) {
      setFilters(EMPTY_CURRICULUM_FILTERS);
      return;
    }
    document
      .getElementById(itemElementId(focusId!))
      ?.scrollIntoView({ block: 'center' });
  }, [focusKnown, focusVisible, focusId, setFilters]);
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
          <Link to={generatePath(ROUTES.consistency, { programId, versionId })}>
            <Button>Kiểm tra nhất quán</Button>
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
          focusId={focusId}
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
