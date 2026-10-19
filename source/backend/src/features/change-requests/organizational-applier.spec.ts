import type { Prisma } from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { OrganizationalApplier } from './organizational-applier.js';

const writers = vi.hoisted(() => ({
  addMembership: vi.fn(),
  endMembership: vi.fn(),
  assignDirector: vi.fn(),
  endDirector: vi.fn(),
}));
vi.mock('../../shared/subject-groups/membership.writer.js', () => ({
  addMembership: writers.addMembership,
  endMembership: writers.endMembership,
}));
vi.mock('../../shared/programs/director.writer.js', () => ({
  assignDirector: writers.assignDirector,
  endDirector: writers.endDirector,
}));

const item = (label: string, newValue: object) => ({ label, newValue });
const request = { id: 'r1', subjectGroupId: 'g1', programId: 'p1' };

describe('OrganizationalApplier', () => {
  const findMany = vi.fn();
  const tx = {
    changeItem: { findMany },
  } as unknown as Prisma.TransactionClient;
  const applier = new OrganizationalApplier();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(writers).forEach((writer) => writer.mockResolvedValue({}));
  });

  it('applies each item in order through the owning writer on the same transaction', async () => {
    findMany.mockResolvedValue([
      item('Thêm A', {
        operation: 'ADD_MEMBER',
        lecturerId: 'a',
        memberRole: 'MEMBER',
        validFrom: '2026-01-01',
        validTo: null,
      }),
      item('Kết thúc B', {
        operation: 'END_MEMBERSHIP',
        memberRowId: 'm1',
        validTo: '2026-06-30',
      }),
      item('Giao C', {
        operation: 'ASSIGN_DIRECTOR',
        directorId: 'c',
        validFrom: '2026-01-01',
        validTo: null,
      }),
      item('Kết thúc D', {
        operation: 'END_DIRECTOR',
        assignmentId: 'd1',
        validTo: '2026-06-30',
      }),
    ]);
    await applier.apply(tx, request, 'actor');
    expect(writers.addMembership).toHaveBeenCalledWith(
      tx,
      'g1',
      expect.objectContaining({ lecturerId: 'a' }),
      'actor',
    );
    expect(writers.endMembership).toHaveBeenCalledWith(
      tx,
      'g1',
      'm1',
      '2026-06-30',
      'actor',
    );
    expect(writers.assignDirector).toHaveBeenCalledWith(
      tx,
      'p1',
      expect.objectContaining({ directorId: 'c' }),
      'actor',
    );
    expect(writers.endDirector).toHaveBeenCalledWith(
      tx,
      'p1',
      'd1',
      '2026-06-30',
    );
  });

  it('turns a writer refusal into ORGANIZATION_APPLY_FAILED naming the item', async () => {
    findMany.mockResolvedValue([
      item('Thêm A', {
        operation: 'ADD_MEMBER',
        lecturerId: 'a',
        memberRole: 'MEMBER',
        validFrom: '2026-01-01',
        validTo: null,
      }),
    ]);
    writers.addMembership.mockRejectedValue(
      new AppException({
        status: 409,
        code: 'MEMBERSHIP_OVERLAP',
        message: 'm',
      }),
    );
    await expect(applier.apply(tx, request, 'actor')).rejects.toMatchObject({
      code: 'ORGANIZATION_APPLY_FAILED',
      details: [{ field: 'Thêm A', constraints: ['MEMBERSHIP_OVERLAP'] }],
    });
  });

  it('lets a non-business error and a non-organisational payload through', async () => {
    findMany.mockResolvedValue([item('X', { operation: 'ADD_RELATION' })]);
    await expect(applier.apply(tx, request, 'actor')).rejects.toThrow(
      'not organisational',
    );
    findMany.mockResolvedValue([
      item('Y', {
        operation: 'END_DIRECTOR',
        assignmentId: 'd',
        validTo: '2026-06-30',
      }),
    ]);
    writers.endDirector.mockRejectedValue(new Error('boom'));
    await expect(applier.apply(tx, request, 'actor')).rejects.toThrow('boom');
  });
});
