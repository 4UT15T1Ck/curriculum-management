import { App, Form, Input, Modal } from 'antd';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import type { Plo } from '../api/outcomes';
import {
  PLO_CODE_REQUIRED,
  PLO_DESCRIPTION_REQUIRED,
  PLO_FORM_LIMITS,
} from '../constants/outcomeLabels';
import { useCreatePlo, useUpdatePlo } from '../hooks/useOutcomes';

interface PloFormModalProps {
  versionId: string;
  // null = a new PLO.
  plo: Plo | null;
  onClose: () => void;
}

interface PloFormValues {
  ploCode: string;
  description: string;
  englishDescription?: string | null;
  competencyGroup?: string | null;
}

export function PloFormModal({ versionId, plo, onClose }: PloFormModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<PloFormValues>();
  const create = useCreatePlo(versionId);
  const update = useUpdatePlo();

  const submit = (values: PloFormValues) => {
    const body = {
      ploCode: values.ploCode.trim(),
      description: values.description.trim(),
      englishDescription: values.englishDescription?.trim() || null,
      competencyGroup: values.competencyGroup?.trim() || null,
    };
    const options = {
      onSuccess: onClose,
      onError: (reason: unknown) => {
        if (!applyFieldErrors(form, reason))
          void message.error(errorMessage(reason, 'Không lưu được PLO.'));
      },
    };
    if (plo) update.mutate({ ploId: plo.id, body }, options);
    else create.mutate(body, options);
  };

  return (
    <Modal
      open
      title={plo ? `Sửa ${plo.ploCode}` : 'Thêm PLO'}
      okText="Lưu"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={create.isPending || update.isPending}
      destroyOnHidden
    >
      <Form<PloFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          ploCode: plo?.ploCode,
          description: plo?.description,
          englishDescription: plo?.englishDescription,
          competencyGroup: plo?.competencyGroup,
        }}
        onFinish={submit}
      >
        <Form.Item
          name="ploCode"
          label="Mã PLO"
          rules={[
            { required: true, whitespace: true, message: PLO_CODE_REQUIRED },
            { max: PLO_FORM_LIMITS.CODE_MAX },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả (tiếng Việt)"
          rules={[
            {
              required: true,
              whitespace: true,
              message: PLO_DESCRIPTION_REQUIRED,
            },
            { max: PLO_FORM_LIMITS.TEXT_MAX },
          ]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="englishDescription"
          label="Mô tả (tiếng Anh)"
          rules={[{ max: PLO_FORM_LIMITS.TEXT_MAX }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="competencyGroup"
          label="Nhóm năng lực"
          rules={[{ max: PLO_FORM_LIMITS.GROUP_MAX }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
