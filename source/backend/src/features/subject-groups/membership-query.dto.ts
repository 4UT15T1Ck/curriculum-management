import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MembershipQueryDto {
  @ApiProperty()
  @IsString()
  userId!: string;
}
