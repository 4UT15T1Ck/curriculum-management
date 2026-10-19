import { DIFF_SECTION_ORDER } from './diff-labels.js';
import type { ChangeItemDraft, SnapshotEntry } from './snapshot-entry.js';

const KEY_SEPARATOR = '\u0000';
const key = (entry: Pick<SnapshotEntry, 'entityType' | 'itemKey'>) =>
  `${entry.entityType}${KEY_SEPARATOR}${entry.itemKey}`;

function sameValue(
  left: SnapshotEntry['value'],
  right: SnapshotEntry['value'],
): boolean {
  const names = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...names].every(
    (name) => (left[name] ?? null) === (right[name] ?? null),
  );
}

type DraftWithoutOrder = Omit<ChangeItemDraft, 'sortOrder'>;

function toDraft(
  source: SnapshotEntry,
  recordId: string | null,
  oldValue: SnapshotEntry['value'] | null,
  newValue: SnapshotEntry['value'] | null,
  baseVersion: string,
): DraftWithoutOrder {
  return {
    entityType: source.entityType,
    itemKey: source.itemKey,
    label: source.label,
    recordId,
    oldValue,
    newValue,
    baseVersion,
  };
}

// Compares two snapshots of the same shape (base and working copy) by natural key. recordId is the base row's id
// for a changed or removed entry (the copy's id is meaningless once the copy is gone), null for an added one.
export function diffSnapshots(
  before: readonly SnapshotEntry[],
  after: readonly SnapshotEntry[],
  baseVersion: string,
): ChangeItemDraft[] {
  const old = new Map(before.map((entry) => [key(entry), entry]));
  const now = new Map(after.map((entry) => [key(entry), entry]));
  const drafts: DraftWithoutOrder[] = [];
  for (const [k, entry] of now) {
    const prior = old.get(k);
    if (!prior) {
      drafts.push(toDraft(entry, null, null, entry.value, baseVersion));
    } else if (!sameValue(prior.value, entry.value)) {
      drafts.push(
        toDraft(entry, prior.recordId, prior.value, entry.value, baseVersion),
      );
    }
  }
  for (const [k, prior] of old) {
    if (!now.has(k)) {
      drafts.push(
        toDraft(prior, prior.recordId, prior.value, null, baseVersion),
      );
    }
  }
  return sortDrafts(drafts).map((draft, sortOrder) => ({
    ...draft,
    sortOrder,
  }));
}

const sectionRank = (entityType: string) => {
  const index = DIFF_SECTION_ORDER.indexOf(entityType);
  return index === -1 ? DIFF_SECTION_ORDER.length : index;
};

// Sections in reading order; inside a section by natural key, Vietnamese collation.
export function sortDrafts<
  T extends Pick<ChangeItemDraft, 'entityType' | 'itemKey'>,
>(drafts: readonly T[]): T[] {
  return [...drafts].sort(
    (left, right) =>
      sectionRank(left.entityType) - sectionRank(right.entityType) ||
      left.itemKey.localeCompare(right.itemKey, 'vi'),
  );
}
