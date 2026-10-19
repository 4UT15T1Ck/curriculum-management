import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { DependencyStatus, HealthDto, HealthStatus } from './health.dto.js';
import { HealthService } from './health.service.js';

const ALL_UP: HealthDto = {
  status: HealthStatus.Ok,
  database: DependencyStatus.Up,
  redis: DependencyStatus.Up,
};
const REDIS_DOWN: HealthDto = {
  status: HealthStatus.Error,
  database: DependencyStatus.Up,
  redis: DependencyStatus.Down,
};

describe('HealthController', () => {
  const check = vi.fn<() => Promise<HealthDto>>();
  let controller: HealthController;

  // Resolving HealthService by class only works if the test transform emits decorator metadata.
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { check } }],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('returns the result when every dependency is up', async () => {
    check.mockResolvedValue(ALL_UP);
    const status = vi.fn();
    await expect(
      controller.check({ status } as unknown as Response),
    ).resolves.toEqual(ALL_UP);
    expect(status).not.toHaveBeenCalled();
  });

  it('sets 503 and still returns the result when a dependency is down', async () => {
    check.mockResolvedValue(REDIS_DOWN);
    const status = vi.fn();
    await expect(
      controller.check({ status } as unknown as Response),
    ).resolves.toEqual(REDIS_DOWN);
    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
