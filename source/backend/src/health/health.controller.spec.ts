import { ServiceUnavailableException } from '@nestjs/common';
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
    await expect(controller.check()).resolves.toEqual(ALL_UP);
  });

  it('throws 503 carrying the result when a dependency is down', async () => {
    check.mockResolvedValue(REDIS_DOWN);
    const error = await controller.check().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getResponse()).toEqual(
      REDIS_DOWN,
    );
  });
});
