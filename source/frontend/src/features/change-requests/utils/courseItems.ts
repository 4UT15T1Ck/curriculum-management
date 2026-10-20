import type {
  AuthoredItem,
  AuthoredItemInput,
  CourseRelationRow,
  CourseRequestField,
  RelationType,
} from '../api/changeRequests';
import { RELATION_CHOICES } from '../constants/courseItemLabels';
import { payloadOf } from '../types';

type Op<T extends AuthoredItemInput['operation']> = Extract<
  AuthoredItemInput,
  { operation: T }
>;

export type RelationEdit =
  { kind: 'update'; minScore: string | null } | { kind: 'remove' };

// What the editor holds between loading and saving; every part maps to one item operation.
export interface CourseItemsState {
  fields: Partial<Record<CourseRequestField, string | null>>;
  relationEdits: Record<string, RelationEdit>;
  additions: Op<'ADD_RELATION'>[];
}

export const EMPTY_STATE: CourseItemsState = {
  fields: {},
  relationEdits: {},
  additions: [],
};

// A reload shows what was saved: rows are rebuilt from the stored items.
export function stateFromItems(
  items: readonly AuthoredItem[],
): CourseItemsState {
  const state: CourseItemsState = {
    fields: {},
    relationEdits: {},
    additions: [],
  };
  for (const item of items) {
    const payload = payloadOf(item);
    if (!payload) continue;
    switch (payload.operation) {
      case 'SET_COURSE_FIELD':
        state.fields[payload.field] = payload.value;
        break;
      case 'UPDATE_RELATION':
        state.relationEdits[payload.relationId] = {
          kind: 'update',
          minScore: payload.minScore,
        };
        break;
      case 'REMOVE_RELATION':
        state.relationEdits[payload.relationId] = { kind: 'remove' };
        break;
      case 'ADD_RELATION':
        state.additions.push(payload);
        break;
      default:
        break;
    }
  }
  return state;
}

// Items in the order the server will number them (fields, relation edits, additions), with a key per item
// so a refused item index points back at its row.
export function itemsFromState(state: CourseItemsState): {
  items: AuthoredItemInput[];
  keys: string[];
} {
  const items: AuthoredItemInput[] = [];
  const keys: string[] = [];
  for (const [field, value] of Object.entries(state.fields) as [
    CourseRequestField,
    string | null,
  ][]) {
    items.push({ operation: 'SET_COURSE_FIELD', field, value });
    keys.push(`field:${field}`);
  }
  for (const [relationId, edit] of Object.entries(state.relationEdits)) {
    items.push(
      edit.kind === 'remove'
        ? { operation: 'REMOVE_RELATION', relationId }
        : { operation: 'UPDATE_RELATION', relationId, minScore: edit.minScore },
    );
    keys.push(`relation:${relationId}`);
  }
  state.additions.forEach((addition, index) => {
    items.push(addition);
    keys.push(`add:${index}`);
  });
  return { items, keys };
}

// Reads a relation from the current course's side, e.g. "Cần học trước học phần IT1".
export function relationReading(
  relation: CourseRelationRow,
  currentId: string,
): string {
  const currentIs =
    relation.targetCourse.id === currentId ? 'target' : 'source';
  const other =
    currentIs === 'target' ? relation.sourceCourse : relation.targetCourse;
  const choice = RELATION_CHOICES.find(
    (candidate) =>
      candidate.type === relation.relationType &&
      candidate.currentIs === currentIs,
  );
  return `${choice?.label ?? relation.relationType} ${other.courseCode}`;
}

export function additionFor(
  choiceKey: (typeof RELATION_CHOICES)[number]['key'],
  currentId: string,
  otherId: string,
  minScore: string | null,
): Op<'ADD_RELATION'> {
  const choice = RELATION_CHOICES.find(
    (candidate) => candidate.key === choiceKey,
  )!;
  const type: RelationType = choice.type;
  return {
    operation: 'ADD_RELATION',
    sourceCourseId: choice.currentIs === 'source' ? currentId : otherId,
    targetCourseId: choice.currentIs === 'source' ? otherId : currentId,
    relationType: type,
    minScore,
  };
}
