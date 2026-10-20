import { Alert, Flex, List, Table, Typography } from 'antd';
import type {
  FinalApprovalProgram,
  FinalApprovalPreview as Preview,
} from '../api/changeRequests';
import { FINAL_KIND_LABELS, STALE_NOTE } from '../constants/approvalLabels';

interface FinalApprovalPreviewProps {
  preview: Preview;
}

const CONDITION_LABELS: Record<string, string> = {
  COURSE_DESCRIPTION_EMPTY: 'chưa có mô tả học phần',
  OBJECTIVES_EMPTY: 'chưa có mục tiêu học phần',
};

// MH-43 preview: what the approval will do, program by program. Advisory; the approval recomputes it all.
export function FinalApprovalPreview({ preview }: FinalApprovalPreviewProps) {
  return (
    <Flex vertical gap="middle">
      <Alert type="info" showIcon message={FINAL_KIND_LABELS[preview.kind]} />
      {preview.stale && <Alert type="error" showIcon message={STALE_NOTE} />}
      {preview.copyIssues.length > 0 && (
        <Alert
          type="error"
          showIcon
          message="Bản đề cương được đề xuất chưa đủ điều kiện ban hành"
          description={preview.copyIssues
            .map((code) => CONDITION_LABELS[code] ?? code)
            .join('; ')}
        />
      )}
      {preview.affectedPrograms.length > 0 && (
        <Table<FinalApprovalProgram>
          rowKey="programId"
          size="small"
          pagination={false}
          dataSource={preview.affectedPrograms}
          columns={[
            { title: 'Chương trình', dataIndex: 'programCode' },
            {
              title: 'Phiên bản hiện tại',
              dataIndex: 'baseVersionNumber',
              render: (value: string | null) => value ?? '—',
            },
            { title: 'Số phiên bản mới', dataIndex: 'nextVersionNumber' },
            {
              title: 'Liên kết CLO–PLO sẽ mất',
              dataIndex: 'droppedCloLinks',
            },
            {
              title: 'Vấn đề',
              key: 'issues',
              render: (_: unknown, program) => {
                const errors = program.consistencyIssues.filter(
                  (issue) => issue.severity === 'ERROR',
                );
                if (errors.length === 0 && program.syllabusIssues.length === 0)
                  return 'Không có';
                return (
                  <List
                    size="small"
                    dataSource={[
                      ...errors.map((issue) => issue.message),
                      ...program.syllabusIssues.map(
                        (issue) => `${issue.courseCode}: ${issue.code}`,
                      ),
                    ]}
                    renderItem={(text) => (
                      <List.Item>
                        <Typography.Text type="danger">{text}</Typography.Text>
                      </List.Item>
                    )}
                  />
                );
              },
            },
          ]}
        />
      )}
      {preview.authoredLabels.length > 0 && (
        <List
          size="small"
          bordered
          header="Thay đổi sẽ áp dụng"
          dataSource={preview.authoredLabels}
          renderItem={(label) => <List.Item>{label}</List.Item>}
        />
      )}
    </Flex>
  );
}
