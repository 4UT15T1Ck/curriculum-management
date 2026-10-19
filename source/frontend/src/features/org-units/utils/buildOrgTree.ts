import type { SubjectGroupSummary } from '../../../shared/subject-groups/subjectGroups';
import type { OrgUnit } from '../../../shared/org-units/orgUnits';

export type OrgTreeNode =
  | { kind: 'unit'; key: string; unit: OrgUnit; children: OrgTreeNode[] }
  | { kind: 'group'; key: string; group: SubjectGroupSummary; children: [] };
const ROOT_KEY = '__root__';
export function buildOrgTree(
  units: readonly OrgUnit[],
  groups: readonly SubjectGroupSummary[],
): OrgTreeNode[] {
  const collator = new Intl.Collator('vi');
  const byParent = new Map<string, OrgUnit[]>();
  const byFaculty = new Map<string, SubjectGroupSummary[]>();
  for (const unit of units) {
    const key = unit.parentUnitId ?? ROOT_KEY;
    byParent.set(key, [...(byParent.get(key) ?? []), unit]);
  }
  for (const group of groups)
    byFaculty.set(group.faculty.id, [
      ...(byFaculty.get(group.faculty.id) ?? []),
      group,
    ]);
  const toNode = (unit: OrgUnit): OrgTreeNode => ({
    kind: 'unit',
    key: unit.id,
    unit,
    children: [
      ...(byParent.get(unit.id) ?? [])
        .sort((left, right) => collator.compare(left.unitName, right.unitName))
        .map(toNode),
      ...(byFaculty.get(unit.id) ?? [])
        .sort((left, right) =>
          collator.compare(left.groupName, right.groupName),
        )
        .map((group): OrgTreeNode => ({
          kind: 'group',
          key: `group:${group.id}`,
          group,
          children: [],
        })),
    ],
  });
  return (byParent.get(ROOT_KEY) ?? [])
    .sort((left, right) => collator.compare(left.unitName, right.unitName))
    .map(toNode);
}
