import { App, Button, Dropdown } from 'antd';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { CourseAction, CourseDetail, CourseStatus } from '../api/courses';
import {
  CANCEL_CONFIRM_TEXT,
  COURSE_ACTION_LABELS,
  COURSE_STATUS_LABELS,
  NEXT_STATUS,
} from '../constants/courseLabels';
import { useChangeCourseStatus } from '../hooks/useCourses';

interface CourseStatusActionsProps {
  course: CourseDetail;
}

// Offers only the transitions valid from the current status; the server re-checks every guard.
const ACTIONS_BY_STATUS: Record<CourseStatus, CourseAction[]> = {
  ACTIVE: ['discontinue', 'cancel'],
  DISCONTINUED: ['reopen', 'cancel'],
  CANCELLED: [],
};

export function CourseStatusActions({ course }: CourseStatusActionsProps) {
  const { modal, message } = App.useApp();
  const mutation = useChangeCourseStatus();
  const run = (action: CourseAction) =>
    mutation.mutateAsync(
      { courseId: course.id, action },
      {
        onSuccess: () =>
          void message.success(
            `Đã chuyển sang ${COURSE_STATUS_LABELS[NEXT_STATUS[action]]}.`,
          ),
        onError: (error) =>
          void message.error(
            errorMessage(error, 'Không đổi được trạng thái học phần.'),
          ),
      },
    );
  const confirm = (action: CourseAction) =>
    modal.confirm({
      title: `${COURSE_ACTION_LABELS[action]} ${course.courseCode}?`,
      content: action === 'cancel' ? CANCEL_CONFIRM_TEXT : undefined,
      okButtonProps: { danger: action === 'cancel' },
      okText: COURSE_ACTION_LABELS[action],
      onOk: () => run(action).catch(() => undefined),
    });
  const actions = ACTIONS_BY_STATUS[course.status];
  if (actions.length === 0) return null;
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: actions.map((action) => ({
          key: action,
          label: COURSE_ACTION_LABELS[action],
          danger: action === 'cancel',
        })),
        onClick: ({ key }) => confirm(key as CourseAction),
      }}
    >
      <Button loading={mutation.isPending}>Đổi trạng thái</Button>
    </Dropdown>
  );
}
