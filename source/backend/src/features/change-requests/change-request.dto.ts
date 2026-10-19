import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  ChangeRequestStatus,
  ChangeRequestType,
  ChangeTargetType,
  RequestOrigin,
} from '../../generated/prisma/client.js';
import { emptyToNull, trimString } from '../../shared/dtos/transforms.js';
import { PageQueryDto } from '../../shared/pagination/page-query.dto.js';
import {
  CHANGE_REQUEST_LIMITS,
  CREATABLE_TYPES,
} from './change-request.constants.js';

export class ChangeRequestQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: ChangeRequestStatus,
    enumName: 'ChangeRequestStatus',
  })
  @IsOptional()
  @IsEnum(ChangeRequestStatus)
  status?: ChangeRequestStatus;

  @ApiPropertyOptional({
    enum: ChangeRequestType,
    enumName: 'ChangeRequestType',
  })
  @IsOptional()
  @IsEnum(ChangeRequestType)
  requestType?: ChangeRequestType;

  @ApiPropertyOptional({ enum: RequestOrigin, enumName: 'RequestOrigin' })
  @IsOptional()
  @IsEnum(RequestOrigin)
  origin?: RequestOrigin;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({ type: Boolean })
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsOptional()
  @IsBoolean()
  mine?: boolean;
}

export class ConflictQueryDto {
  @ApiProperty({ enum: ChangeTargetType, enumName: 'ChangeTargetType' })
  @IsEnum(ChangeTargetType)
  targetType!: ChangeTargetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId!: string;
}

export class CreateChangeRequestDto {
  @ApiProperty({
    enum: CREATABLE_TYPES,
    enumName: 'ChangeRequestType',
    description: 'GRADING_FORMULA is refused until F-12',
  })
  @IsIn(CREATABLE_TYPES)
  requestType!: ChangeRequestType;

  @ApiProperty({ enum: ChangeTargetType, enumName: 'ChangeTargetType' })
  @IsEnum(ChangeTargetType)
  targetType!: ChangeTargetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @ApiProperty({ maxLength: CHANGE_REQUEST_LIMITS.TITLE_MAX })
  @Transform(trimString)
  @IsString()
  @Length(1, CHANGE_REQUEST_LIMITS.TITLE_MAX)
  title!: string;

  @ApiProperty({ maxLength: CHANGE_REQUEST_LIMITS.REASON_MAX })
  @Transform(trimString)
  @IsString()
  @Length(1, CHANGE_REQUEST_LIMITS.REASON_MAX)
  reason!: string;

  @ApiProperty({ enum: RequestOrigin, enumName: 'RequestOrigin' })
  @IsEnum(RequestOrigin)
  origin!: RequestOrigin;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    maxLength: CHANGE_REQUEST_LIMITS.BASIS_NUMBER_MAX,
    description: 'Required when origin is UNIVERSITY',
  })
  @Transform(emptyToNull)
  @ValidateIf(
    (dto: CreateChangeRequestDto) =>
      dto.origin === RequestOrigin.UNIVERSITY ||
      (dto.basisDocumentNumber !== undefined &&
        dto.basisDocumentNumber !== null),
  )
  @IsNotEmpty()
  @IsString()
  @MaxLength(CHANGE_REQUEST_LIMITS.BASIS_NUMBER_MAX)
  basisDocumentNumber?: string | null;
}

// The service re-checks the origin rule on the merged row.
export class UpdateChangeRequestDto extends PartialType(
  PickType(CreateChangeRequestDto, [
    'title',
    'reason',
    'origin',
    'basisDocumentNumber',
  ] as const),
) {}
