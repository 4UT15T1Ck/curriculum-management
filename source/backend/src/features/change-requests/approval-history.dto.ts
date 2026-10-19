import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStepDto } from './change-request-response.dto.js';

export class ApprovalRoundDto {
  @ApiProperty() submissionRound!: number;
  @ApiProperty({ description: 'ISO time the round was submitted' })
  submittedAt!: string;
  @ApiProperty({ type: [ApprovalStepDto] }) steps!: ApprovalStepDto[];
}

export class ApprovalHistoryDto {
  @ApiProperty({ type: [ApprovalRoundDto], description: 'Newest round first' })
  rounds!: ApprovalRoundDto[];
}
