import { PlusOutlined } from '@ant-design/icons';
import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { App, Button, Flex, Popconfirm, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import {
  DragHandle,
  SortableRow,
} from '../../../shared/components/SortableRow';
import { RichTextView } from '../../../shared/components/rich-text/RichTextView';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { WeeklyContent } from '../api/syllabi';
import {
  ADD_WEEK,
  EMPTY_SECTION,
  WEEKLY_CLO_COLUMN,
} from '../constants/syllabusLabels';
import { useDeleteWeek } from '../hooks/useSyllabus';
import { useWeeklyReorder } from '../hooks/useWeeklyReorder';
import type { EditorTabProps } from '../types';
import { CloCodes } from './CloCodes';
import { WeeklyContentModal } from './WeeklyContentModal';

export function WeeklyContentTable({ courseId, syllabus }: EditorTabProps) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState<WeeklyContent | 'new' | null>(null);
  const remove = useDeleteWeek(courseId);
  const { sensors, onDragEnd, shown, isSaving } = useWeeklyReorder(
    courseId,
    syllabus.id,
    syllabus.weeklyContents,
  );
  const columns: TableColumnsType<WeeklyContent> = [
    { key: 'drag', width: 40, render: () => <DragHandle /> },
    { title: 'Tuần', dataIndex: 'weekLabel', width: 110 },
    {
      title: 'Nội dung',
      render: (_value, week) => (
        <RichTextView html={week.content} emptyText={EMPTY_SECTION} />
      ),
    },
    {
      title: WEEKLY_CLO_COLUMN,
      width: 110,
      render: (_value, week) => (
        <CloCodes cloIds={week.cloIds} clos={syllabus.clos} />
      ),
    },
    {
      title: 'Hoạt động dạy học',
      render: (_value, week) => (
        <RichTextView html={week.teachingActivities} emptyText="—" />
      ),
    },
    {
      title: 'Thao tác',
      width: 130,
      render: (_value, week) => (
        <Flex gap={4}>
          <Button type="link" size="small" onClick={() => setEditing(week)}>
            Sửa
          </Button>
          <Popconfirm
            title={`Xóa ${week.weekLabel}?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              remove.mutateAsync(week.id).catch((reason: unknown) => {
                void message.error(
                  errorMessage(reason, 'Không xóa được dòng.'),
                );
              })
            }
          >
            <Button type="link" size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Flex>
      ),
    },
  ];
  return (
    <Flex vertical gap="small">
      <Flex justify="end">
        <Button icon={<PlusOutlined />} onClick={() => setEditing('new')}>
          {ADD_WEEK}
        </Button>
      </Flex>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={shown.map((week) => week.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table<WeeklyContent>
            size="small"
            rowKey="id"
            pagination={false}
            loading={isSaving}
            columns={columns}
            dataSource={shown}
            components={{ body: { row: SortableRow } }}
          />
        </SortableContext>
      </DndContext>
      {editing !== null && (
        <WeeklyContentModal
          courseId={courseId}
          syllabusId={syllabus.id}
          clos={syllabus.clos}
          week={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </Flex>
  );
}
