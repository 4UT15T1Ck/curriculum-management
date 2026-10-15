import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

// Same images and init args as compose.yaml, so tests run against what production runs.
const POSTGRES_IMAGE = 'postgres:18';
const REDIS_IMAGE = 'redis:8';
const VIETNAMESE_ICU_INIT_ARGS =
  '--locale-provider=icu --icu-locale=vi-VN --locale=C.UTF-8';

export function startPostgres({
  vietnameseCollation,
}: {
  vietnameseCollation: boolean;
}) {
  const container = new PostgreSqlContainer(POSTGRES_IMAGE);
  if (vietnameseCollation) {
    container.withEnvironment({
      POSTGRES_INITDB_ARGS: VIETNAMESE_ICU_INIT_ARGS,
    });
  }
  return container.start();
}

export function startRedis() {
  return new RedisContainer(REDIS_IMAGE).start();
}
