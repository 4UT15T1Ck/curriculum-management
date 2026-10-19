import { Button, Tooltip } from 'antd';
import { CHANGE_REQUEST_PENDING_TOOLTIP } from '../../../shared/constants/editPath';
import type { Curriculum } from '../api/curriculum';

interface CurriculumAddButtonProps {
  curriculum: Curriculum;
  onAdd: () => void;
}

// The server decides (canAddItems, editPath); the client never derives it from roles.
// F-13 turns the disabled button into "Tạo đề xuất".
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
      <Tooltip title={CHANGE_REQUEST_PENDING_TOOLTIP}>
        <Button disabled>Tạo đề xuất</Button>
      </Tooltip>
    );
  return null;
}
