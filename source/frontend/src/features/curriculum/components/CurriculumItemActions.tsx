import { App, Button, Popconfirm, Space } from 'antd';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { CurriculumItem } from '../api/curriculum';
import { useDeleteItem } from '../hooks/useCurriculum';

interface CurriculumItemActionsProps {
  versionId: string;
  item: CurriculumItem;
  onEdit: (item: CurriculumItem) => void;
  onRequisites: (item: CurriculumItem) => void;
}

// Shown only when the server says the caller may change this very row (canEdit).
export function CurriculumItemActions({
  versionId,
  item,
  onEdit,
  onRequisites,
}: CurriculumItemActionsProps) {
  const { message } = App.useApp();
  const remove = useDeleteItem(versionId);
  if (!item.canEdit) return null;
  return (
    <Space size={0} wrap>
      <Button type="link" size="small" onClick={() => onEdit(item)}>
        Sửa
      </Button>
      <Button type="link" size="small" onClick={() => onRequisites(item)}>
        Điều kiện
      </Button>
      <Popconfirm
        title={`Xóa ${item.course.courseCode} khỏi khung?`}
        description="Các điều kiện riêng của dòng này cũng bị xóa."
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        onConfirm={() =>
          remove.mutateAsync(item.id).catch((reason: unknown) => {
            void message.error(errorMessage(reason, 'Không xóa được dòng.'));
          })
        }
      >
        <Button type="link" danger size="small">
          Xóa
        </Button>
      </Popconfirm>
    </Space>
  );
}
