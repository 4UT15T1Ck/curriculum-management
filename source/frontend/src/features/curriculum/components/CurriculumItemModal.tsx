import {
  App,
  AutoComplete,
  Checkbox,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
} from 'antd';
import { CourseSelect } from '../../../shared/courses/CourseSelect';
import {
  GRADE_POINT_MESSAGE,
  GRADE_POINT_PATTERN,
} from '../../../shared/courses/gradePoint';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import type { Curriculum, CurriculumItem } from '../api/curriculum';
import {
  ELECTIVE_KIND_LABELS,
  HT_DA_LABEL,
  TQ_DA_LABEL,
} from '../constants/curriculumLabels';
import { useCreateItem, useUpdateItem } from '../hooks/useCurriculum';
import { CURRICULUM_FORM_LIMITS } from '../schema/curriculumRules';

interface CurriculumItemModalProps {
  curriculum: Curriculum;
  // null = a new row.
  item: CurriculumItem | null;
  onClose: () => void;
}

interface CurriculumItemFormValues {
  courseId?: string;
  plannedSemester?: number;
  blockSymbol?: string | null;
  isElective: boolean;
  htDa: boolean;
  tqDa: boolean;
  minStudiedScore?: string | null;
  minTransferScore?: string | null;
  note?: string | null;
}

const blankToNull = (text: string | null | undefined) => {
  const trimmed = text?.trim();
  return trimmed ? trimmed : null;
};

function toItemFormValues(
  item: CurriculumItem | null,
): CurriculumItemFormValues {
  return {
    plannedSemester: item?.plannedSemester,
    blockSymbol: item?.blockSymbol,
    isElective: item?.isElective ?? false,
    htDa: item?.htDa ?? false,
    tqDa: item?.tqDa ?? false,
    minStudiedScore: item?.minStudiedScore,
    minTransferScore: item?.minTransferScore,
    note: item?.note,
  };
}

// '' means "no value" for the optional text columns, so it travels as null and clears the column.
export function toItemBody(values: CurriculumItemFormValues) {
  return {
    plannedSemester: values.plannedSemester as number,
    blockSymbol: blankToNull(values.blockSymbol),
    isElective: values.isElective,
    htDa: values.htDa,
    tqDa: values.tqDa,
    minStudiedScore: blankToNull(values.minStudiedScore),
    minTransferScore: blankToNull(values.minTransferScore),
    note: blankToNull(values.note),
  };
}

const semesterOptions = (count: number) =>
  Array.from({ length: count }, (_unused, index) => ({
    value: index + 1,
    label: `Học kỳ ${index + 1}`,
  }));

export function CurriculumItemModal({
  curriculum,
  item,
  onClose,
}: CurriculumItemModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<CurriculumItemFormValues>();
  const create = useCreateItem(curriculum.version.id);
  const update = useUpdateItem(curriculum.version.id);
  const pending = create.isPending || update.isPending;
  const listedCourseIds = curriculum.items.map((row) => row.course.id);

  const submit = (values: CurriculumItemFormValues) => {
    const body = toItemBody(values);
    const options = {
      onSuccess: () => {
        void message.success(
          item ? 'Đã lưu học phần trong khung' : 'Đã thêm học phần vào khung',
        );
        onClose();
      },
      onError: (reason: unknown) => {
        if (!applyFieldErrors(form, reason))
          void message.error(errorMessage(reason, 'Không lưu được học phần.'));
      },
    };
    if (item) update.mutate({ itemId: item.id, body }, options);
    else
      create.mutate({ courseId: values.courseId as string, ...body }, options);
  };

  return (
    <Modal
      open
      title={item ? `Sửa ${item.course.courseCode}` : 'Thêm học phần vào khung'}
      okText="Lưu"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={pending}
      destroyOnHidden
    >
      <Form<CurriculumItemFormValues>
        form={form}
        layout="vertical"
        initialValues={toItemFormValues(item)}
        onFinish={submit}
      >
        {item ? (
          <Form.Item label="Học phần">
            <Typography.Text>
              {item.course.courseCode} — {item.course.courseName}
            </Typography.Text>
          </Form.Item>
        ) : (
          <Form.Item
            name="courseId"
            label="Học phần"
            rules={[{ required: true, message: 'Chọn học phần.' }]}
          >
            <CourseSelect excludeIds={listedCourseIds} />
          </Form.Item>
        )}
        <Form.Item
          name="plannedSemester"
          label="Học kỳ"
          rules={[{ required: true, message: 'Chọn học kỳ.' }]}
        >
          <Select options={semesterOptions(curriculum.version.semesterCount)} />
        </Form.Item>
        <Form.Item
          name="blockSymbol"
          label="Khối kiến thức"
          rules={[
            {
              max: CURRICULUM_FORM_LIMITS.BLOCK_SYMBOL_MAX,
              message: `Ký hiệu tối đa ${CURRICULUM_FORM_LIMITS.BLOCK_SYMBOL_MAX} ký tự.`,
            },
          ]}
        >
          <AutoComplete
            allowClear
            options={curriculum.knowledgeBlocks.map((block) => ({
              value: block.blockCode,
              label: `${block.blockCode} — ${block.blockName}`,
            }))}
            filterOption={(input, option) =>
              String(option?.value ?? '')
                .toLocaleLowerCase('vi')
                .includes(input.toLocaleLowerCase('vi'))
            }
          />
        </Form.Item>
        <Form.Item
          name="isElective"
          label="Loại"
          extra={
            item?.electiveGroup &&
            'Gỡ khỏi nhóm tự chọn trước khi đổi thành bắt buộc.'
          }
        >
          <Radio.Group
            disabled={Boolean(item?.electiveGroup)}
            options={[
              { value: false, label: ELECTIVE_KIND_LABELS.compulsory },
              { value: true, label: ELECTIVE_KIND_LABELS.elective },
            ]}
          />
        </Form.Item>
        <Space size="large">
          <Form.Item name="htDa" valuePropName="checked">
            <Checkbox>{HT_DA_LABEL}</Checkbox>
          </Form.Item>
          <Form.Item name="tqDa" valuePropName="checked">
            <Checkbox>{TQ_DA_LABEL}</Checkbox>
          </Form.Item>
        </Space>
        <Space align="start">
          <Form.Item
            name="minStudiedScore"
            label="Điểm học"
            rules={[
              { pattern: GRADE_POINT_PATTERN, message: GRADE_POINT_MESSAGE },
            ]}
          >
            <Input inputMode="decimal" />
          </Form.Item>
          <Form.Item
            name="minTransferScore"
            label="Điểm chuyển"
            rules={[
              { pattern: GRADE_POINT_PATTERN, message: GRADE_POINT_MESSAGE },
            ]}
          >
            <Input inputMode="decimal" />
          </Form.Item>
        </Space>
        <Form.Item
          name="note"
          label="Ghi chú"
          rules={[
            {
              max: CURRICULUM_FORM_LIMITS.NOTE_MAX,
              message: `Ghi chú tối đa ${CURRICULUM_FORM_LIMITS.NOTE_MAX} ký tự.`,
            },
          ]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
