import {
  App,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { IssueCorrectionInput } from '../api/releases';
import {
  CORRECTION_CONFIRM_BODY,
  CORRECTION_CONFIRM_TITLE,
  CORRECTION_REASON_REQUIRED,
  REASON_MAX,
} from '../constants/releaseLabels';

interface CorrectionIssueFormProps {
  issuing: boolean;
  discarding: boolean;
  onIssue: (body: IssueCorrectionInput) => Promise<unknown>;
  onDiscard: () => Promise<unknown>;
}

interface Values {
  reason: string;
  moveCohorts: boolean;
}

// MH-49: the reason is mandatory and the cohort move is on by default but never hidden (US-076 AC2, AC4).
export function CorrectionIssueForm({
  issuing,
  discarding,
  onIssue,
  onDiscard,
}: CorrectionIssueFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [confirming, setConfirming] = useState<Values | null>(null);

  async function issue(values: Values) {
    try {
      await onIssue({
        reason: values.reason,
        moveCohorts: values.moveCohorts,
      });
    } catch (error) {
      void message.error(
        errorMessage(error, 'Không ban hành được đính chính.'),
      );
    } finally {
      setConfirming(null);
    }
  }

  return (
    <>
      <Form<Values>
        form={form}
        layout="vertical"
        style={{ maxWidth: 560 }}
        initialValues={{ moveCohorts: true }}
        onFinish={setConfirming}
      >
        <Form.Item
          name="reason"
          label="Lý do đính chính"
          rules={[
            {
              required: true,
              whitespace: true,
              message: CORRECTION_REASON_REQUIRED,
            },
            { max: REASON_MAX },
          ]}
        >
          <Input.TextArea rows={3} maxLength={REASON_MAX} showCount />
        </Form.Item>
        <Form.Item name="moveCohorts" valuePropName="checked">
          <Checkbox>Chuyển các khóa đang áp dụng sang bản đính chính</Checkbox>
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={issuing}>
            Ban hành đính chính
          </Button>
          <Popconfirm
            title="Hủy bản nháp đính chính?"
            description="Bản nháp bị xóa; phiên bản gốc không đổi."
            okText="Hủy bản nháp"
            cancelText="Giữ lại"
            okButtonProps={{ danger: true }}
            onConfirm={() => void onDiscard()}
          >
            <Button danger loading={discarding}>
              Hủy bản nháp
            </Button>
          </Popconfirm>
        </Space>
      </Form>
      <Modal
        open={confirming !== null}
        title={CORRECTION_CONFIRM_TITLE}
        okText="Ban hành"
        cancelText="Hủy"
        confirmLoading={issuing}
        onOk={() => confirming && void issue(confirming)}
        onCancel={() => setConfirming(null)}
      >
        <Typography.Paragraph>{CORRECTION_CONFIRM_BODY}</Typography.Paragraph>
      </Modal>
    </>
  );
}
