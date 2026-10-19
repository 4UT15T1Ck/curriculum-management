import { Prisma } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import type { ErrorDefinition } from '../exception/error-definition.js';

export function mapUniqueViolation(
  error: unknown,
  definition: ErrorDefinition,
  field: string,
): unknown {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return new AppException(definition, [{ field, constraints: ['unique'] }]);
  }
  return error;
}
