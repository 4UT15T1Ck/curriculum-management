import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ScopeType } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';
import { PasswordService } from '../../src/shared/password/password.service.js';
import { todayDate } from '../../src/shared/time/today.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

export interface TestAccount {
  username: string;
  password: string;
  id: string;
}

export async function createAccount(
  app: NestExpressApplication,
  username: string,
  roleCode?: string,
  scope?: { unitCode: string },
): Promise<TestAccount> {
  const prisma = app.get(PrismaService);
  const password = `${username}Pass1`;
  const user = await prisma.user.create({
    data: {
      username,
      userCode: username.toUpperCase(),
      fullName: username,
      passwordHash: await app.get(PasswordService).hash(password),
    },
  });
  if (roleCode) {
    const role = await prisma.role.findUniqueOrThrow({
      where: { roleCode },
    });
    const unit =
      scope &&
      (await prisma.orgUnit.findUniqueOrThrow({
        where: { unitCode: scope.unitCode },
      }));
    await prisma.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: role.id,
        scopeType: unit ? ScopeType.UNIT : ScopeType.SYSTEM,
        scopeUnitId: unit?.id,
        validFrom: todayDate(),
      },
    });
  }
  return { username, password, id: user.id };
}

export async function loginAgent(
  app: NestExpressApplication,
  account: TestAccount,
) {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post('/api/auth/login')
    .set(CSRF)
    .send({ username: account.username, password: account.password })
    .expect(200);
  return agent;
}
