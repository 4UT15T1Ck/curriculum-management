import { Flex, Result, Skeleton, Typography } from 'antd';
import { useParams } from 'react-router';
import { ApiError } from '../../../shared/api/client';
import { RequestDraftBanner } from '../../../shared/change-requests/RequestDraftBanner';
import { versionLabel } from '../../../shared/constants/versionLabels';
import { CoursePloGrid } from '../components/CoursePloGrid';
import { OutcomeEditNotice } from '../components/OutcomeEditNotice';
import { OutcomeNav } from '../components/OutcomeNav';
import { useCoursePloMatrix } from '../hooks/useOutcomes';

export function CoursePloMatrixPage() {
  const { programId = '', versionId = '' } = useParams();
  const { data, isPending, error } = useCoursePloMatrix(versionId);
  if (isPending) return <Skeleton active />;
  if (!data) {
    if (error instanceof ApiError && error.status === 403)
      return <Result status="403" title="Bạn không có quyền xem ma trận này" />;
    return (
      <Result status="404" title="Không tìm thấy phiên bản chương trình" />
    );
  }
  const { version } = data;
  return (
    <Flex vertical gap="middle">
      <OutcomeNav programId={programId} versionId={versionId} />
      <Typography.Title level={2} style={{ margin: 0 }}>
        Ma trận học phần–PLO — {version.programName} ({versionLabel(version)})
      </Typography.Title>
      <Typography.Text type="secondary">
        Mỗi ô là trọng số (lớn hơn 0, không quá 1) mà học phần đóng góp cho PLO.
      </Typography.Text>
      <RequestDraftBanner request={version.sourceRequest} />
      <OutcomeEditNotice
        editPath={data.editPath}
        programId={version.programId}
      />
      <CoursePloGrid matrix={data} />
    </Flex>
  );
}
