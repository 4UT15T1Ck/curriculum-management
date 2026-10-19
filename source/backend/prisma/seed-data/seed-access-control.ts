import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { SEED_ORG_UNITS } from './org-units.js';
import { CELL_MEANING, PERMISSION_CATALOG } from './permission-catalog.js';
import { SEED_ROLES } from './roles.js';

export async function seedAccessControl(prisma: PrismaClient): Promise<void> {
  const unitIds = new Map<string, string>();
  for (const unit of SEED_ORG_UNITS) {
    const parentUnitId = unit.parentCode
      ? unitIds.get(unit.parentCode)
      : undefined;
    const saved = await prisma.orgUnit.upsert({
      where: { unitCode: unit.unitCode },
      create: {
        unitCode: unit.unitCode,
        unitName: unit.unitName,
        unitType: unit.unitType,
        parentUnitId,
      },
      update: {},
    });
    unitIds.set(unit.unitCode, saved.id);
  }

  const roleIds = new Map<string, string>();
  for (const role of SEED_ROLES) {
    const saved = await prisma.role.upsert({
      where: { roleCode: role.roleCode },
      create: { ...role, isSystemRole: true },
      update: {
        roleName: role.roleName,
        scopeSource: role.scopeSource,
        isSystemRole: true,
      },
    });
    roleIds.set(role.roleCode, saved.id);
  }

  for (const entry of PERMISSION_CATALOG) {
    const existing = await prisma.permission.findUnique({
      where: { permissionCode: entry.code },
    });
    const data = {
      permissionName: entry.name,
      functionGroup: entry.group,
      source: entry.source,
    };
    if (existing) {
      await prisma.permission.update({ where: { id: existing.id }, data });
      continue;
    }
    await prisma.permission.create({
      data: {
        permissionCode: entry.code,
        ...data,
        rolePermissions: {
          create: Object.entries(entry.cells).map(([roleCode, cell]) => ({
            roleId: roleIds.get(roleCode)!,
            ...CELL_MEANING[cell as keyof typeof CELL_MEANING],
          })),
        },
      },
    });
  }
}
