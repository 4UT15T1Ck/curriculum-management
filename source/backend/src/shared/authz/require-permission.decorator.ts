import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from './permission-codes.js';

export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';
export const RequirePermission = (
  ...codes: [PermissionCode, ...PermissionCode[]]
) => SetMetadata(REQUIRED_PERMISSIONS_KEY, codes);
