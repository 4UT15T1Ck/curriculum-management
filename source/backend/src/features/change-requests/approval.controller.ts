import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { ApprovalHistoryDto } from './approval-history.dto.js';
import { ApprovalHistoryReader } from './approval-history.reader.js';
import { ApprovalService } from './approval.service.js';
import { ChangeRequestDetailDto } from './change-request-response.dto.js';
import { CommentDto, CreateCommentDto } from './comment.dto.js';
import { CommentsService } from './comments.service.js';
import {
  ApproveDecisionDto,
  DecisionRemarkDto,
  OverrideDecisionDto,
} from './decision.dto.js';

// Decision half of the request flow (F-14). Its routes all carry `:id/` plus a literal, so they never meet F-13's `:id`.
@ApiTags('change-requests')
@ApiCookieAuth()
@Controller('change-requests')
@RequirePermission(PERMISSIONS.CHANGE_REQUEST_VIEW)
export class ApprovalController {
  constructor(
    private readonly approvals: ApprovalService,
    private readonly comments: CommentsService,
    private readonly history: ApprovalHistoryReader,
  ) {}

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ChangeRequestDetailDto })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveDecisionDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.approvals.approve(id, dto, access);
  }

  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ChangeRequestDetailDto })
  returnToDraft(
    @Param('id') id: string,
    @Body() dto: DecisionRemarkDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.approvals.returnToDraft(id, dto, access);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ChangeRequestDetailDto })
  reject(
    @Param('id') id: string,
    @Body() dto: DecisionRemarkDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.approvals.reject(id, dto, access);
  }

  // The method-level permission replaces the class-level one for this route.
  @Post(':id/override')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.CHANGE_REQUEST_OVERRIDE)
  @ApiOkResponse({ type: ChangeRequestDetailDto })
  override(
    @Param('id') id: string,
    @Body() dto: OverrideDecisionDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.approvals.override(id, dto, access);
  }

  @Get(':id/history')
  @ApiOkResponse({ type: ApprovalHistoryDto })
  readHistory(@Param('id') id: string, @CurrentAccess() access: AccessContext) {
    return this.history.read(id, access);
  }

  @Get(':id/comments')
  @ApiOkResponse({ type: [CommentDto] })
  listComments(
    @Param('id') id: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.comments.list(id, access);
  }

  @Post(':id/comments')
  @RequirePermission(PERMISSIONS.CHANGE_REQUEST_COMMENT)
  @ApiCreatedResponse({ type: CommentDto })
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.comments.create(id, dto, access);
  }
}
