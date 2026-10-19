import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { App } from 'antd';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { Curriculum } from '../api/curriculum';
import { useReorderSemester } from './useCurriculum';

export interface SemesterOrder {
  plannedSemester: number;
  itemIds: string[];
}

// The new order of one semester after dragging `activeId` onto `overId`, or null when nothing should be saved:
// no target, the same row, an unknown row, or a drop onto another semester (that is the row form's job).
// The id list is the semester's whole row set, which is why the table only allows dragging while no filter is active.
export function reorderedSemester(
  items: Curriculum['items'],
  activeId: string,
  overId: string | undefined,
): SemesterOrder | null {
  if (!overId || activeId === overId) return null;
  const moved = items.find((item) => item.id === activeId);
  const target = items.find((item) => item.id === overId);
  if (!moved || !target || moved.plannedSemester !== target.plannedSemester)
    return null;
  const ids = items
    .filter((item) => item.plannedSemester === moved.plannedSemester)
    .map((item) => item.id);
  return {
    plannedSemester: moved.plannedSemester,
    itemIds: arrayMove(ids, ids.indexOf(moved.id), ids.indexOf(target.id)),
  };
}

// Reorder is within one semester; moving between semesters is the row form's job.
export function useSemesterReorder(curriculum: Curriculum) {
  const { message } = App.useApp();
  const reorder = useReorderSemester(curriculum.version.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const order = reorderedSemester(
      curriculum.items,
      String(active.id),
      over ? String(over.id) : undefined,
    );
    if (!order) return;
    reorder.mutate(order, {
      onError: (reason) =>
        void message.error(errorMessage(reason, 'Không đổi được thứ tự.')),
    });
  };
  return { sensors, onDragEnd, isSaving: reorder.isPending };
}
