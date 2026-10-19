import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestPostgres, TestRedis } from './containers.js';
import request from 'supertest';
import { OrgUnitStatus, OrgUnitType } from '../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from '../prisma/seed-data/org-units.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createSubjectGroup } from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
const MATH_CODE = 'KHOA_TOAN';

describe('org unit management', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: ReturnType<typeof request.agent>;
  let rootId: string;
  let facultyId: string;
  let mathId: string;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    admin = await loginAgent(app, await createAccount(app, 'orgadmin', 'R1'));
    rootId = (
      await prisma.orgUnit.findUniqueOrThrow({
        where: { unitCode: ORG_UNIT_CODES.UNIVERSITY },
      })
    ).id;
    facultyId = (
      await prisma.orgUnit.findUniqueOrThrow({
        where: { unitCode: ORG_UNIT_CODES.FACULTY_IT },
      })
    ).id;
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  it('creates a faculty under the root and makes it immediately selectable', async () => {
    const created = await admin
      .post('/api/org-units')
      .set(CSRF)
      .send({
        unitCode: MATH_CODE,
        unitName: 'Khoa Toán',
        unitType: OrgUnitType.FACULTY,
        parentUnitId: rootId,
      })
      .expect(201);
    mathId = created.body.id;
    expect(created.body).toMatchObject({
      unitCode: MATH_CODE,
      unitType: OrgUnitType.FACULTY,
      parentUnitId: rootId,
      status: OrgUnitStatus.ACTIVE,
    });
    const listed = await admin.get('/api/org-units').expect(200);
    expect(listed.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: mathId, unitCode: MATH_CODE }),
      ]),
    );
  });

  it('rejects duplicate codes, invalid parent types and immutable fields', async () => {
    await admin
      .post('/api/org-units')
      .set(CSRF)
      .send({
        unitCode: MATH_CODE,
        unitName: 'Trùng',
        unitType: OrgUnitType.FACULTY,
        parentUnitId: rootId,
      })
      .expect(409)
      .expect(({ body }) => {
        expect(body.code).toBe('UNIT_CODE_TAKEN');
        expect(body.details[0].field).toBe('unitCode');
      });
    await admin
      .patch(`/api/org-units/${mathId}`)
      .set(CSRF)
      .send({ parentUnitId: facultyId })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('PARENT_INVALID'));
    await admin
      .patch(`/api/org-units/${mathId}`)
      .set(CSRF)
      .send({ unitType: OrgUnitType.OFFICE })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('VALIDATION_FAILED'));
    await admin
      .patch(`/api/org-units/${mathId}`)
      .set(CSRF)
      .send({ unitName: 'Khoa Toán học' })
      .expect(200)
      .expect(({ body }) => expect(body.unitName).toBe('Khoa Toán học'));
  });

  it('locks the root and refuses deactivation with an active group', async () => {
    await createSubjectGroup(app, 'ORG_ACTIVE_GROUP');
    await admin
      .post(`/api/org-units/${facultyId}/deactivate`)
      .set(CSRF)
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('UNIT_HAS_ACTIVE_GROUPS'));
    await admin
      .post(`/api/org-units/${rootId}/deactivate`)
      .set(CSRF)
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('ROOT_UNIT_LOCKED'));
    await admin
      .patch(`/api/org-units/${rootId}`)
      .set(CSRF)
      .send({ parentUnitId: facultyId })
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('ROOT_UNIT_LOCKED'));
  });

  it('deactivates a faculty without moving its users and rejects new groups there', async () => {
    const account = await createAccount(app, 'mathlecturer');
    await prisma.user.update({
      where: { id: account.id },
      data: { orgUnitId: mathId },
    });
    await admin
      .post(`/api/org-units/${mathId}/deactivate`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe(OrgUnitStatus.INACTIVE));
    await admin
      .post(`/api/org-units/${mathId}/deactivate`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe(OrgUnitStatus.INACTIVE));
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: account.id } }))
        .orgUnitId,
    ).toBe(mathId);
    await admin
      .post('/api/subject-groups')
      .set(CSRF)
      .send({ groupCode: 'MATH_GROUP', groupName: 'Toán', facultyId: mathId })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('FACULTY_INVALID'));
    await admin
      .delete(`/api/org-units/${mathId}`)
      .set(CSRF)
      .expect(404)
      .expect(({ body }) => expect(body.code).toBe('NOT_FOUND'));
  });

  it('reactivates a faculty idempotently', async () => {
    await admin
      .post(`/api/org-units/${mathId}/activate`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe(OrgUnitStatus.ACTIVE));
    await admin
      .post(`/api/org-units/${mathId}/activate`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe(OrgUnitStatus.ACTIVE));
  });
});
