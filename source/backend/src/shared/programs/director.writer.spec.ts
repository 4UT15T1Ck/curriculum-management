import {
  ProgramStatus,
  UserStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { fromIsoDay } from '../time/today.js';
import { assignDirector, endDirector } from './director.writer.js';

function client() {
  return {
    program: {
      findUnique: vi.fn().mockResolvedValue({ status: ProgramStatus.ACTIVE }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ status: UserStatus.ACTIVE }),
    },
    programDirectorAssignment: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'created' }),
      update: vi.fn().mockResolvedValue({ id: 'updated' }),
    },
  };
}
const asTx = (db: ReturnType<typeof client>) =>
  db as unknown as Prisma.TransactionClient;

describe('director writer', () => {
  const input = { directorId: 'director', validFrom: '2026-01-01' };

  it('creates the assignment on the client it is given', async () => {
    const db = client();
    await assignDirector(asTx(db), 'program', input, 'actor');
    expect(db.programDirectorAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          programId: 'program',
          assignedById: 'actor',
        }),
      }),
    );
  });

  it('refuses a missing or inactive program, a disabled director and an overlap', async () => {
    const missing = client();
    missing.program.findUnique.mockResolvedValue(null);
    await expect(
      assignDirector(asTx(missing), 'program', input, 'actor'),
    ).rejects.toMatchObject({ code: 'PROGRAM_NOT_FOUND' });
    const inactive = client();
    inactive.program.findUnique.mockResolvedValue({
      status: ProgramStatus.INACTIVE,
    });
    await expect(
      assignDirector(asTx(inactive), 'program', input, 'actor'),
    ).rejects.toMatchObject({ code: 'PROGRAM_INACTIVE' });
    const disabled = client();
    disabled.user.findUnique.mockResolvedValue({ status: UserStatus.DISABLED });
    await expect(
      assignDirector(asTx(disabled), 'program', input, 'actor'),
    ).rejects.toMatchObject({ code: 'DIRECTOR_INVALID' });
    const overlap = client();
    overlap.programDirectorAssignment.findFirst.mockResolvedValue({
      id: 'clash',
    });
    await expect(
      assignDirector(asTx(overlap), 'program', input, 'actor'),
    ).rejects.toMatchObject({ code: 'DIRECTOR_PERIOD_OVERLAP' });
  });

  it('ends an assignment only by shortening it', async () => {
    const db = client();
    const live = {
      id: 'row',
      validFrom: fromIsoDay('2026-01-01'),
      validTo: fromIsoDay('2026-12-31'),
    };
    db.programDirectorAssignment.findFirst.mockResolvedValue(live);
    await endDirector(asTx(db), 'program', 'row', '2026-06-30');
    expect(db.programDirectorAssignment.update).toHaveBeenCalledTimes(1);
    await expect(
      endDirector(asTx(db), 'program', 'row', '2026-12-31'),
    ).rejects.toMatchObject({ code: 'END_DATE_NOT_EARLIER' });
    await expect(
      endDirector(asTx(db), 'program', 'row', '2025-12-31'),
    ).rejects.toMatchObject({ code: 'VALIDITY_INVALID' });
    db.programDirectorAssignment.findFirst.mockResolvedValue(null);
    await expect(
      endDirector(asTx(db), 'program', 'row', '2026-06-30'),
    ).rejects.toMatchObject({ code: 'DIRECTOR_ASSIGNMENT_NOT_FOUND' });
  });
});
