import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../generated/prisma/client.js';
import {
  applyApprovedCourseField,
  assertCourseOwners,
} from './course.writer.js';

describe('course writer', () => {
  let course: {
    findUniqueOrThrow: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let orgUnit: { findUnique: ReturnType<typeof vi.fn> };
  let subjectGroup: { findUnique: ReturnType<typeof vi.fn> };
  let tx: Prisma.TransactionClient;

  beforeEach(() => {
    course = {
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        id: 'c1',
        status: 'ACTIVE',
        ownerFacultyId: 'f1',
      }),
      update: vi.fn().mockResolvedValue({}),
    };
    orgUnit = {
      findUnique: vi.fn().mockResolvedValue({
        id: 'f1',
        unitType: 'FACULTY',
        status: 'ACTIVE',
        unitCode: 'KHOA_CNTT',
      }),
    };
    subjectGroup = {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 'g1', status: 'ACTIVE', facultyId: 'f1' }),
    };
    tx = {
      course,
      orgUnit,
      subjectGroup,
    } as unknown as Prisma.TransactionClient;
  });

  describe('assertCourseOwners', () => {
    it('accepts an active faculty and an active group of that faculty, and says whether the faculty is foreign', async () => {
      expect(await assertCourseOwners(tx, 'f1', 'g1')).toEqual({
        ownerFacultyId: 'f1',
        ownerGroupId: 'g1',
        isForeign: false,
      });
      orgUnit.findUnique.mockResolvedValue({
        id: 'f2',
        unitType: 'FACULTY',
        status: 'ACTIVE',
        unitCode: 'KHOA_KHAC',
      });
      expect((await assertCourseOwners(tx, 'f2', null)).isForeign).toBe(true);
    });

    it('refuses an inactive or non-faculty unit and a group of another faculty', async () => {
      orgUnit.findUnique.mockResolvedValue({
        unitType: 'DEPARTMENT',
        status: 'ACTIVE',
      });
      await expect(assertCourseOwners(tx, 'f1', null)).rejects.toMatchObject({
        code: 'OWNER_FACULTY_INVALID',
      });
      orgUnit.findUnique.mockResolvedValue({
        unitType: 'FACULTY',
        status: 'INACTIVE',
        unitCode: 'X',
      });
      await expect(assertCourseOwners(tx, 'f1', null)).rejects.toMatchObject({
        code: 'OWNER_FACULTY_INVALID',
      });
      orgUnit.findUnique.mockResolvedValue({
        unitType: 'FACULTY',
        status: 'ACTIVE',
        unitCode: 'X',
      });
      subjectGroup.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        facultyId: 'other',
      });
      await expect(assertCourseOwners(tx, 'f1', 'g1')).rejects.toMatchObject({
        code: 'OWNER_GROUP_INVALID',
      });
    });
  });

  describe('applyApprovedCourseField', () => {
    it('writes each field with the catalog rules: name, English name, credits, type', async () => {
      await applyApprovedCourseField(tx, 'c1', 'courseName', 'Tên mới');
      await applyApprovedCourseField(tx, 'c1', 'englishName', null);
      await applyApprovedCourseField(tx, 'c1', 'credits', '4');
      await applyApprovedCourseField(tx, 'c1', 'courseType', 'PRACTICE');

      const data = course.update.mock.calls.map((call) => call[0].data);
      expect(data[0]).toEqual({ courseName: 'Tên mới' });
      expect(data[1]).toEqual({ englishName: null });
      expect(data[2].credits.toString()).toBe('4');
      expect(data[3]).toEqual({ courseType: 'PRACTICE' });
    });

    it('moves the course into a group only when the group is an active one of its faculty', async () => {
      await applyApprovedCourseField(tx, 'c1', 'ownerGroupId', 'g1');
      expect(course.update.mock.calls[0][0].data).toEqual({
        ownerGroup: { connect: { id: 'g1' } },
      });
      await applyApprovedCourseField(tx, 'c1', 'ownerGroupId', null);
      expect(course.update.mock.calls[1][0].data).toEqual({
        ownerGroup: { disconnect: true },
      });

      subjectGroup.findUnique.mockResolvedValue({
        status: 'INACTIVE',
        facultyId: 'f1',
      });
      await expect(
        applyApprovedCourseField(tx, 'c1', 'ownerGroupId', 'g1'),
      ).rejects.toMatchObject({ code: 'OWNER_GROUP_INVALID' });
      expect(course.update).toHaveBeenCalledTimes(2);
    });

    it('refuses a value the field cannot take, a cancelled course, and writes nothing', async () => {
      for (const [field, value] of [
        ['courseName', '  '],
        ['courseName', null],
        ['credits', '3.333'],
        ['credits', null],
        ['courseType', 'NOPE'],
      ] as const) {
        await expect(
          applyApprovedCourseField(tx, 'c1', field, value),
        ).rejects.toMatchObject({ code: 'COURSE_FIELD_INVALID' });
      }
      course.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'CANCELLED',
        ownerFacultyId: 'f1',
      });
      await expect(
        applyApprovedCourseField(tx, 'c1', 'courseName', 'X'),
      ).rejects.toMatchObject({ code: 'COURSE_CANCELLED' });
      expect(course.update).not.toHaveBeenCalled();
    });
  });
});
