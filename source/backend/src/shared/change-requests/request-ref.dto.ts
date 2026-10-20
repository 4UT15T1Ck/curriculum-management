import { ApiProperty } from '@nestjs/swagger';
import { ChangeRequestStatus } from '../../generated/prisma/client.js';

// Carried by every read DTO of a row that can be a request's working copy.
export class RequestRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() requestCode!: string;
  @ApiProperty({ enum: ChangeRequestStatus, enumName: 'ChangeRequestStatus' })
  status!: ChangeRequestStatus;
}
