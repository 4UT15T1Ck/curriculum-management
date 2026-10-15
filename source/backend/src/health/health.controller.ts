import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthDto, HealthStatus } from './health.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthDto })
  @ApiServiceUnavailableResponse({ type: HealthDto })
  async check(): Promise<HealthDto> {
    const result = await this.health.check();
    if (result.status !== HealthStatus.Ok) {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }
}
