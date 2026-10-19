import { App, Form, Input, InputNumber, Modal } from 'antd';
import { ApiError } from '../../../shared/api/client';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import type { Cohort } from '../../../shared/releases/semesters';
import { useCreateCohort, useUpdateCohort } from '../hooks/useReleases';

interface CohortFormProps {
  cohort?: Cohort;
  onClose: () => void;
}

interface Values {
  cohortCode: string;
  intakeYear: number;
}

const YEAR_MIN = 1900;
const YEAR_MAX = 2200;
const CODE_MAX = 30;

export function CohortForm({ cohort, onClose }: CohortFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const create = useCreateCohort();
  const update = useUpdateCohort();

  async function submit(values: Values) {
    try {
      if (cohort) await update.mutateAsync({ id: cohort.id, body: values });
      else await create.mutateAsync(values);
      void message.success(
        cohort ? 'Đã lưu khóa tuyển sinh.' : 'Đã thêm khóa tuyển sinh.',
      );
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'COHORT_EXISTS') {
        form.setFields([{ name: 'cohortCode', errors: [error.message] }]);
      } else if (!applyFieldErrors(form, error)) {
        void message.error(errorMessage(error, 'Không lưu được khóa.'));
      }
    }
  }

  return (
    <Modal
      open
      title={cohort ? 'Sửa khóa tuyển sinh' : 'Thêm khóa tuyển sinh'}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={create.isPending || update.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form<Values>
        form={form}
        layout="vertical"
        onFinish={submit}
        initialValues={cohort}
      >
        <Form.Item
          name="cohortCode"
          label="Mã khóa"
          rules={[
            { required: true, whitespace: true, message: 'Nhập mã khóa.' },
            { max: CODE_MAX },
          ]}
        >
          <Input placeholder="K2026" />
        </Form.Item>
        <Form.Item
          name="intakeYear"
          label="Năm tuyển sinh"
          rules={[{ required: true, message: 'Nhập năm tuyển sinh.' }]}
        >
          <InputNumber min={YEAR_MIN} max={YEAR_MAX} precision={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
