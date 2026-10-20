import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { App, Button, Flex, Popconfirm, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  DragHandle,
  SortableRow,
} from '../../../shared/components/SortableRow';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { Plo } from '../api/outcomes';
import { NO_PLOS, ploDeleteConfirm } from '../constants/outcomeLabels';
import { useDeletePlo } from '../hooks/useOutcomes';
import { usePloReorder } from '../hooks/usePloReorder';

interface PloTableProps {
  versionId: string;
  plos: Plo[];
  canEdit: boolean;
  onEdit: (plo: Plo) => void;
}

export function PloTable({ versionId, plos, canEdit, onEdit }: PloTableProps) {
  const { message } = App.useApp();
  const remove = useDeletePlo();
  const { sensors, onDragEnd, shown, isSaving } = usePloReorder(
    versionId,
    plos,
  );
  const columns: TableColumnsType<Plo> = [
    ...(canEdit
      ? [{ key: 'drag', width: 40, render: () => <DragHandle /> }]
      : []),
    { title: 'Mã', dataIndex: 'ploCode', width: 90 },
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Mô tả (tiếng Anh)',
      dataIndex: 'englishDescription',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Nhóm năng lực',
      dataIndex: 'competencyGroup',
      width: 150,
      render: (value: string | null) => value ?? '—',
    },
    { title: 'Số học phần', dataIndex: 'courseCount', width: 110 },
    { title: 'Liên kết CLO', dataIndex: 'cloLinkCount', width: 110 },
    ...(canEdit
      ? [
          {
            title: 'Thao tác',
            width: 130,
            render: (_value: unknown, plo: Plo) => (
              <Flex gap={4}>
                <Button type="link" size="small" onClick={() => onEdit(plo)}>
                  Sửa
                </Button>
                <Popconfirm
                  title={`Xóa ${plo.ploCode}?`}
                  description={ploDeleteConfirm(
                    plo.courseCount,
                    plo.cloLinkCount,
                  )}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    remove.mutateAsync(plo.id).catch((reason: unknown) => {
                      void message.error(
                        errorMessage(reason, 'Không xóa được PLO.'),
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
        ]
      : []),
  ];
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={shown.map((plo) => plo.id)}
        strategy={verticalListSortingStrategy}
      >
        <Table<Plo>
          size="small"
          rowKey="id"
          pagination={false}
          loading={isSaving}
          columns={columns}
          dataSource={shown}
          locale={{ emptyText: NO_PLOS }}
          components={canEdit ? { body: { row: SortableRow } } : undefined}
        />
      </SortableContext>
    </DndContext>
  );
}
