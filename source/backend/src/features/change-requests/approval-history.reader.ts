import { Injectable } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { groupBy } from '../../shared/collections/group-by.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import type { ApprovalHistoryDto } from './approval-history.dto.js';
import { STEP_INCLUDE, toStepDto } from './change-request.mapper.js';
import { findVisibleRequest } from './request-visibility.js';

// US-069: every round, newest first; decided rows are never updated, so this is the permanent record.
@Injectable()
export class ApprovalHistoryReader {
  constructor(private readonly prisma: PrismaService) {}

  async read(id: string, access: AccessContext): Promise<ApprovalHistoryDto> {
    await findVisibleRequest(this.prisma, id, access);
    const steps = await this.prisma.approvalStep.findMany({
      where: { changeRequestId: id },
      include: STEP_INCLUDE,
      orderBy: [
        { submissionRound: 'desc' },
        { approvalLevel: 'asc' },
        { recordedAt: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'asc' },
        { id: 'asc' },
      ],
    });
    const rounds = groupBy(steps, (step) => String(step.submissionRound));
    return {
      rounds: [...rounds.values()].map((roundSteps) => ({
        submissionRound: roundSteps[0].submissionRound,
        // Every step of a round is created in one createMany, so they share it.
        submittedAt: roundSteps
          .reduce((first, step) =>
            step.createdAt < first.createdAt ? step : first,
          )
          .createdAt.toISOString(),
        steps: roundSteps.map(toStepDto),
      })),
    };
  }
}
