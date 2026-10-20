import {
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import { Flex, List, Typography } from 'antd';
import { Link } from 'react-router';
import type { ConsistencyIssue } from '../api/consistency';
import {
  SEVERITY_LABELS,
  SEVERITY_ORDER,
} from '../constants/consistencyLabels';
import { issueTarget } from '../utils/issueTarget';

interface IssueListProps {
  issues: ConsistencyIssue[];
  programId: string;
  versionId: string;
}

const ICONS = {
  ERROR: <CloseCircleFilled style={{ color: '#ff4d4f' }} aria-hidden />,
  HIGH: <ExclamationCircleFilled style={{ color: '#faad14' }} aria-hidden />,
  INFO: <InfoCircleFilled style={{ color: '#1677ff' }} aria-hidden />,
} as const;

// One list per severity present, Errors first (the server already sorts inside each).
export function IssueList({ issues, programId, versionId }: IssueListProps) {
  return (
    <Flex vertical gap="middle">
      {SEVERITY_ORDER.map((severity) => {
        const rows = issues.filter((issue) => issue.severity === severity);
        if (rows.length === 0) return null;
        return (
          <List<ConsistencyIssue>
            key={severity}
            size="small"
            bordered
            header={
              <Typography.Text strong>
                {SEVERITY_LABELS[severity]} ({rows.length})
              </Typography.Text>
            }
            dataSource={rows}
            renderItem={(issue) => {
              const target = issueTarget(issue, { programId, versionId });
              return (
                <List.Item
                  actions={
                    target
                      ? [
                          <Link key="fix" to={target}>
                            Tới chỗ sửa
                          </Link>,
                        ]
                      : undefined
                  }
                >
                  <Flex gap="small">
                    {ICONS[severity]}
                    <span>
                      {issue.message}
                      {issue.semester !== null && (
                        <Typography.Text type="secondary">
                          {' '}
                          (Học kỳ {issue.semester})
                        </Typography.Text>
                      )}
                    </span>
                  </Flex>
                </List.Item>
              );
            }}
          />
        );
      })}
    </Flex>
  );
}
