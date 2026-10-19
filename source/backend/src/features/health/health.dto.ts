import { ApiProperty } from '@nestjs/swagger';

export const HealthStatus = { Ok: 'ok', Error: 'error' } as const;
export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];

export const DependencyStatus = { Up: 'up', Down: 'down' } as const;
export type DependencyStatus =
  (typeof DependencyStatus)[keyof typeof DependencyStatus];

export class HealthDto {
  @ApiProperty({ enum: Object.values(HealthStatus) })
  status: HealthStatus;

  @ApiProperty({ enum: Object.values(DependencyStatus) })
  database: DependencyStatus;

  @ApiProperty({ enum: Object.values(DependencyStatus) })
  redis: DependencyStatus;
}
