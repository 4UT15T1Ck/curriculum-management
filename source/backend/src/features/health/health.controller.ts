import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthDto, HealthStatus } from './health.dto.js';
import { HealthService } from './health.service.js';
import { Public } from '../../shared/auth/public.decorator.js';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthDto })
  @ApiServiceUnavailableResponse({ type: HealthDto })
  async check(
    @Res({ passthrough: true }) response: Response,
  ): Promise<HealthDto> {
    const result = await this.health.check();
    if (result.status !== HealthStatus.Ok) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}
