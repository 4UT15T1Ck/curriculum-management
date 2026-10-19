import type { Prisma } from '../../generated/prisma/client.js';
import type { AccessContext } from '../authz/access-context.js';

export const AUTHENTICATED_USER_SELECT = {
  id: true,
  username: true,
  userCode: true,
  fullName: true,
  email: true,
  status: true,
  mustChangePassword: true,
  orgUnitId: true,
} as const satisfies Prisma.UserSelect;

export type AuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof AUTHENTICATED_USER_SELECT;
}>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      access?: AccessContext;
    }
  }
}
