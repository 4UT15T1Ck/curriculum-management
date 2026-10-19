import { Card, Descriptions, Space } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { versionLabel } from '../../../shared/constants/versionLabels';
import type { VersionDetail } from '../api/releases';
import { formatDay, formatTimestamp } from '../utils/format';
import { VersionStatusTag } from './VersionStatusTag';

interface VersionHeaderProps {
  version: VersionDetail;
}

// MH-47: who released the version, by which decision, from which semester, for which cohorts, and where it came from.
export function VersionHeader({ version }: VersionHeaderProps) {
  const link = (target: { id: string; versionNumber: string | null }) => (
    <Link
      to={generatePath(ROUTES.versionDetail, {
        programId: version.programId,
        versionId: target.id,
      })}
    >
      {versionLabel(target)}
    </Link>
  );
  return (
    <Card size="small">
      <Descriptions column={{ xs: 1, md: 2 }} size="small">
        <Descriptions.Item label="Trạng thái">
          <VersionStatusTag status={version.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Số quyết định">
          {version.decisionNumber ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày ký">
          {formatDay(version.signedDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Học kỳ hiệu lực">
          {version.effectiveSemester
            ? `${version.effectiveSemester.semesterCode} (từ ${formatDay(version.effectiveSemester.startDate)})`
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Khóa áp dụng">
          {version.cohorts.length > 0
            ? version.cohorts.map((cohort) => cohort.cohortCode).join(', ')
            : 'Chưa gán khóa nào'}
        </Descriptions.Item>
        <Descriptions.Item label="Ban hành">
          {version.publishedBy?.fullName ?? '—'} —{' '}
          {formatTimestamp(version.publishedAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Thay cho phiên bản">
          {version.previousVersion ? link(version.previousVersion) : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Đề xuất gốc">
          {version.originRequest ? (
            <Link
              to={generatePath(ROUTES.changeRequestDetail, {
                requestId: version.originRequest.id,
              })}
            >
              {version.originRequest.requestCode}
            </Link>
          ) : (
            '—'
          )}
        </Descriptions.Item>
        {version.correctionOf && (
          <Descriptions.Item label="Đính chính cho">
            <Space>
              {link(version.correctionOf)}
              {version.correctionReason && `— ${version.correctionReason}`}
            </Space>
          </Descriptions.Item>
        )}
        {version.correctedBy && (
          <Descriptions.Item label="Đã được đính chính bởi">
            {link(version.correctedBy)}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}
