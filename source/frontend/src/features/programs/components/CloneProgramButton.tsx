import { useState } from 'react';
import { Button } from 'antd';
import type { ProgramDetail } from '../api/programs';
import { CloneProgramModal } from './CloneProgramModal';

interface CloneProgramButtonProps {
  program: ProgramDetail;
}

export function CloneProgramButton({ program }: CloneProgramButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Nhân bản</Button>
      {open && (
        <CloneProgramModal program={program} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
