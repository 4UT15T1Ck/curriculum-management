import {
  SubjectGroupMemberRole,
  SubjectGroupStatus,
  UserStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { fromIsoDay } from '../time/today.js';
import { addMembership, endMembership } from './membership.writer.js';

const LECTURER = { id: 'lecturer', status: UserStatus.ACTIVE };
const MEMBER_ROW = {
  id: 'member',
  subjectGroupId: 'group',
  lecturerId: 'lecturer',
  memberRole: SubjectGroupMemberRole.MEMBER,
  validFrom: fromIsoDay('2026-01-01'),
  validTo: null,
  revokedAt: null,
};

function client(overrides: Record<string, unknown> = {}) {
  return {
    subjectGroup: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 'group', status: SubjectGroupStatus.ACTIVE }),
    },
    user: { findUnique: vi.fn().mockResolvedValue(LECTURER) },
    subjectGroupMember: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'created' }),
      update: vi.fn().mockResolvedValue({ id: 'updated' }),
    },
    ...overrides,
  };
}
const asTx = (db: ReturnType<typeof client>) =>
  db as unknown as Prisma.TransactionClient;

describe('membership writer', () => {
  const input = {
    lecturerId: 'lecturer',
    memberRole: SubjectGroupMemberRole.MEMBER,
    validFrom: '2026-01-01',
    validTo: null,
  };

  it('writes the row on the client it is given', async () => {
    const db = client();
    await addMembership(asTx(db), 'group', input, 'actor');
    expect(db.subjectGroupMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ assignedById: 'actor' }),
      }),
    );
  });

  it('refuses a missing or inactive group and a disabled lecturer', async () => {
    const missing = client();
    missing.subjectGroup.findUnique.mockResolvedValue(null);
    await expect(
      addMembership(asTx(missing), 'group', input, 'actor'),
    ).rejects.toMatchObject({ code: 'SUBJECT_GROUP_NOT_FOUND' });
    const inactive = client();
    inactive.subjectGroup.findUnique.mockResolvedValue({
      status: SubjectGroupStatus.INACTIVE,
    });
    await expect(
      addMembership(asTx(inactive), 'group', input, 'actor'),
    ).rejects.toMatchObject({ code: 'SUBJECT_GROUP_INACTIVE' });
    const disabled = client();
    disabled.user.findUnique.mockResolvedValue({
      status: UserStatus.DISABLED,
    });
    await expect(
      addMembership(asTx(disabled), 'group', input, 'actor'),
    ).rejects.toMatchObject({ code: 'LECTURER_INVALID' });
  });

  it('refuses an overlapping row and a coordinator without a covering member row', async () => {
    const overlap = client();
    overlap.subjectGroupMember.findFirst.mockResolvedValue({ id: 'clash' });
    await expect(
      addMembership(asTx(overlap), 'group', input, 'actor'),
    ).rejects.toMatchObject({ code: 'MEMBERSHIP_OVERLAP' });
    const uncovered = client();
    await expect(
      addMembership(
        asTx(uncovered),
        'group',
        { ...input, memberRole: SubjectGroupMemberRole.COORDINATOR },
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'COORDINATOR_NOT_MEMBER' });
  });

  it('ends a row and refuses a date that does not shorten it', async () => {
    const db = client();
    db.subjectGroupMember.findFirst.mockResolvedValue(MEMBER_ROW);
    const changed = await endMembership(
      asTx(db),
      'group',
      'member',
      '2026-06-30',
      'actor',
    );
    expect(changed).toHaveLength(1);
    db.subjectGroupMember.findFirst.mockResolvedValue({
      ...MEMBER_ROW,
      validTo: fromIsoDay('2026-06-30'),
    });
    await expect(
      endMembership(asTx(db), 'group', 'member', '2026-06-30', 'actor'),
    ).rejects.toMatchObject({ code: 'END_DATE_NOT_EARLIER' });
    db.subjectGroupMember.findFirst.mockResolvedValue({
      ...MEMBER_ROW,
      revokedAt: new Date(),
    });
    await expect(
      endMembership(asTx(db), 'group', 'member', '2026-06-30', 'actor'),
    ).rejects.toMatchObject({ code: 'MEMBER_ALREADY_REVOKED' });
  });
});
