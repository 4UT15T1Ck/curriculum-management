import { defineConfig } from 'vitest/config';

const CONTAINER_START_TIMEOUT_MS = 180_000;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    testTimeout: CONTAINER_START_TIMEOUT_MS,
    hookTimeout: CONTAINER_START_TIMEOUT_MS,
  },
});
