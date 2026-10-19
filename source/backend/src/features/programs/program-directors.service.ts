import { Injectable, Logger } from '@nestjs/common';
import { ProgramStatus, UserStatus } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { COMMON_ERRORS } from '../../shared/exception/error-codes.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { programTarget } from '../../shared/programs/program-target.js';
import { fromIsoDay, todayDate } from '../../shared/time/today.js';
import { overlapsPeriod, parsePeriod } from '../../shared/time/validity.js';
import { AssignDirectorDto, EndDirectorDto } from './assign-director.dto.js';
import {
  DIRECTOR_SELECT,
  toProgramDirectorDto,
  type ProgramDirectorDto,
} from './program-director.dto.js';
import { PROGRAM_CONSTRAINT, PROGRAM_ERRORS } from './programs.errors.js';

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
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      select: { status: true },
    });
    if (!program) {
      throw new AppException(PROGRAM_ERRORS.PROGRAM_NOT_FOUND);
    }
    if (program.status !== ProgramStatus.ACTIVE) {
      throw new AppException(PROGRAM_ERRORS.PROGRAM_INACTIVE);
    }
    const director = await this.prisma.user.findUnique({
      where: { id: dto.directorId },
      select: { status: true },
    });
    if (!director || director.status !== UserStatus.ACTIVE) {
      throw new AppException(PROGRAM_ERRORS.DIRECTOR_INVALID, [
        { field: 'directorId', constraints: [PROGRAM_CONSTRAINT.ACTIVE_USER] },
      ]);
    }
    const period = parsePeriod(dto.validFrom, dto.validTo);
    // Different people may direct at the same time (US-020 AC3); only the same person cannot overlap themselves.
    const overlap = await this.prisma.programDirectorAssignment.findFirst({
      where: {
        programId,
        directorId: dto.directorId,
        revokedAt: null,
        ...overlapsPeriod(period),
      },
      select: { id: true },
    });
    if (overlap) {
      throw new AppException(PROGRAM_ERRORS.DIRECTOR_PERIOD_OVERLAP);
    }
    const row = await this.prisma.programDirectorAssignment.create({
      data: {
        programId,
        directorId: dto.directorId,
        ...period,
        assignedById: actorId,
      },
      select: DIRECTOR_SELECT,
    });
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
    const row = await this.findLiveOrThrow(programId, assignmentId);
    const validTo = fromIsoDay(dto.validTo);
    if (validTo < row.validFrom) {
      throw new AppException(COMMON_ERRORS.VALIDITY_INVALID);
    }
    if (row.validTo && validTo >= row.validTo) {
      throw new AppException(PROGRAM_ERRORS.END_DATE_NOT_EARLIER);
    }
    const updated = await this.prisma.programDirectorAssignment.update({
      where: { id: row.id },
      data: { validTo },
      select: DIRECTOR_SELECT,
    });
    this.logger.log(
      `Director row ${row.id} ended ${dto.validTo} by ${actorId}`,
    );
    return toProgramDirectorDto(updated, todayDate());
  }

  // For a row entered by mistake; the row stays in the history as revoked.
  async revoke(
    programId: string,
    assignmentId: string,
    actorId: string,
  ): Promise<ProgramDirectorDto> {
    const row = await this.findLiveOrThrow(programId, assignmentId);
    const updated = await this.prisma.programDirectorAssignment.update({
      where: { id: row.id },
      data: { revokedAt: new Date(), revokedById: actorId },
      select: DIRECTOR_SELECT,
    });
    this.logger.log(`Director row ${row.id} revoked by ${actorId}`);
    return toProgramDirectorDto(updated, todayDate());
  }

  private async findLiveOrThrow(programId: string, assignmentId: string) {
    const row = await this.prisma.programDirectorAssignment.findFirst({
      where: { id: assignmentId, programId, revokedAt: null },
      select: { id: true, validFrom: true, validTo: true },
    });
    if (!row) {
      throw new AppException(PROGRAM_ERRORS.DIRECTOR_ASSIGNMENT_NOT_FOUND);
    }
    return row;
  }
}
