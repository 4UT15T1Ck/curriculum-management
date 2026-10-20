import { App, Button } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import { REQUEST_ID_PARAM } from '../../../shared/change-requests/requestParams';
import { CreateRequestButton } from '../../../shared/change-requests/CreateRequestButton';
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
  // Looking at a request's working copy: the request, not the course, is what a viewer acts on.
  const copy = data.draft?.sourceRequest ?? null;
  const editorBase = generatePath(ROUTES.syllabusEdit, {
    courseId: data.course.id,
  });
  const editorPath = copy
    ? `${editorBase}?${REQUEST_ID_PARAM}=${encodeURIComponent(copy.id)}`
    : editorBase;
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
  if (data.editPath === 'VIA_REQUEST' && !copy)
    return (
      <CreateRequestButton
        prefill={{
          type: 'SYLLABUS_CONTENT',
          targetType: 'COURSE',
          targetId: data.course.id,
        }}
      />
    );
  if (data.editPath === 'DIRECT' && data.draft)
    return (
      <Button onClick={() => void navigate(editorPath)}>{EDIT_SYLLABUS}</Button>
    );
  return null;
}
