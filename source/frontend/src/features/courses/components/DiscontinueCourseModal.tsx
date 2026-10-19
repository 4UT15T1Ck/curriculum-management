import { App, Modal, Typography } from 'antd';
import { useState } from 'react';
import { CourseSelect } from '../../../shared/courses/CourseSelect';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { CourseDetail } from '../api/courses';
import { useChangeCourseStatus } from '../hooks/useCourses';
import { useCourseRelations } from '../hooks/useCourseRelations';

interface DiscontinueCourseModalProps {
  course: CourseDetail;
  onClose: () => void;
}

// "Ngừng mở lớp" needs an active replacement (HP-02): the dialog shows the one already declared,
// or lets the user pick one, which the server relates in the same step (D11).
export function DiscontinueCourseModal({
  course,
  onClose,
}: DiscontinueCourseModalProps) {
  const { data: relations = [] } = useCourseRelations(course.id);
  const replacements = relations.filter(
    (relation) =>
      relation.relationType === 'REPLACEMENT' &&
      relation.sourceCourse.id === course.id &&
      relation.targetCourse.status === 'ACTIVE',
  );
  const [replacementCourseId, setReplacementCourseId] = useState<string>();
  const mutation = useChangeCourseStatus();
  const { message } = App.useApp();
  const canSubmit =
    replacements.length > 0 || replacementCourseId !== undefined;
  return (
    <Modal
      open
      title={`Ngừng mở lớp ${course.courseCode}`}
      onCancel={onClose}
      okText="Ngừng mở lớp"
      cancelText="Hủy"
      okButtonProps={{ disabled: !canSubmit }}
      confirmLoading={mutation.isPending}
      onOk={() =>
        mutation.mutate(
          {
            courseId: course.id,
            action: 'discontinue',
            body: { replacementCourseId },
          },
          {
            onSuccess: () => {
              void message.success('Đã chuyển sang Ngừng mở lớp.');
              onClose();
            },
            onError: (error) =>
              void message.error(
                errorMessage(error, 'Không đổi được trạng thái học phần.'),
              ),
          },
        )
      }
    >
      {replacements.length > 0 ? (
        <Typography.Paragraph>
          Học phần thay thế:{' '}
          {replacements
            .map((relation) => relation.targetCourse.courseCode)
            .join(', ')}
          . Có thể thêm học phần thay thế khác bên dưới.
        </Typography.Paragraph>
      ) : (
        <Typography.Paragraph>
          Chọn học phần thay thế (bắt buộc):
        </Typography.Paragraph>
      )}
      <CourseSelect
        value={replacementCourseId}
        onChange={setReplacementCourseId}
        excludeIds={[course.id]}
        placeholder="Thêm học phần thay thế"
      />
    </Modal>
  );
}
