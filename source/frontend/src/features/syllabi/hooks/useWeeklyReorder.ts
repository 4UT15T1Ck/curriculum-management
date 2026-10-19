import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { App } from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { WeeklyContent } from '../api/syllabi';
import { useReorderWeeks } from './useSyllabus';

// The new id order after dragging `activeId` onto `overId`, or null when nothing should be saved.
export function reorderedWeekIds(
  weeks: WeeklyContent[],
  activeId: string,
  overId: string | undefined,
): string[] | null {
  if (!overId || activeId === overId) return null;
  const ids = weeks.map((week) => week.id);
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from < 0 || to < 0) return null;
  return arrayMove(ids, from, to);
}

// Shows the new order at once and keeps it only until the save settles: a failure puts the server's order back.
export function useWeeklyReorder(
  courseId: string,
  syllabusId: string,
  weeks: WeeklyContent[],
) {
  const { message } = App.useApp();
  const reorder = useReorderWeeks(courseId);
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const shown = pendingIds
    ? pendingIds
        .map((id) => weeks.find((week) => week.id === id))
        .filter((week): week is WeeklyContent => week !== undefined)
    : weeks;
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const ids = reorderedWeekIds(
      shown,
      String(active.id),
      over ? String(over.id) : undefined,
    );
    if (!ids) return;
    setPendingIds(ids);
    reorder.mutate(
      { syllabusId, ids },
      {
        onError: (reason) =>
          void message.error(errorMessage(reason, 'Không đổi được thứ tự.')),
        onSettled: () => setPendingIds(null),
      },
    );
  };
  return { sensors, onDragEnd, shown, isSaving: reorder.isPending };
}
