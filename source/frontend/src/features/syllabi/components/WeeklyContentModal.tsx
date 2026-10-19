import { App, Form, Input, Modal } from 'antd';
import { RichTextEditor } from '../../../shared/components/rich-text/RichTextEditor';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import type { WeeklyContent } from '../api/syllabi';
import {
  CONTENT_REQUIRED,
  WEEK_LABEL_MAX,
  WEEK_LABEL_REQUIRED,
} from '../constants/syllabusLabels';
import { useCreateWeek, useUpdateWeek } from '../hooks/useSyllabus';

interface WeeklyContentModalProps {
  courseId: string;
  syllabusId: string;
  // null = a new row.
  week: WeeklyContent | null;
  onClose: () => void;
}

interface WeeklyFormValues {
  weekLabel?: string;
  content?: string | null;
  teachingActivities?: string | null;
}

const LABELS = {
  weekLabel: 'Tuần',
  content: 'Nội dung',
  teachingActivities: 'Hoạt động dạy học',
} as const;

export function WeeklyContentModal({
  courseId,
  syllabusId,
  week,
  onClose,
}: WeeklyContentModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<WeeklyFormValues>();
  const create = useCreateWeek(courseId);
  const update = useUpdateWeek(courseId);

  const submit = (values: WeeklyFormValues) => {
    const body = {
      weekLabel: values.weekLabel?.trim() ?? '',
      content: values.content ?? '',
      teachingActivities: values.teachingActivities ?? null,
    };
    const options = {
      onSuccess: onClose,
      onError: (reason: unknown) => {
        if (!applyFieldErrors(form, reason))
          void message.error(errorMessage(reason, 'Không lưu được dòng tuần.'));
      },
    };
    if (week) update.mutate({ weeklyContentId: week.id, body }, options);
    else create.mutate({ syllabusId, body }, options);
  };

  return (
    <Modal
      open
      width={760}
      title={week ? `Sửa ${week.weekLabel}` : 'Thêm tuần'}
      okText="Lưu"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={create.isPending || update.isPending}
      destroyOnHidden
    >
      <Form<WeeklyFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          weekLabel: week?.weekLabel,
          content: week?.content ?? null,
          teachingActivities: week?.teachingActivities ?? null,
        }}
        onFinish={submit}
      >
        <Form.Item
          name="weekLabel"
          label={LABELS.weekLabel}
          rules={[
            { required: true, whitespace: true, message: WEEK_LABEL_REQUIRED },
            { max: WEEK_LABEL_MAX },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="content"
          label={LABELS.content}
          rules={[
            {
              validator: (_rule, value: string | null | undefined) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error(CONTENT_REQUIRED)),
            },
          ]}
        >
          <RichTextEditor aria-label={LABELS.content} />
        </Form.Item>
        <Form.Item name="teachingActivities" label={LABELS.teachingActivities}>
          <RichTextEditor aria-label={LABELS.teachingActivities} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
