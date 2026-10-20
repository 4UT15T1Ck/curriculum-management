# NestJS / Prisma — Stack Rules

Pair with project-level rules. Apply to `source/backend`.

> **Note (ESM):** This project uses `"type": "module"`. All relative imports in TypeScript
> source must carry the `.js` suffix (e.g. `import { Foo } from './foo.js'`) — the compiled
> output resolves these correctly. This overrides any rule that omits the extension.

---

## 1. Module Structure

Three module categories. Never mix their concerns:

- **Feature modules** (`src/features/<feature>/`): business logic for one domain. Self-contained — exposes only what other modules need explicitly.
- **Shared module** (`src/shared/`): cross-cutting infrastructure — PrismaService, Redis, guards, pipes, filters, DTOs, configs, constants. No business logic here.
- **App module** (`src/app.module.ts`): root — wires feature modules and shared infrastructure together. No business logic here.

Feature modules must not import from other feature modules directly. Cross-feature dependencies belong in the shared module or are resolved at the service boundary via injected shared services.

---

## 2. Layer Pattern Within a Feature

Each feature module contains exactly three files:

```
src/features/<feature>/
├── <feature>.module.ts      # NestJS module — wires providers, imports
├── <feature>.controller.ts  # HTTP layer — routes, guards, Swagger decorators, no logic
└── <feature>.service.ts     # Business logic — PrismaService, queues, external services
```

- Controllers receive and validate requests, delegate everything to the service, return responses. No business logic in controllers.
- Services contain all domain logic. They call `PrismaService` directly.
- Never call `PrismaService` from a controller.
- If a service file grows beyond ~250 lines, extract a dedicated helper service and inject it — do not create a repository layer.

---

## 3. Prisma Patterns

- Inject `PrismaService` via constructor DI. Never instantiate `PrismaClient` directly in feature code.
- Use `prisma.$transaction([...])` for multi-step writes that must be atomic.
- Never run `deleteMany` / `updateMany` on tables with FK constraints without verifying cascade behavior first.
- Schema changes require a new migration (`prisma migrate dev`). Never alter the database manually.
- After any `schema.prisma` change, run `prisma generate` before TypeScript compilation.
- Never use `prisma migrate reset` in any environment except a local dev throwaway — it wipes data.
- Document every schema change in `docs/architecture/database_and_models.md`.

---

## 4. DTO and Validation

- Every request body has a dedicated DTO class in the feature folder or `src/shared/dtos/` if reused across features.
- All DTO fields carry `class-validator` decorators (`@IsString()`, `@IsEnum()`, `@IsUUID()`, etc.).
- Use `class-transformer` (`@Type()`, `@Transform()`) for type coercion on nested objects and dates.
- The global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` is registered in `main.ts` — never add it per-route.
- Response shapes use plain objects or typed response DTOs — never return raw Prisma model objects (they may include sensitive or internal fields).

---

## 5. Guards, Decorators, and RBAC

- Authentication: global session guard. Mark public routes with `@Public()`.
- RBAC: `@RequirePermission(...)` decorator + `PermissionGuard`. Data-scope checks go through `ScopeService` inside services.
- Custom parameter decorators (e.g. `@CurrentUser()`) extract data from the request. Use them instead of accessing `req.user` directly in controllers.
- Never hard-code permission code strings inline — reference them from the shared permission constants.

---

## 6. Error Handling

- Throw NestJS built-in exceptions (`BadRequestException`, `NotFoundException`, `ForbiddenException`, `ConflictException`, etc.) from services.
- Custom business exceptions extend `HttpException` and live in `src/shared/exception/`.
- A global exception filter in `src/shared/filter/` normalizes the response envelope. Never write try/catch in controllers for HTTP error mapping.
- Use the NestJS `Logger` for logging. Never use `console.log` in production paths.

---

## 7. BullMQ Job Patterns

- Each queue has a dedicated processor class decorated with `@Processor('queue-name')`.
- Job payloads are typed interfaces — never `any`.
- Processors live in the feature module that owns the work, not in `shared/`.
- Jobs must be safe to retry. If a job can cause duplicate side effects, add a deduplication check at the start of `process()`.

---

## 8. Configuration

- Access all environment variables via typed `ConfigService` — never read `process.env` directly in feature code.
- Config schemas are validated at startup using `class-validator` env class (`src/config/env.validation.ts`).
- Secrets (DB URLs, API keys) never appear in source files or git history. They live in `.env` files excluded by `.gitignore`.

---

## 9. Naming Conventions

- Files: `kebab-case` (`pr-cycles.service.ts`, `create-pr-cycle.dto.ts`)
- Classes: `PascalCase`
- Module / Controller / Service: `XxxModule`, `XxxController`, `XxxService`
- DTOs: `CreateXxxDto`, `UpdateXxxDto`, `XxxResponseDto`
- Enums: `PascalCase` name, `SCREAMING_SNAKE_CASE` values
- Constants: named constant objects with `SCREAMING_SNAKE_CASE` keys — never inline string/number literals

---

## 10. Testing

- Unit test files live alongside source as `*.spec.ts`.
- Unit tests mock `PrismaService` — never hit a real database in unit tests.
- E2E tests in `test/` use Testcontainers (spins up real PostgreSQL + Redis).
- Every service method with conditional logic has a unit test for each branch.
- Do not test the controller's HTTP wiring in unit tests — that belongs in E2E tests.
