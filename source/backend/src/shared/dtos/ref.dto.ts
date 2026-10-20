import { ApiProperty } from '@nestjs/swagger';
import { SubjectGroupStatus } from '../../generated/prisma/client.js';

export class OrgUnitRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() unitCode!: string;
  @ApiProperty() unitName!: string;
}

export class UserRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() fullName!: string;
}

export class RoleRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() roleCode!: string;
  @ApiProperty() roleName!: string;
}

export class SubjectGroupRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() groupCode!: string;
  @ApiProperty() groupName!: string;
  @ApiProperty({ enum: SubjectGroupStatus, enumName: 'SubjectGroupStatus' })
  status!: SubjectGroupStatus;
}

export class CourseRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
}

// Selects that produce the ref DTOs above, so list and detail mappers do not each re-spell them.
export const ORG_UNIT_REF_SELECT = {
  id: true,
  unitCode: true,
  unitName: true,
} as const;

export const USER_REF_SELECT = { id: true, fullName: true } as const;
