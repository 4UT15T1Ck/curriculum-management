import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { RequestNotifier } from '../../shared/change-requests/request-notifier.js';
import { USER_REF_SELECT } from '../../shared/dtos/ref.dto.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import type { CommentDto, CreateCommentDto } from './comment.dto.js';
import { findVisibleRequest } from './request-visibility.js';

const COMMENT_SELECT = {
  id: true,
  content: true,
  createdAt: true,
  author: { select: USER_REF_SELECT },
} as const satisfies Prisma.CommentSelect;

function toCommentDto(
  row: Prisma.CommentGetPayload<{ select: typeof COMMENT_SELECT }>,
): CommentDto {
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

// US-067: anyone who can see the request may read; comments are never edited or deleted and never move the status.
@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifier: RequestNotifier,
  ) {}

  async list(id: string, access: AccessContext): Promise<CommentDto[]> {
    await findVisibleRequest(this.prisma, id, access);
    const rows = await this.prisma.comment.findMany({
      where: { changeRequestId: id },
      select: COMMENT_SELECT,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toCommentDto);
  }

  // Any status, closed requests included (FR-62).
  async create(
    id: string,
    dto: CreateCommentDto,
    access: AccessContext,
  ): Promise<CommentDto> {
    const request = await findVisibleRequest(this.prisma, id, access);
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          changeRequestId: id,
          authorId: access.userId,
          content: dto.content,
        },
        select: COMMENT_SELECT,
      });
      await this.notifier.commented(tx, request, access.userId);
      return created;
    });
    return toCommentDto(row);
  }
}
