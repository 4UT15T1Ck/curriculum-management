import type { Prisma } from '../../../generated/prisma/client.js';
import { richTextToPlain } from '../../rich-text/rich-text-to-plain.js';
import { groupBy } from '../../collections/group-by.js';
import {
  AUTHORED_ENTITY,
  AUTHORED_OPERATION,
  type AuthoredOperation,
} from '../authored-item.types.js';
import {
  DIFF_CHANGES,
  type DiffChange,
  type DiffFieldDto,
  type DiffRowDto,
  type DiffSectionDto,
} from './change-diff.dto.js';
import {
  BOOLEAN_FIELDS,
  COURSE_FIELD_LABELS,
  DIFF_FIELD_LABELS,
  DIFF_SECTION_ORDER,
  DIFF_SECTION_TITLES,
  MEMBER_ROLE_LABELS,
  RICH_TEXT_FIELDS,
} from './diff-labels.js';

export interface StoredItemLike {
  entityType: string;
  itemKey: string;
  label: string;
  oldValue: Prisma.JsonValue | null;
  newValue: Prisma.JsonValue | null;
}

type Bag = Record<string, unknown>;

const AUTHORED_ENTITIES: ReadonlySet<string> = new Set(
  Object.values(AUTHORED_ENTITY),
);
const ADDING: readonly AuthoredOperation[] = [
  AUTHORED_OPERATION.ADD_RELATION,
  AUTHORED_OPERATION.ADD_MEMBER,
  AUTHORED_OPERATION.ASSIGN_DIRECTOR,
];
const REMOVING: readonly AuthoredOperation[] = [
  AUTHORED_OPERATION.REMOVE_RELATION,
  AUTHORED_OPERATION.END_MEMBERSHIP,
  AUTHORED_OPERATION.END_DIRECTOR,
];

const asBag = (value: Prisma.JsonValue | null): Bag | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Bag)
    : null;
const asText = (value: unknown): string | null =>
  typeof value === 'string'
    ? value
    : typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : null;

export function toDiffSections(
  items: readonly StoredItemLike[],
): DiffSectionDto[] {
  const groups = groupBy(items, (item) => item.entityType);
  return DIFF_SECTION_ORDER.filter((type) => groups.has(type)).map((type) => ({
    entityType: type,
    title: DIFF_SECTION_TITLES[type],
    rows: groups.get(type)!.map(toDiffRow),
  }));
}

export function toDiffRow(item: StoredItemLike): DiffRowDto {
  const before = asBag(item.oldValue);
  const after = asBag(item.newValue);
  const authored = AUTHORED_ENTITIES.has(item.entityType);
  return {
    itemKey: item.itemKey,
    label: item.label,
    change: authored ? authoredChange(after) : snapshotChange(before, after),
    fields: authored
      ? authoredFields(before, after)
      : snapshotFields(before, after),
  };
}

function snapshotChange(before: Bag | null, after: Bag | null): DiffChange {
  if (before === null) return DIFF_CHANGES.ADDED;
  if (after === null) return DIFF_CHANGES.REMOVED;
  return DIFF_CHANGES.CHANGED;
}

function authoredChange(after: Bag | null): DiffChange {
  const operation = after?.operation as AuthoredOperation | undefined;
  if (operation && ADDING.includes(operation)) return DIFF_CHANGES.ADDED;
  if (operation && REMOVING.includes(operation)) return DIFF_CHANGES.REMOVED;
  return DIFF_CHANGES.CHANGED;
}

function formatValue(name: string, value: string | null): string | null {
  if (value === null) return null;
  if (RICH_TEXT_FIELDS.has(name)) return richTextToPlain(value);
  if (BOOLEAN_FIELDS.has(name)) return value === 'true' ? 'Có' : 'Không';
  return value;
}

// Changed rows list only the keys that differ; an added or removed row lists every key that has a value.
function snapshotFields(before: Bag | null, after: Bag | null): DiffFieldDto[] {
  const names = [
    ...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
  ];
  const whole = before === null || after === null;
  return names.flatMap((name) => {
    const left = asText(before?.[name]);
    const right = asText(after?.[name]);
    if (whole ? left === null && right === null : left === right) return [];
    return [
      {
        name,
        label: DIFF_FIELD_LABELS[name] ?? name,
        before: formatValue(name, left),
        after: formatValue(name, right),
      },
    ];
  });
}

function field(
  name: string,
  label: string,
  before: unknown,
  after: unknown,
): DiffFieldDto {
  return { name, label, before: asText(before), after: asText(after) };
}

// What changed in an authored item, per operation (the apply reads the payload; the reader reads this).
function authoredFields(before: Bag | null, after: Bag | null): DiffFieldDto[] {
  if (after === null) return [];
  const label = (name: string) => DIFF_FIELD_LABELS[name] ?? name;
  switch (after.operation as AuthoredOperation) {
    case AUTHORED_OPERATION.SET_COURSE_FIELD: {
      const name = String(after.field);
      return [
        field(
          name,
          COURSE_FIELD_LABELS[name] ?? name,
          before?.display ?? before?.value,
          after.display ?? after.value,
        ),
      ];
    }
    case AUTHORED_OPERATION.ADD_RELATION:
      return after.minScore === null
        ? []
        : [field('minScore', label('minScore'), null, after.minScore)];
    case AUTHORED_OPERATION.UPDATE_RELATION:
      return [
        field('minScore', label('minScore'), before?.minScore, after.minScore),
      ];
    case AUTHORED_OPERATION.REMOVE_RELATION:
      return [field('minScore', label('minScore'), before?.minScore, null)];
    case AUTHORED_OPERATION.ADD_MEMBER:
      return [
        field(
          'memberRole',
          label('memberRole'),
          null,
          MEMBER_ROLE_LABELS[String(after.memberRole)],
        ),
        field('validFrom', label('validFrom'), null, after.validFrom),
        field('validTo', label('validTo'), null, after.validTo),
      ].filter((row) => row.after !== null);
    case AUTHORED_OPERATION.ASSIGN_DIRECTOR:
      return [
        field('validFrom', label('validFrom'), null, after.validFrom),
        field('validTo', label('validTo'), null, after.validTo),
      ].filter((row) => row.after !== null);
    case AUTHORED_OPERATION.END_MEMBERSHIP:
    case AUTHORED_OPERATION.END_DIRECTOR:
      return [
        field('validTo', label('validTo'), before?.validTo, after.validTo),
      ];
  }
}
