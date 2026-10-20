import { HolderOutlined } from '@ant-design/icons';
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from 'antd';
import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';

interface RowContextValue {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
}

const RowContext = createContext<RowContextValue>({});

// The grip in the first column. Pointer drag and keyboard drag (space to lift, arrows, space to drop) both start here;
// the drag attributes (role, tabIndex, aria-*) belong on this button, not on the row, which must stay a table row for assistive tech.
export function DragHandle() {
  const { setActivatorNodeRef, listeners, attributes } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      aria-label="Kéo để đổi thứ tự"
      style={{ cursor: 'grab' }}
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
    />
  );
}

interface SortableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  // AntD puts the table's rowKey here, which is the sortable id.
  'data-row-key': string;
}

export function SortableRow(props: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });
  const style: CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };
  const context = useMemo(
    () => ({ setActivatorNodeRef, listeners, attributes }),
    [setActivatorNodeRef, listeners, attributes],
  );
  return (
    <RowContext.Provider value={context}>
      <tr {...props} ref={setNodeRef} style={style} />
    </RowContext.Provider>
  );
}
