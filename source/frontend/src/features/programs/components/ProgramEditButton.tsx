import { Button } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import { CreateRequestButton } from '../../../shared/change-requests/CreateRequestButton';
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
      <CreateRequestButton
        prefill={{
          type: 'PROGRAM_INFO',
          targetType: 'PROGRAM',
          targetId: program.id,
        }}
      />
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
