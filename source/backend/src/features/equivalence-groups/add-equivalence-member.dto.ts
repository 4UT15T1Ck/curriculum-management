import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddEquivalenceMemberDto {
  @ApiProperty() @IsString() @IsNotEmpty() courseId!: string;
}
