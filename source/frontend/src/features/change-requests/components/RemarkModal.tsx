import { Form, Input, Modal } from 'antd';
import { REMARK_MAX } from '../constants/approvalLimits';
import { REMARK_RULES } from '../schema/remarkRules';

interface RemarkModalProps {
  open: boolean;
  title: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (remark: string) => Promise<unknown>;
}

// Return and Reject need a written reason (BR-28).
export function RemarkModal({
  open,
  title,
  pending,
  onCancel,
  onSubmit,
}: RemarkModalProps) {
  const [form] = Form.useForm<{ remark: string }>();
  return (
    <Modal
      open={open}
      title={title}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={pending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={({ remark }) => onSubmit(remark.trim())}
      >
        <Form.Item name="remark" label="Lý do" rules={REMARK_RULES}>
          <Input.TextArea rows={4} maxLength={REMARK_MAX} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
