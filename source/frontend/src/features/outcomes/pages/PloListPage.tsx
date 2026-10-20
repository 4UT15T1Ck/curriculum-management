import { Button, Flex, Result, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router';
import { ApiError } from '../../../shared/api/client';
import { RequestDraftBanner } from '../../../shared/change-requests/RequestDraftBanner';
import { versionLabel } from '../../../shared/constants/versionLabels';
import type { Plo } from '../api/outcomes';
import { OutcomeEditNotice } from '../components/OutcomeEditNotice';
import { OutcomeNav } from '../components/OutcomeNav';
import { PloFormModal } from '../components/PloFormModal';
import { PloTable } from '../components/PloTable';
import { ADD_PLO } from '../constants/outcomeLabels';
import { usePlos } from '../hooks/useOutcomes';

export function PloListPage() {
  const { programId = '', versionId = '' } = useParams();
  const { data, isPending, error } = usePlos(versionId);
  const [editing, setEditing] = useState<Plo | 'new' | null>(null);
  if (isPending) return <Skeleton active />;
  if (!data) {
    if (error instanceof ApiError && error.status === 403)
      return <Result status="403" title="Bạn không có quyền xem PLO này" />;
    return (
      <Result status="404" title="Không tìm thấy phiên bản chương trình" />
    );
  }
  const { version } = data;
  return (
    <Flex vertical gap="middle">
      <OutcomeNav programId={programId} versionId={versionId} />
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Title level={2} style={{ margin: 0 }}>
          PLO — {version.programName} ({versionLabel(version)})
        </Typography.Title>
        {data.canEdit && (
          <Button type="primary" onClick={() => setEditing('new')}>
            {ADD_PLO}
          </Button>
        )}
      </Flex>
      <RequestDraftBanner request={version.sourceRequest} />
      <OutcomeEditNotice
        editPath={data.editPath}
        programId={version.programId}
      />
      <PloTable
        versionId={versionId}
        plos={data.plos}
        canEdit={data.canEdit}
        onEdit={setEditing}
      />
      {editing !== null && (
        <PloFormModal
          versionId={versionId}
          plo={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </Flex>
  );
}
