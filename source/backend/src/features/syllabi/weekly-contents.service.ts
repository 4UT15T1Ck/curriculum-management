import { Injectable } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { COMMON_ERRORS } from '../../shared/exception/error-codes.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { sanitizeRichText } from '../../shared/rich-text/sanitize-rich-text.js';
import {
  assertDraftWrite,
  SYLLABUS_ACCESS_SELECT,
  type SyllabusAccessRow,
} from './syllabus-access.js';
import {
  SYLLABUS_ERRORS,
  SYLLABUS_FIELD,
  SYLLABUS_LIMITS,
  WEEKLY_CONTENT_REQUIRED,
} from './syllabus.errors.js';
import {
  toWeeklyContentDto,
  type CreateWeeklyContentDto,
  type ReorderWeeklyContentsDto,
  type UpdateWeeklyContentDto,
  type WeeklyContentDto,
} from './weekly-content.dto.js';

const BY_ORDER = [{ sortOrder: 'asc' }, { id: 'asc' }] as const;

// The rows of a Draft's weekly table. Every write touches the parent's updatedAt ("Cập nhật lúc").
@Injectable()
export class WeeklyContentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    syllabusId: string,
    dto: CreateWeeklyContentDto,
    access: AccessContext,
  ): Promise<WeeklyContentDto> {
    await assertDraftWrite(
      this.prisma,
      access,
      await this.findRevision(syllabusId),
    );
    const content = requiredRichText(dto.content);
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.weeklyContent.count({ where: { syllabusId } });
      if (count >= SYLLABUS_LIMITS.WEEKLY_ROWS_MAX) {
        throw new AppException(SYLLABUS_ERRORS.WEEKLY_ROWS_LIMIT);
      }
      const created = await tx.weeklyContent.create({
        data: {
          syllabusId,
          weekLabel: dto.weekLabel,
          sortOrder: count + 1,
          content,
          teachingActivities: sanitizeRichText(dto.teachingActivities),
        },
      });
      await touch(tx, syllabusId);
      return toWeeklyContentDto(created);
    });
  }

  async update(
    weeklyContentId: string,
    dto: UpdateWeeklyContentDto,
    access: AccessContext,
  ): Promise<WeeklyContentDto> {
    const row = await this.findRow(weeklyContentId);
    await assertDraftWrite(this.prisma, access, row.syllabus);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.weeklyContent.update({
        where: { id: weeklyContentId },
        data: {
          ...(dto.weekLabel !== undefined && { weekLabel: dto.weekLabel }),
          ...(dto.content !== undefined && {
            content: requiredRichText(dto.content),
          }),
          ...(dto.teachingActivities !== undefined && {
            teachingActivities: sanitizeRichText(dto.teachingActivities),
          }),
        },
      });
      await touch(tx, row.syllabusId);
      return toWeeklyContentDto(updated);
    });
  }

  // Following rows close the gap: the remaining rows are renumbered 1..n in their current order.
  async remove(weeklyContentId: string, access: AccessContext): Promise<void> {
    const row = await this.findRow(weeklyContentId);
    await assertDraftWrite(this.prisma, access, row.syllabus);
    await this.prisma.$transaction(async (tx) => {
      await tx.weeklyContent.delete({ where: { id: weeklyContentId } });
      const rest = await tx.weeklyContent.findMany({
        where: { syllabusId: row.syllabusId },
        orderBy: [...BY_ORDER],
        select: { id: true },
      });
      for (const [index, { id }] of rest.entries()) {
        await tx.weeklyContent.update({
          where: { id },
          data: { sortOrder: index + 1 },
        });
      }
      await touch(tx, row.syllabusId);
    });
  }

  // The list must be exactly the Draft's rows; a partial list is refused so no row loses its place silently.
  async reorder(
    syllabusId: string,
    dto: ReorderWeeklyContentsDto,
    access: AccessContext,
  ): Promise<WeeklyContentDto[]> {
    await assertDraftWrite(
      this.prisma,
      access,
      await this.findRevision(syllabusId),
    );
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.weeklyContent.findMany({
        where: { syllabusId },
        select: { id: true },
      });
      const current = new Set(rows.map((row) => row.id));
      if (
        rows.length !== dto.ids.length ||
        dto.ids.some((id) => !current.has(id))
      ) {
        throw new AppException(SYLLABUS_ERRORS.ORDER_MISMATCH);
      }
      for (const [index, id] of dto.ids.entries()) {
        await tx.weeklyContent.update({
          where: { id },
          data: { sortOrder: index + 1 },
        });
      }
      await touch(tx, syllabusId);
      const ordered = await tx.weeklyContent.findMany({
        where: { syllabusId },
        orderBy: [...BY_ORDER],
      });
      return ordered.map(toWeeklyContentDto);
    });
  }

  private findRevision(syllabusId: string): Promise<SyllabusAccessRow | null> {
    return this.prisma.syllabus.findUnique({
      where: { id: syllabusId },
      select: SYLLABUS_ACCESS_SELECT,
    });
  }

  private async findRow(weeklyContentId: string) {
    const row = await this.prisma.weeklyContent.findUnique({
      where: { id: weeklyContentId },
      select: {
        syllabusId: true,
        syllabus: { select: SYLLABUS_ACCESS_SELECT },
      },
    });
    if (!row) {
      throw new AppException(SYLLABUS_ERRORS.WEEKLY_CONTENT_NOT_FOUND);
    }
    return row;
  }
}

function touch(
  client: Pick<PrismaService, 'syllabus'>,
  syllabusId: string,
): Promise<unknown> {
  return client.syllabus.update({
    where: { id: syllabusId },
    data: { updatedAt: new Date() },
  });
}

function requiredRichText(html: string): string {
  const clean = sanitizeRichText(html);
  if (clean === null) {
    throw new AppException(COMMON_ERRORS.VALIDATION_FAILED, [
      {
        field: SYLLABUS_FIELD.CONTENT,
        constraints: [WEEKLY_CONTENT_REQUIRED],
      },
    ]);
  }
  return clean;
}
