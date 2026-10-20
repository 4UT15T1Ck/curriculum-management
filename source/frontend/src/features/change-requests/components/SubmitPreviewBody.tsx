import { Alert, Flex, Typography } from 'antd';
import type { SubmitPreview } from '../api/changeRequests';

interface SubmitPreviewBodyProps {
  preview: SubmitPreview;
}

// What will happen on submit, read before confirming (US-057 AC7): blockers first, then the programs and the approvers.
export function SubmitPreviewBody({ preview }: SubmitPreviewBodyProps) {
  return (
    <Flex vertical gap="middle">
      {preview.blockingIssues.length > 0 && (
        <Alert
          type="error"
          showIcon
          title="Chưa gửi được đề xuất"
          description={
            <ul>
              {preview.blockingIssues.map((issue, index) => (
                <li key={`${issue.code}-${index}`}>{issue.message}</li>
              ))}
            </ul>
          }
        />
      )}
      <Typography.Text>{preview.itemCount} thay đổi</Typography.Text>
      {preview.affectedPrograms.length > 0 && (
        <div>
          <Typography.Text strong>Chương trình bị ảnh hưởng</Typography.Text>
          <ul>
            {preview.affectedPrograms.map((program) => (
              <li key={program.id}>
                {program.programCode} — {program.programName}
              </li>
            ))}
          </ul>
        </div>
      )}
      {preview.levels.map((level) => (
        <div key={level.approvalLevel}>
          <Typography.Text strong>
            Cấp {level.approvalLevel} — {level.levelName}
          </Typography.Text>
          <ul>
            {level.approvers.map((approver, index) => (
              <li key={`${approver.name}-${index}`}>
                <Typography.Text delete={approver.skipReason !== null}>
                  {approver.name}
                  {approver.scope ? ` (${approver.scope})` : ''}
                </Typography.Text>
                {approver.skipReason && (
                  <Typography.Text type="secondary">
                    {' '}
                    — {approver.skipReason}
                  </Typography.Text>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Flex>
  );
}
