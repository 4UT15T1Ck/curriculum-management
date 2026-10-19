import { describe, expect, it } from 'vitest';
import { OrgUnitType } from '../../generated/prisma/client.js';
import { createsCycle, isAllowedParent } from './org-unit-hierarchy.js';

describe('org unit hierarchy', () => {
  it('allows faculties and offices only under universities', () => {
    expect(isAllowedParent(OrgUnitType.FACULTY, OrgUnitType.UNIVERSITY)).toBe(
      true,
    );
    expect(isAllowedParent(OrgUnitType.OFFICE, OrgUnitType.UNIVERSITY)).toBe(
      true,
    );
    expect(isAllowedParent(OrgUnitType.FACULTY, OrgUnitType.OFFICE)).toBe(
      false,
    );
    for (const parent of Object.values(OrgUnitType))
      expect(isAllowedParent(OrgUnitType.UNIVERSITY, parent)).toBe(false);
  });

  it('detects self, child and grandchild cycles but allows siblings', () => {
    const parents = new Map([
      ['root', null],
      ['unit', 'root'],
      ['child', 'unit'],
      ['grandchild', 'child'],
      ['sibling', 'root'],
    ]);
    for (const candidate of ['unit', 'child', 'grandchild'])
      expect(createsCycle('unit', candidate, parents)).toBe(true);
    expect(createsCycle('unit', 'sibling', parents)).toBe(false);
  });
});
