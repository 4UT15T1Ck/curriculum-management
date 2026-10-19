import { ApiProperty } from '@nestjs/swagger';

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
