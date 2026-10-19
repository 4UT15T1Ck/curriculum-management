import { Button } from 'antd';
import { CreateRequestButton } from '../../../shared/change-requests/CreateRequestButton';
import type { Curriculum } from '../api/curriculum';

interface CurriculumAddButtonProps {
  curriculum: Curriculum;
  onAdd: () => void;
}

// The server decides (canAddItems, editPath); the client never derives it from roles.
// Where the framework is released the edit goes through a request (FR-55).
export function CurriculumAddButton({
  curriculum,
  onAdd,
}: CurriculumAddButtonProps) {
  if (curriculum.canAddItems)
    return (
      <Button type="primary" onClick={onAdd}>
        Thêm học phần
      </Button>
    );
  if (curriculum.editPath === 'VIA_REQUEST')
    return (
      <CreateRequestButton
        prefill={{
          type: 'CURRICULUM',
          targetType: 'PROGRAM',
          targetId: curriculum.version.programId,
        }}
      />
    );
  return null;
}
