import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldErrorDto {
  @ApiProperty()
  field: string;

  @ApiProperty({ type: [String] })
  constraints: string[];
}

export class ErrorResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ type: [FieldErrorDto] })
  details?: FieldErrorDto[];

  @ApiProperty()
  path: string;

  @ApiProperty()
  timestamp: string;
}
