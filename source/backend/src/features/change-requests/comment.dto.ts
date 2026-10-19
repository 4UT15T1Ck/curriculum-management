import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { COMMENT_MAX } from '../../shared/change-requests/approval.constants.js';
import { UserRefDto } from '../../shared/dtos/ref.dto.js';
import { trimString } from '../../shared/dtos/transforms.js';

export class CreateCommentDto {
  @ApiProperty({ maxLength: COMMENT_MAX })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(COMMENT_MAX)
  content!: string;
}

export class CommentDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: UserRefDto }) author!: UserRefDto;
  @ApiProperty() content!: string;
  @ApiProperty() createdAt!: string;
}
