import { Button, Tooltip } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import { CHANGE_REQUEST_PENDING_TOOLTIP } from '../../../shared/constants/editPath';
import type { ProgramDetail } from '../api/programs';

interface ProgramEditButtonProps {
  program: ProgramDetail;
}

// The server decides the path (editPath); the client never derives it from roles.
export function ProgramEditButton({ program }: ProgramEditButtonProps) {
  const navigate = useNavigate();
  if (program.editPath === null) return null;
  if (program.editPath === 'VIA_REQUEST')
    return (
      <Tooltip title={CHANGE_REQUEST_PENDING_TOOLTIP}>
        <Button disabled>Tạo đề xuất</Button>
      </Tooltip>
    );
  return (
    <Button
      onClick={() =>
        void navigate(
          generatePath(ROUTES.programEdit, { programId: program.id }),
        )
      }
    >
      Sửa thông tin
    </Button>
  );
}
