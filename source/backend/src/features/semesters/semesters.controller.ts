import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { AnyAuthenticated } from '../../shared/authz/any-authenticated.decorator.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { CohortDto, SemesterDto } from '../../shared/releases/semester.dto.js';
import { CreateCohortDto, UpdateCohortDto } from './dto/cohort.dto.js';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto.js';
import { SemestersService } from './semesters.service.js';

@ApiTags('semesters')
@Controller()
export class SemestersController {
  constructor(private readonly semesters: SemestersService) {}

  // Selectors for the release forms; the lists hold no personal data.
  @Get('semesters')
  @AnyAuthenticated()
  listSemesters(): Promise<SemesterDto[]> {
    return this.semesters.listSemesters();
  }

  @Post('semesters')
  @RequirePermission(PERMISSIONS.SEMESTER_MANAGE)
  createSemester(
    @Body() dto: CreateSemesterDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<SemesterDto> {
    return this.semesters.createSemester(dto, access);
  }

  @Patch('semesters/:id')
  @RequirePermission(PERMISSIONS.SEMESTER_MANAGE)
  updateSemester(
    @Param('id') id: string,
    @Body() dto: UpdateSemesterDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<SemesterDto> {
    return this.semesters.updateSemester(id, dto, access);
  }

  @Get('cohorts')
  @AnyAuthenticated()
  listCohorts(): Promise<CohortDto[]> {
    return this.semesters.listCohorts();
  }

  @Post('cohorts')
  @RequirePermission(PERMISSIONS.SEMESTER_MANAGE)
  createCohort(
    @Body() dto: CreateCohortDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<CohortDto> {
    return this.semesters.createCohort(dto, access);
  }

  @Patch('cohorts/:id')
  @RequirePermission(PERMISSIONS.SEMESTER_MANAGE)
  updateCohort(
    @Param('id') id: string,
    @Body() dto: UpdateCohortDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<CohortDto> {
    return this.semesters.updateCohort(id, dto, access);
  }
}
