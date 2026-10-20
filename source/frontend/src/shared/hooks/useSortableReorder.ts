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
import { errorMessage } from '../forms/applyFieldErrors';

interface SaveCallbacks {
  onError: (reason: unknown) => void;
  onSettled: () => void;
}

// The new id order after dragging `activeId` onto `overId`, or null when nothing should be saved.
export function reorderedIds(
  rows: readonly { id: string }[],
  activeId: string,
  overId: string | undefined,
): string[] | null {
  if (!overId || activeId === overId) return null;
  const ids = rows.map((row) => row.id);
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from < 0 || to < 0) return null;
  return arrayMove(ids, from, to);
}

// Drag-and-drop ordering of a table. Shows the new order at once and keeps it only until the save settles:
// a failure puts the server's order back. `save` starts the request; it must call back on error and when settled.
export function useSortableReorder<T extends { id: string }>(
  rows: T[],
  save: (ids: string[], callbacks: SaveCallbacks) => void,
  isSaving: boolean,
) {
  const { message } = App.useApp();
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const shown = pendingIds
    ? pendingIds
        .map((id) => rows.find((row) => row.id === id))
        .filter((row): row is T => row !== undefined)
    : rows;
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const ids = reorderedIds(
      shown,
      String(active.id),
      over ? String(over.id) : undefined,
    );
    if (!ids) return;
    setPendingIds(ids);
    save(ids, {
      onError: (reason) =>
        void message.error(errorMessage(reason, 'Không đổi được thứ tự.')),
      onSettled: () => setPendingIds(null),
    });
  };
  return { sensors, onDragEnd, shown, isSaving };
}
