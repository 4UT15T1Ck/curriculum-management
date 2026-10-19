import { Injectable } from '@nestjs/common';
import {
  ChangeRequestStatus,
  CourseType,
  Prisma,
  SubjectGroupStatus,
  UserStatus,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { REQUEST_DRAFT_ERRORS } from '../../shared/change-requests/change-request.errors.js';
import {
  AUTHORED_ENTITY,
  AUTHORED_OPERATION,
  OPERATIONS_BY_TYPE,
  type AuthoredPayload,
} from '../../shared/change-requests/authored-item.types.js';
import {
  COURSE_FIELD_LABELS,
  MEMBER_ROLE_LABELS,
  RELATION_TYPE_LABELS,
} from '../../shared/change-requests/diff/diff-labels.js';
import {
  toJsonInput,
  type ChangeItemDraft,
} from '../../shared/change-requests/diff/snapshot-entry.js';
import { sortDrafts } from '../../shared/change-requests/diff/snapshot-differ.js';
import {
  toWireDecimal,
  CREDITS_MESSAGE,
  CREDITS_PATTERN,
} from '../../shared/decimal/decimal.js';
import { AppException } from '../../shared/exception/app.exception.js';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { programTarget } from '../../shared/programs/program-target.js';
import { fromIsoDay, toIsoDay } from '../../shared/time/today.js';
import { parsePeriod } from '../../shared/time/validity.js';
import { ChangeRequestDetailReader } from './change-request-detail.reader.js';
import { AUTHORED_ITEM_ERRORS } from './change-request-feature.errors.js';
import { CHANGE_REQUEST_LIMITS } from './change-request.constants.js';
import type { ChangeRequestDetailDto } from './change-request-response.dto.js';
import type {
  AuthoredItemInput,
  ReplaceAuthoredItemsDto,
  UserOptionDto,
} from './authored-item.dto.js';
import { ChangeRequestsService } from './change-requests.service.js';
import type { RequestCore } from './request-visibility.js';

type Described = Omit<ChangeItemDraft, 'sortOrder'>;

// Types without a working copy (course attributes and relations, organisational changes) keep their changes as items
// while the request is a Draft. Only light checks run here; the owning feature's full rules run when F-14 / F-15 apply them.
@Injectable()
export class AuthoredItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requests: ChangeRequestsService,
    private readonly details: ChangeRequestDetailReader,
  ) {}

  async replace(
    id: string,
    dto: ReplaceAuthoredItemsDto,
    access: AccessContext,
  ): Promise<ChangeRequestDetailDto> {
    const request = await this.requests.findOwnDraft(id, access);
    const allowed = OPERATIONS_BY_TYPE[request.requestType];
    if (!allowed) {
      throw new AppException(AUTHORED_ITEM_ERRORS.ITEMS_NOT_AUTHORED);
    }
    const drafts: ChangeItemDraft[] = [];
    for (const [index, input] of dto.items.entries()) {
      if (!allowed.includes(input.operation)) {
        throw itemError(AUTHORED_ITEM_ERRORS.OPERATION_NOT_FOR_TYPE, index);
      }
      const described = await this.describe(request, input, access, index);
      drafts.push({ ...described, sortOrder: index });
    }
    assertUniqueKeys(drafts);
    const ordered = sortDrafts(drafts).map((draft, sortOrder) => ({
      ...draft,
      sortOrder,
    }));
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.changeRequest.updateMany({
        where: { id, status: ChangeRequestStatus.DRAFT },
        data: { updatedAt: new Date() },
      });
      if (count === 0) {
        throw new AppException(REQUEST_DRAFT_ERRORS.NOT_DRAFT);
      }
      await tx.changeItem.deleteMany({ where: { changeRequestId: id } });
      await tx.changeItem.createMany({
        data: ordered.map((draft) => ({
          changeRequestId: id,
          sortOrder: draft.sortOrder,
          entityType: draft.entityType,
          itemKey: draft.itemKey,
          label: draft.label,
          recordId: draft.recordId,
          oldValue: toJsonInput(draft.oldValue),
          newValue: toJsonInput(draft.newValue),
          baseVersion: draft.baseVersion,
        })),
      });
    });
    return this.details.read(id, access);
  }

  // R2 and R4 cannot call GET /users (R1-only), so the pickers of the organisational form read this.
  userOptions(q: string | undefined): Promise<UserOptionDto[]> {
    const term = q?.trim();
    return this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        ...(term && {
          OR: [
            { userCode: { contains: term, mode: 'insensitive' } },
            { fullName: { contains: term, mode: 'insensitive' } },
            { username: { contains: term, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, userCode: true, fullName: true },
      orderBy: { userCode: 'asc' },
      take: CHANGE_REQUEST_LIMITS.USER_OPTIONS_MAX,
    });
  }

  // Resolves the referenced rows once, so the label and the "before" value are what the creator saw.
  private async describe(
    request: RequestCore,
    input: AuthoredItemInput,
    access: AccessContext,
    index: number,
  ): Promise<Described> {
    switch (input.operation) {
      case AUTHORED_OPERATION.SET_COURSE_FIELD:
        return this.courseField(request, input, index);
      case AUTHORED_OPERATION.ADD_RELATION:
      case AUTHORED_OPERATION.UPDATE_RELATION:
      case AUTHORED_OPERATION.REMOVE_RELATION:
        return this.relation(request, input, index);
      case AUTHORED_OPERATION.ADD_MEMBER:
      case AUTHORED_OPERATION.END_MEMBERSHIP:
        return this.membership(request, input, access, index);
      case AUTHORED_OPERATION.ASSIGN_DIRECTOR:
      case AUTHORED_OPERATION.END_DIRECTOR:
        return this.director(request, input, access, index);
    }
  }

  private async courseField(
    request: RequestCore,
    input: Extract<AuthoredItemInput, { operation: 'SET_COURSE_FIELD' }>,
    index: number,
  ): Promise<Described> {
    const course = await this.prisma.course.findUniqueOrThrow({
      where: { id: request.courseId! },
      select: {
        courseName: true,
        englishName: true,
        credits: true,
        courseType: true,
        ownerGroupId: true,
        ownerFacultyId: true,
        ownerGroup: { select: { groupCode: true } },
      },
    });
    const { field } = input;
    const current: Record<typeof field, string | null> = {
      courseName: course.courseName,
      englishName: course.englishName,
      credits: toWireDecimal(course.credits),
      courseType: course.courseType,
      ownerGroupId: course.ownerGroupId,
    };
    const value = await this.validCourseValue(
      field,
      input.value,
      course.ownerFacultyId,
      index,
    );
    if (value.normalized === current[field]) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_UNCHANGED, index);
    }
    const isGroup = field === 'ownerGroupId';
    const payload: AuthoredPayload = {
      operation: 'SET_COURSE_FIELD',
      field,
      value: value.normalized,
      ...(isGroup && { display: value.display }),
    };
    return {
      entityType: AUTHORED_ENTITY.COURSE_FIELD,
      itemKey: field,
      label: COURSE_FIELD_LABELS[field],
      recordId: request.courseId,
      oldValue: {
        value: current[field],
        ...(isGroup && { display: course.ownerGroup?.groupCode ?? null }),
      },
      newValue: payload,
      baseVersion: null,
    };
  }

  private async validCourseValue(
    field: string,
    raw: string | null,
    facultyId: string,
    index: number,
  ): Promise<{ normalized: string | null; display: string | null }> {
    const invalid = () => itemError(AUTHORED_ITEM_ERRORS.ITEM_INVALID, index);
    switch (field) {
      case 'courseName':
        if (raw === null) throw invalid();
        return { normalized: raw, display: raw };
      case 'credits':
        if (raw === null || !CREDITS_PATTERN.test(raw)) {
          throw itemError(
            AUTHORED_ITEM_ERRORS.ITEM_INVALID,
            index,
            CREDITS_MESSAGE,
          );
        }
        return { normalized: new Prisma.Decimal(raw).toString(), display: raw };
      case 'courseType':
        if (
          raw === null ||
          !(Object.values(CourseType) as string[]).includes(raw)
        ) {
          throw invalid();
        }
        return { normalized: raw, display: raw };
      case 'ownerGroupId': {
        if (raw === null) return { normalized: null, display: null };
        const group = await this.prisma.subjectGroup.findUnique({
          where: { id: raw },
          select: { groupCode: true, status: true, facultyId: true },
        });
        if (
          !group ||
          group.status !== SubjectGroupStatus.ACTIVE ||
          group.facultyId !== facultyId
        ) {
          throw invalid();
        }
        return { normalized: raw, display: group.groupCode };
      }
      default:
        return { normalized: raw, display: raw };
    }
  }

  private async relation(
    request: RequestCore,
    input: Extract<
      AuthoredItemInput,
      { operation: 'ADD_RELATION' | 'UPDATE_RELATION' | 'REMOVE_RELATION' }
    >,
    index: number,
  ): Promise<Described> {
    const mismatch = () =>
      itemError(AUTHORED_ITEM_ERRORS.OPERATION_TARGET_MISMATCH, index);
    const courseId = request.courseId!;
    if (input.operation === AUTHORED_OPERATION.ADD_RELATION) {
      const { sourceCourseId, targetCourseId, relationType } = input;
      if (
        sourceCourseId === targetCourseId ||
        (sourceCourseId !== courseId && targetCourseId !== courseId)
      ) {
        throw mismatch();
      }
      const courses = await this.prisma.course.findMany({
        where: { id: { in: [sourceCourseId, targetCourseId] } },
        select: { id: true, courseCode: true },
      });
      const code = new Map(courses.map((c) => [c.id, c.courseCode]));
      if (code.size !== 2) {
        throw itemError(AUTHORED_ITEM_ERRORS.ITEM_REFERENCE_NOT_FOUND, index);
      }
      const existing = await this.prisma.courseRelation.findUnique({
        where: {
          sourceCourseId_targetCourseId_relationType: {
            sourceCourseId,
            targetCourseId,
            relationType,
          },
        },
        select: { id: true },
      });
      if (existing) throw itemError(AUTHORED_ITEM_ERRORS.ITEM_INVALID, index);
      const source = code.get(sourceCourseId)!;
      const target = code.get(targetCourseId)!;
      return {
        entityType: AUTHORED_ENTITY.COURSE_RELATION,
        itemKey: `${source}|${target}|${relationType}`,
        label: relationLabel(source, target, relationType),
        recordId: null,
        oldValue: null,
        newValue: {
          operation: 'ADD_RELATION',
          sourceCourseId,
          targetCourseId,
          relationType,
          minScore: normalizeScore(input.minScore),
        },
        baseVersion: null,
      };
    }
    const row = await this.prisma.courseRelation.findUnique({
      where: { id: input.relationId },
      select: {
        id: true,
        relationType: true,
        minScore: true,
        sourceCourseId: true,
        targetCourseId: true,
        sourceCourse: { select: { courseCode: true } },
        targetCourse: { select: { courseCode: true } },
      },
    });
    if (!row) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_REFERENCE_NOT_FOUND, index);
    }
    if (row.sourceCourseId !== courseId && row.targetCourseId !== courseId) {
      throw mismatch();
    }
    const current = row.minScore === null ? null : toWireDecimal(row.minScore);
    const base = {
      entityType: AUTHORED_ENTITY.COURSE_RELATION,
      itemKey: `${row.sourceCourse.courseCode}|${row.targetCourse.courseCode}|${row.relationType}`,
      label: relationLabel(
        row.sourceCourse.courseCode,
        row.targetCourse.courseCode,
        row.relationType,
      ),
      recordId: row.id,
      oldValue: { minScore: current },
      baseVersion: null,
    };
    if (input.operation === AUTHORED_OPERATION.REMOVE_RELATION) {
      return {
        ...base,
        newValue: { operation: 'REMOVE_RELATION', relationId: row.id },
      };
    }
    const minScore = normalizeScore(input.minScore);
    if (minScore === current) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_UNCHANGED, index);
    }
    return {
      ...base,
      newValue: { operation: 'UPDATE_RELATION', relationId: row.id, minScore },
    };
  }

  private async membership(
    request: RequestCore,
    input: Extract<
      AuthoredItemInput,
      { operation: 'ADD_MEMBER' | 'END_MEMBERSHIP' }
    >,
    access: AccessContext,
    index: number,
  ): Promise<Described> {
    const groupId = request.subjectGroupId;
    if (!groupId) {
      throw itemError(AUTHORED_ITEM_ERRORS.OPERATION_TARGET_MISMATCH, index);
    }
    const group = await this.prisma.subjectGroup.findUniqueOrThrow({
      where: { id: groupId },
      select: { facultyId: true },
    });
    // Re-checked on every save: a coordinator whose period ended keeps the draft but cannot add to it (US-060 AC4).
    access.assertCan(PERMISSIONS.CHANGE_REQUEST_CREATE_ORGANIZATIONAL, {
      subjectGroupIds: [groupId],
      orgUnitIds: [group.facultyId],
    });
    if (input.operation === AUTHORED_OPERATION.ADD_MEMBER) {
      const lecturer = await this.activeUser(input.lecturerId, index);
      parsePeriod(input.validFrom, input.validTo);
      return {
        entityType: AUTHORED_ENTITY.ORG_MEMBERSHIP,
        itemKey: `ADD|${input.lecturerId}|${input.memberRole}|${input.validFrom}`,
        label: `Thêm ${lecturer.fullName} — ${MEMBER_ROLE_LABELS[input.memberRole]}, từ ${viDate(input.validFrom)}`,
        recordId: null,
        oldValue: null,
        newValue: {
          operation: 'ADD_MEMBER',
          lecturerId: input.lecturerId,
          memberRole: input.memberRole,
          validFrom: input.validFrom,
          validTo: input.validTo ?? null,
        },
        baseVersion: null,
      };
    }
    const row = await this.prisma.subjectGroupMember.findUnique({
      where: { id: input.memberRowId },
      select: {
        id: true,
        subjectGroupId: true,
        memberRole: true,
        validFrom: true,
        validTo: true,
        revokedAt: true,
        lecturer: { select: { fullName: true } },
      },
    });
    if (!row) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_REFERENCE_NOT_FOUND, index);
    }
    if (row.subjectGroupId !== groupId || row.revokedAt !== null) {
      throw itemError(AUTHORED_ITEM_ERRORS.OPERATION_TARGET_MISMATCH, index);
    }
    parsePeriod(toIsoDay(row.validFrom), input.validTo);
    return {
      entityType: AUTHORED_ENTITY.ORG_MEMBERSHIP,
      itemKey: `END|${row.id}`,
      label: `Kết thúc ${row.lecturer.fullName} — ${MEMBER_ROLE_LABELS[row.memberRole]}, đến ${viDate(input.validTo)}`,
      recordId: row.id,
      oldValue: { validTo: row.validTo ? toIsoDay(row.validTo) : null },
      newValue: {
        operation: 'END_MEMBERSHIP',
        memberRowId: row.id,
        validTo: input.validTo,
      },
      baseVersion: null,
    };
  }

  private async director(
    request: RequestCore,
    input: Extract<
      AuthoredItemInput,
      { operation: 'ASSIGN_DIRECTOR' | 'END_DIRECTOR' }
    >,
    access: AccessContext,
    index: number,
  ): Promise<Described> {
    const programId = request.programId;
    if (!programId) {
      throw itemError(AUTHORED_ITEM_ERRORS.OPERATION_TARGET_MISMATCH, index);
    }
    const program = await this.prisma.program.findUniqueOrThrow({
      where: { id: programId },
      select: { id: true, facultyId: true },
    });
    access.assertCan(
      PERMISSIONS.CHANGE_REQUEST_CREATE_ORGANIZATIONAL,
      programTarget(program),
    );
    if (input.operation === AUTHORED_OPERATION.ASSIGN_DIRECTOR) {
      const user = await this.activeUser(input.directorId, index);
      parsePeriod(input.validFrom, input.validTo);
      return {
        entityType: AUTHORED_ENTITY.ORG_DIRECTOR,
        itemKey: `ASSIGN|${input.directorId}|${input.validFrom}`,
        label: `Phân công ${user.fullName} làm Giám đốc CTĐT, từ ${viDate(input.validFrom)}`,
        recordId: null,
        oldValue: null,
        newValue: {
          operation: 'ASSIGN_DIRECTOR',
          directorId: input.directorId,
          validFrom: input.validFrom,
          validTo: input.validTo ?? null,
        },
        baseVersion: null,
      };
    }
    const row = await this.prisma.programDirectorAssignment.findUnique({
      where: { id: input.assignmentId },
      select: {
        id: true,
        programId: true,
        validFrom: true,
        validTo: true,
        revokedAt: true,
        director: { select: { fullName: true } },
      },
    });
    if (!row) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_REFERENCE_NOT_FOUND, index);
    }
    if (row.programId !== programId || row.revokedAt !== null) {
      throw itemError(AUTHORED_ITEM_ERRORS.OPERATION_TARGET_MISMATCH, index);
    }
    parsePeriod(toIsoDay(row.validFrom), input.validTo);
    return {
      entityType: AUTHORED_ENTITY.ORG_DIRECTOR,
      itemKey: `END|${row.id}`,
      label: `Kết thúc phân công ${row.director.fullName}, đến ${viDate(input.validTo)}`,
      recordId: row.id,
      oldValue: { validTo: row.validTo ? toIsoDay(row.validTo) : null },
      newValue: {
        operation: 'END_DIRECTOR',
        assignmentId: row.id,
        validTo: input.validTo,
      },
      baseVersion: null,
    };
  }

  private async activeUser(id: string, index: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { fullName: true, status: true },
    });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_REFERENCE_NOT_FOUND, index);
    }
    return user;
  }
}

// The details name the row ("items.2") so the form can mark it.
function itemError(
  definition: ErrorDefinition,
  index: number,
  message?: string,
): AppException {
  return new AppException(message ? { ...definition, message } : definition, [
    { field: `items.${index}`, constraints: [definition.code] },
  ]);
}

function assertUniqueKeys(drafts: readonly ChangeItemDraft[]): void {
  const seen = new Set<string>();
  for (const [index, draft] of drafts.entries()) {
    const key = `${draft.entityType}|${draft.itemKey}`;
    if (seen.has(key)) {
      throw itemError(AUTHORED_ITEM_ERRORS.ITEM_DUPLICATE, index);
    }
    seen.add(key);
  }
}

function normalizeScore(score: string | null | undefined): string | null {
  return score === null || score === undefined
    ? null
    : new Prisma.Decimal(score).toString();
}

function relationLabel(source: string, target: string, type: string): string {
  return `${source} → ${target} (${RELATION_TYPE_LABELS[type]})`;
}

// '2026-11-01' → '01/11/2026'
function viDate(isoDay: string): string {
  const [year, month, day] = toIsoDay(fromIsoDay(isoDay)).split('-');
  return `${day}/${month}/${year}`;
}
