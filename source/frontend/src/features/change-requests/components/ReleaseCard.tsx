import { Card, Descriptions, List, Typography } from 'antd';
import dayjs from 'dayjs';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { VERSION_STATUS_LABELS } from '../../../shared/constants/versionLabels';
import type { RequestRelease } from '../api/changeRequests';

interface ReleaseCardProps {
  release: RequestRelease;
}

const DATE_FORMAT = 'DD/MM/YYYY';

// What the final approval decided and what it produced (F-15): the decision, the semester and each version it made.
export function ReleaseCard({ release }: ReleaseCardProps) {
  return (
    <Card title="Quyết định ban hành" size="small">
      <Descriptions column={{ xs: 1, md: 2 }} size="small">
        <Descriptions.Item label="Số quyết định">
          {release.decisionNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày ký">
          {dayjs(release.signedDate).format(DATE_FORMAT)}
        </Descriptions.Item>
        <Descriptions.Item label="Học kỳ hiệu lực">
          {release.effectiveSemester?.semesterCode ?? '—'}
          {release.pastSemesterAllowed && ' (học kỳ đã bắt đầu, được phép)'}
        </Descriptions.Item>
      </Descriptions>
      {release.versions.length > 0 ? (
        <List
          size="small"
          header="Phiên bản đã tạo"
          dataSource={release.versions}
          renderItem={(version) => (
            <List.Item>
              <Link
                to={generatePath(ROUTES.versionDetail, {
                  programId: version.programId,
                  versionId: version.id,
                })}
              >
                {version.programCode} — phiên bản {version.versionNumber ?? '—'}
              </Link>{' '}
              <Typography.Text type="secondary">
                ({VERSION_STATUS_LABELS[version.status]})
              </Typography.Text>
            </List.Item>
          )}
        />
      ) : (
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          Đề xuất không tạo phiên bản mới.
        </Typography.Paragraph>
      )}
    </Card>
  );
}
