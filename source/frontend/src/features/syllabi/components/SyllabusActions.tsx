import { App, Button, Tooltip } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import { CHANGE_REQUEST_PENDING_TOOLTIP } from '../../../shared/constants/editPath';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { CourseSyllabus } from '../api/syllabi';
import { CREATE_SYLLABUS, EDIT_SYLLABUS } from '../constants/syllabusLabels';
import { useCreateSyllabus } from '../hooks/useSyllabus';

interface SyllabusActionsProps {
  data: CourseSyllabus;
}

// The server decides what the caller may do (canCreate, editPath); the client never derives it from roles.
export function SyllabusActions({ data }: SyllabusActionsProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const create = useCreateSyllabus(data.course.id);
  const editorPath = generatePath(ROUTES.syllabusEdit, {
    courseId: data.course.id,
  });
  if (data.canCreate)
    return (
      <Button
        type="primary"
        loading={create.isPending}
        onClick={() =>
          create.mutate(undefined, {
            onSuccess: () => void navigate(editorPath),
            onError: (reason) =>
              void message.error(
                errorMessage(reason, 'Không tạo được đề cương.'),
              ),
          })
        }
      >
        {CREATE_SYLLABUS}
      </Button>
    );
  if (data.editPath === 'VIA_REQUEST')
    return (
      <Tooltip title={CHANGE_REQUEST_PENDING_TOOLTIP}>
        <Button disabled>Tạo đề xuất</Button>
      </Tooltip>
    );
  if (data.editPath === 'DIRECT' && data.draft)
    return (
      <Button onClick={() => void navigate(editorPath)}>{EDIT_SYLLABUS}</Button>
    );
  return null;
}
