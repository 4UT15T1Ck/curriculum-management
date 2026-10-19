import { Card, Col, Flex, Row, Tag, Tooltip, Typography } from 'antd';
import { groupByLevel } from '../utils/groupByLevel';
import type { ApprovalStep } from '../api/changeRequests';
import {
  ACADEMIC_OFFICE_LABEL,
  ACTION_LABELS,
  SKIPPED_LABEL,
} from '../constants/changeRequestLabels';
import { formatDateTime } from '../utils/format';

interface StepProgressProps {
  steps: readonly ApprovalStep[];
}

function StepLine({ step }: { step: ApprovalStep }) {
  const who = step.approver?.fullName ?? ACADEMIC_OFFICE_LABEL;
  const scope = step.forSubjectGroup?.groupCode ?? step.forProgram?.programCode;
  return (
    <Flex vertical gap={2}>
      <Flex gap="small" align="center" wrap>
        <Typography.Text delete={step.isSkipped}>{who}</Typography.Text>
        {scope && <Typography.Text type="secondary">({scope})</Typography.Text>}
        {step.isSkipped ? (
          <Tooltip title={step.skipReason}>
            <Tag>{SKIPPED_LABEL}</Tag>
          </Tooltip>
        ) : (
          <Tag color={step.action === 'PENDING' ? 'default' : 'success'}>
            {ACTION_LABELS[step.action]}
          </Tag>
        )}
        {!step.isSkipped && step.recordedAt && (
          <Typography.Text type="secondary">
            {formatDateTime(step.recordedAt)}
          </Typography.Text>
        )}
      </Flex>
      {step.isSkipped && step.skipReason && (
        <Typography.Text type="secondary">{step.skipReason}</Typography.Text>
      )}
      {step.remark && <Typography.Text>{step.remark}</Typography.Text>}
    </Flex>
  );
}

// One column per level and one line per approver row, so two coordinators show two lines (EC-22).
export function StepProgress({ steps }: StepProgressProps) {
  return (
    <Row gutter={[16, 16]}>
      {groupByLevel(steps).map(({ approvalLevel, levelName, rows }) => (
        <Col key={approvalLevel} xs={24} md={8}>
          <Card size="small" title={`Cấp ${approvalLevel} — ${levelName}`}>
            <Flex vertical gap="small">
              {rows.map((row) => (
                <StepLine key={row.id} step={row} />
              ))}
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
