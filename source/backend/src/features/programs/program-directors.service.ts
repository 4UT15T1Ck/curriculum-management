import { Injectable, Logger } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  assignDirector,
  endDirector,
  findLiveAssignment,
} from '../../shared/programs/director.writer.js';
import { programTarget } from '../../shared/programs/program-target.js';
import { todayDate } from '../../shared/time/today.js';
import { AssignDirectorDto, EndDirectorDto } from './assign-director.dto.js';
import {
  DIRECTOR_SELECT,
  toProgramDirectorDto,
  type ProgramDirectorDto,
} from './program-director.dto.js';
import { PROGRAM_ERRORS } from './programs.errors.js';

@Injectable()
export class ProgramDirectorsService {
  private readonly logger = new Logger(ProgramDirectorsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Every row of the program, history included, newest start first (US-020 AC2).
  async list(
    programId: string,
    access: AccessContext,
  ): Promise<ProgramDirectorDto[]> {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, facultyId: true },
    });
    if (!program) {
      throw new AppException(PROGRAM_ERRORS.PROGRAM_NOT_FOUND);
    }
    access.assertCan(PERMISSIONS.PROGRAM_VIEW, programTarget(program));
    const rows = await this.prisma.programDirectorAssignment.findMany({
      where: { programId },
      select: DIRECTOR_SELECT,
      orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
    });
    const today = todayDate();
    return rows.map((row) => toProgramDirectorDto(row, today));
  }

  async assign(
    programId: string,
    dto: AssignDirectorDto,
    actorId: string,
  ): Promise<ProgramDirectorDto> {
    const row = await assignDirector(this.prisma, programId, dto, actorId);
    this.logger.log(
      `Director ${dto.directorId} assigned to program ${programId} by ${actorId}`,
    );
    return toProgramDirectorDto(row, todayDate());
  }

  // End only shortens; extending means a new assignment (same discipline as subject-group members).
  async end(
    programId: string,
    assignmentId: string,
    dto: EndDirectorDto,
    actorId: string,
  ): Promise<ProgramDirectorDto> {
    const updated = await endDirector(
      this.prisma,
      programId,
      assignmentId,
      dto.validTo,
    );
    this.logger.log(
      `Director row ${assignmentId} ended ${dto.validTo} by ${actorId}`,
    );
    return toProgramDirectorDto(updated, todayDate());
  }

  // For a row entered by mistake; the row stays in the history as revoked.
  async revoke(
    programId: string,
    assignmentId: string,
    actorId: string,
  ): Promise<ProgramDirectorDto> {
    const row = await findLiveAssignment(this.prisma, programId, assignmentId);
    const updated = await this.prisma.programDirectorAssignment.update({
      where: { id: row.id },
      data: { revokedAt: new Date(), revokedById: actorId },
      select: DIRECTOR_SELECT,
    });
    this.logger.log(`Director row ${row.id} revoked by ${actorId}`);
    return toProgramDirectorDto(updated, todayDate());
  }
}
