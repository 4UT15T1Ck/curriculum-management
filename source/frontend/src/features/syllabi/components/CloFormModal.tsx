import { App, AutoComplete, Form, Input, Modal } from 'antd';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import type { Clo } from '../api/syllabi';
import {
  CLO_CODE_MAX,
  CLO_CODE_REQUIRED,
  CLO_DESCRIPTION_REQUIRED,
  CLO_TEXT_MAX,
  COGNITIVE_LEVEL_MAX,
  COGNITIVE_LEVEL_SUGGESTIONS,
} from '../constants/syllabusLabels';
import { useCreateClo, useUpdateClo } from '../hooks/useSyllabus';

interface CloFormModalProps {
  courseId: string;
  syllabusId: string;
  // null = a new CLO.
  clo: Clo | null;
  onClose: () => void;
}

interface CloFormValues {
  cloCode: string;
  description: string;
  englishDescription?: string | null;
  cognitiveLevel?: string | null;
}

const COGNITIVE_OPTIONS = COGNITIVE_LEVEL_SUGGESTIONS.map((value) => ({
  value,
}));

export function CloFormModal({
  courseId,
  syllabusId,
  clo,
  onClose,
}: CloFormModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<CloFormValues>();
  const create = useCreateClo(courseId, syllabusId);
  const update = useUpdateClo(courseId);

  const submit = (values: CloFormValues) => {
    const body = {
      cloCode: values.cloCode.trim(),
      description: values.description.trim(),
      englishDescription: values.englishDescription?.trim() || null,
      cognitiveLevel: values.cognitiveLevel?.trim() || null,
    };
    const options = {
      onSuccess: onClose,
      onError: (reason: unknown) => {
        if (!applyFieldErrors(form, reason))
          void message.error(errorMessage(reason, 'Không lưu được CLO.'));
      },
    };
    if (clo) update.mutate({ cloId: clo.id, body }, options);
    else create.mutate(body, options);
  };

  return (
    <Modal
      open
      title={clo ? `Sửa ${clo.cloCode}` : 'Thêm CLO'}
      okText="Lưu"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={create.isPending || update.isPending}
      destroyOnHidden
    >
      <Form<CloFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          cloCode: clo?.cloCode,
          description: clo?.description,
          englishDescription: clo?.englishDescription,
          cognitiveLevel: clo?.cognitiveLevel,
        }}
        onFinish={submit}
      >
        <Form.Item
          name="cloCode"
          label="Mã CLO"
          rules={[
            { required: true, whitespace: true, message: CLO_CODE_REQUIRED },
            { max: CLO_CODE_MAX },
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
              message: CLO_DESCRIPTION_REQUIRED,
            },
            { max: CLO_TEXT_MAX },
          ]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="englishDescription"
          label="Mô tả (tiếng Anh)"
          rules={[{ max: CLO_TEXT_MAX }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="cognitiveLevel"
          label="Mức nhận thức"
          rules={[{ max: COGNITIVE_LEVEL_MAX }]}
        >
          <AutoComplete options={COGNITIVE_OPTIONS} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
}
