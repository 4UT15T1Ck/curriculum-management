import { Alert, Form, Input, Modal, Radio } from 'antd';
import type { OverrideAction } from '../api/changeRequests';
import {
  OVERRIDE_ACTION_LABELS,
  OVERRIDE_NOTE,
} from '../constants/approvalLabels';
import { REMARK_MAX } from '../constants/approvalLimits';
import { REMARK_RULES } from '../schema/remarkRules';

interface OverrideValues {
  action: OverrideAction;
  reason: string;
}

interface OverrideModalProps {
  open: boolean;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (values: OverrideValues) => Promise<unknown>;
}

const ACTIONS = Object.keys(OVERRIDE_ACTION_LABELS) as OverrideAction[];

// US-070: the academic office decides a stuck level 1 or 2 on the approvers' behalf, with a reason.
export function OverrideModal({
  open,
  pending,
  onCancel,
  onSubmit,
}: OverrideModalProps) {
  const [form] = Form.useForm<OverrideValues>();
  return (
    <Modal
      open={open}
      title="Duyệt thay"
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={pending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Alert type="info" showIcon title={OVERRIDE_NOTE} />
      <Form
        form={form}
        layout="vertical"
        initialValues={{ action: 'APPROVE' }}
        onFinish={({ action, reason }) =>
          onSubmit({ action, reason: reason.trim() })
        }
        style={{ marginTop: 16 }}
      >
        <Form.Item name="action" label="Quyết định">
          <Radio.Group
            options={ACTIONS.map((action) => ({
              value: action,
              label: OVERRIDE_ACTION_LABELS[action],
            }))}
          />
        </Form.Item>
        <Form.Item name="reason" label="Lý do" rules={REMARK_RULES}>
          <Input.TextArea rows={4} maxLength={REMARK_MAX} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
