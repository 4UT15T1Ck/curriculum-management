import { describe, expect, it } from 'vitest';
import { toDiffRow, toDiffSections } from './diff-presenter.js';
import { diffSnapshots } from './snapshot-differ.js';
import { SNAPSHOT_ENTITY, type SnapshotEntry } from './snapshot-entry.js';

function entry(
  entityType: string,
  itemKey: string,
  value: Record<string, string | null>,
  recordId = `id-${itemKey}`,
): SnapshotEntry {
  return { entityType, itemKey, label: itemKey, recordId, value };
}

const item = (code: string, semester: string, recordId?: string) =>
  entry(
    SNAPSHOT_ENTITY.CURRICULUM_ITEM,
    code,
    { plannedSemester: semester, note: null },
    recordId,
  );

describe('diffSnapshots', () => {
  it('finds nothing in identical snapshots', () => {
    const base = [item('IT1', '1'), item('IT2', '2')];
    expect(diffSnapshots(base, [...base], 'base')).toEqual([]);
  });

  it('reports a course added, removed and moved with the right null side and the base record id', () => {
    const before = [item('IT1', '1', 'old-1'), item('IT2', '2', 'old-2')];
    const after = [item('IT1', '3', 'new-1'), item('IT3', '1', 'new-3')];
    const drafts = diffSnapshots(before, after, 'v1');
    expect(drafts.map((draft) => draft.itemKey)).toEqual(['IT1', 'IT2', 'IT3']);
    const [moved, removed, added] = drafts;
    expect(moved).toMatchObject({
      recordId: 'old-1',
      oldValue: { plannedSemester: '1' },
      newValue: { plannedSemester: '3' },
      baseVersion: 'v1',
    });
    expect(removed).toMatchObject({ recordId: 'old-2', newValue: null });
    expect(added).toMatchObject({ recordId: null, oldValue: null });
    expect(drafts.map((draft) => draft.sortOrder)).toEqual([0, 1, 2]);
  });

  it('keys a requisite by course, source and type', () => {
    const requisite = entry(
      SNAPSHOT_ENTITY.CURRICULUM_REQUISITE,
      'IT3020|IT3011|PREREQUISITE',
      { minScore: null },
    );
    const [draft] = diffSnapshots([], [requisite], 'v1');
    expect(draft.itemKey).toBe('IT3020|IT3011|PREREQUISITE');
  });

  it('orders sections as the diff reads: info, curriculum, outcomes, syllabus', () => {
    const drafts = diffSnapshots(
      [],
      [
        entry(SNAPSHOT_ENTITY.PLO, 'PLO1', { description: 'a' }),
        item('IT1', '1'),
        entry(SNAPSHOT_ENTITY.VERSION_INFO, 'programName', { value: 'x' }),
      ],
      'v1',
    );
    expect(drafts.map((draft) => draft.entityType)).toEqual([
      SNAPSHOT_ENTITY.VERSION_INFO,
      SNAPSHOT_ENTITY.CURRICULUM_ITEM,
      SNAPSHOT_ENTITY.PLO,
    ]);
  });
});

describe('diff presenter', () => {
  it('lists only the fields that differ on a changed row', () => {
    const [draft] = diffSnapshots(
      [
        entry(SNAPSHOT_ENTITY.PLO, 'PLO1', {
          description: 'cũ',
          competencyGroup: 'K',
        }),
      ],
      [
        entry(SNAPSHOT_ENTITY.PLO, 'PLO1', {
          description: 'mới',
          competencyGroup: 'K',
        }),
      ],
      'v1',
    );
    const row = toDiffRow({
      ...draft,
      oldValue: draft.oldValue as never,
      newValue: draft.newValue as never,
    });
    expect(row.change).toBe('CHANGED');
    expect(row.fields).toEqual([
      { name: 'description', label: 'Mô tả', before: 'cũ', after: 'mới' },
    ]);
  });

  it('lists every non-null field of an added row and prints booleans and rich text readably', () => {
    const added = toDiffRow({
      entityType: SNAPSHOT_ENTITY.CURRICULUM_ITEM,
      itemKey: 'IT1',
      label: 'IT1',
      oldValue: null,
      newValue: { plannedSemester: '2', isElective: 'true', note: null },
    });
    expect(added.change).toBe('ADDED');
    expect(added.fields.map((field) => field.name)).toEqual([
      'plannedSemester',
      'isElective',
    ]);
    expect(added.fields[1].after).toBe('Có');
    const text = toDiffRow({
      entityType: SNAPSHOT_ENTITY.SYLLABUS_FIELD,
      itemKey: 'objectives',
      label: 'Mục tiêu',
      oldValue: { text: '<p>A &amp; B</p><p>C</p>' },
      newValue: { text: null },
    });
    expect(text.change).toBe('CHANGED');
    expect(text.fields[0]).toMatchObject({ before: 'A & B\nC', after: null });
  });

  it('reads authored items by their operation', () => {
    const remove = toDiffRow({
      entityType: 'COURSE_RELATION',
      itemKey: 'a|b|PREREQUISITE',
      label: 'a → b',
      oldValue: { minScore: '2' },
      newValue: { operation: 'REMOVE_RELATION', relationId: 'r1' },
    });
    expect(remove.change).toBe('REMOVED');
    expect(remove.fields).toEqual([
      { name: 'minScore', label: 'Ngưỡng điểm', before: '2', after: null },
    ]);
    const course = toDiffRow({
      entityType: 'COURSE_FIELD',
      itemKey: 'credits',
      label: 'Số tín chỉ',
      oldValue: { value: '3' },
      newValue: { operation: 'SET_COURSE_FIELD', field: 'credits', value: '4' },
    });
    expect(course.change).toBe('CHANGED');
    expect(course.fields[0]).toMatchObject({
      label: 'Số tín chỉ',
      before: '3',
      after: '4',
    });
    const add = toDiffRow({
      entityType: 'ORG_MEMBERSHIP',
      itemKey: 'ADD|u|COORDINATOR|2026-11-01',
      label: 'Thêm',
      oldValue: null,
      newValue: {
        operation: 'ADD_MEMBER',
        lecturerId: 'u',
        memberRole: 'COORDINATOR',
        validFrom: '2026-11-01',
        validTo: null,
      },
    });
    expect(add.change).toBe('ADDED');
    expect(add.fields.map((field) => field.label)).toEqual([
      'Vai trò',
      'Từ ngày',
    ]);
  });

  it('groups rows into sections in reading order', () => {
    const sections = toDiffSections([
      {
        entityType: SNAPSHOT_ENTITY.PLO,
        itemKey: 'PLO1',
        label: 'PLO1',
        oldValue: null,
        newValue: { description: 'x' },
      },
      {
        entityType: SNAPSHOT_ENTITY.VERSION_INFO,
        itemKey: 'programName',
        label: 'Tên',
        oldValue: { value: 'a' },
        newValue: { value: 'b' },
      },
    ]);
    expect(sections.map((section) => section.entityType)).toEqual([
      SNAPSHOT_ENTITY.VERSION_INFO,
      SNAPSHOT_ENTITY.PLO,
    ]);
    expect(sections[0].title).toBe('Thông tin chương trình');
  });
});
