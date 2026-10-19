import { Alert, Button, Flex, Result, Skeleton, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { generatePath, Link, useParams, useSearchParams } from 'react-router';
import { FOCUS_PARAM, ROUTES } from '../../../routes';
import { ApiError } from '../../../shared/api/client';
import { versionLabel } from '../../../shared/constants/versionLabels';
import type { ElectiveGroup } from '../api/curriculum';
import { AssignItemsModal } from '../components/AssignItemsModal';
import { ElectiveGroupFormModal } from '../components/ElectiveGroupFormModal';
import {
  ElectiveGroupTable,
  groupElementId,
} from '../components/ElectiveGroupTable';
import { useCurriculum } from '../hooks/useCurriculum';

export function ElectiveGroupsPage() {
  const { programId = '', versionId = '' } = useParams();
  const { data: curriculum, isPending, error } = useCurriculum(versionId);
  const [editing, setEditing] = useState<ElectiveGroup | 'new' | null>(null);
  const [assigning, setAssigning] = useState<ElectiveGroup | null>(null);
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get(FOCUS_PARAM);
  const focusKnown = Boolean(
    focusId && curriculum?.electiveGroups.some((group) => group.id === focusId),
  );
  useEffect(() => {
    if (focusKnown)
      document
        .getElementById(groupElementId(focusId!))
        ?.scrollIntoView({ block: 'center' });
  }, [focusKnown, focusId]);
  if (isPending) return <Skeleton active />;
  if (!curriculum) {
    if (error instanceof ApiError && error.status === 403)
      return (
        <Result status="403" title="Bạn không có quyền xem nhóm tự chọn này" />
      );
    return (
      <Result status="404" title="Không tìm thấy phiên bản chương trình" />
    );
  }
  const { version } = curriculum;
  const ungrouped = curriculum.items.filter(
    (item) => item.isElective && !item.electiveGroup,
  );
  return (
    <Flex vertical gap="middle">
      <Link to={generatePath(ROUTES.curriculum, { programId, versionId })}>
        ← Khung chương trình {version.programCode}
      </Link>
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Nhóm tự chọn — {version.programCode} ({versionLabel(version)})
        </Typography.Title>
        {curriculum.canEditStructure && (
          <Button type="primary" onClick={() => setEditing('new')}>
            Thêm nhóm
          </Button>
        )}
      </Flex>
      {ungrouped.length > 0 && (
        <Alert
          type="info"
          showIcon
          message={`${ungrouped.length} học phần tự chọn chưa thuộc nhóm nào`}
        />
      )}
      <ElectiveGroupTable
        curriculum={curriculum}
        onEdit={setEditing}
        onAssign={setAssigning}
        focusId={focusId}
      />
      {editing && (
        <ElectiveGroupFormModal
          versionId={version.id}
          group={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {assigning && (
        <AssignItemsModal
          curriculum={curriculum}
          group={assigning}
          onClose={() => setAssigning(null)}
        />
      )}
    </Flex>
  );
}
