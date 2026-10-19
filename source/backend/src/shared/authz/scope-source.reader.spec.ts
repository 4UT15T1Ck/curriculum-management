import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ScopeSource,
  SubjectGroupMemberRole,
  SubjectGroupStatus,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ScopeSourceReader } from './scope-source.reader.js';

const TODAY = new Date('2026-10-19T00:00:00.000Z');

describe('ScopeSourceReader', () => {
  let findMany: ReturnType<typeof vi.fn>;
  let reader: ScopeSourceReader;

  beforeEach(() => {
    findMany = vi
      .fn()
      .mockResolvedValue([
        { subjectGroupId: 'group-1' },
        { subjectGroupId: 'group-2' },
      ]);
    reader = new ScopeSourceReader({
      subjectGroupMember: { findMany },
    } as unknown as PrismaService);
  });

  it('limits coordinator scope to active coordinator rows in active groups', async () => {
    expect(
      await reader.activeTargets(
        ScopeSource.SUBJECT_GROUP_COORDINATOR,
        'lecturer',
        TODAY,
      ),
    ).toEqual({ subjectGroupIds: ['group-1', 'group-2'] });
    expect(findMany).toHaveBeenCalledWith({
      where: {
        lecturerId: 'lecturer',
        memberRole: SubjectGroupMemberRole.COORDINATOR,
        revokedAt: null,
        validFrom: { lte: TODAY },
        OR: [{ validTo: null }, { validTo: { gte: TODAY } }],
        subjectGroup: { status: SubjectGroupStatus.ACTIVE },
      },
      select: { subjectGroupId: true },
      distinct: ['subjectGroupId'],
    });
  });

  it('counts either role for member scope', async () => {
    expect(
      await reader.activeTargets(
        ScopeSource.SUBJECT_GROUP_MEMBER,
        'lecturer',
        TODAY,
      ),
    ).toEqual({ subjectGroupIds: ['group-1', 'group-2'] });
    const where = findMany.mock.calls[0][0].where;
    expect(where).not.toHaveProperty('memberRole');
    expect(where).toMatchObject({
      lecturerId: 'lecturer',
      revokedAt: null,
      subjectGroup: { status: SubjectGroupStatus.ACTIVE },
    });
  });

  it.each([ScopeSource.PROGRAM_DIRECTOR, ScopeSource.OWN_ENROLLMENT])(
    'leaves %s empty',
    async (source) => {
      expect(await reader.activeTargets(source, 'lecturer', TODAY)).toEqual({});
      expect(findMany).not.toHaveBeenCalled();
    },
  );
});
