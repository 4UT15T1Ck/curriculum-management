import { App, Modal, Transfer } from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { Curriculum, ElectiveGroup } from '../api/curriculum';
import { useAssignGroupItems } from '../hooks/useCurriculum';

interface AssignItemsModalProps {
  curriculum: Curriculum;
  group: ElectiveGroup;
  onClose: () => void;
}

// Offers elective rows with no group plus this group's own rows. Compulsory rows and rows of another group are never listed,
// so the server's GROUP_REQUIRES_ELECTIVE and ITEM_IN_OTHER_GROUP stay a guard rather than a path the user walks (US-026).
export function AssignItemsModal({
  curriculum,
  group,
  onClose,
}: AssignItemsModalProps) {
  const { message } = App.useApp();
  const assign = useAssignGroupItems(curriculum.version.id);
  const [selected, setSelected] = useState<string[]>(group.itemIds);
  const offered = curriculum.items.filter(
    (item) =>
      item.isElective &&
      (item.electiveGroup === null || item.electiveGroup.id === group.id),
  );
  const submit = () =>
    assign.mutate(
      { groupId: group.id, itemIds: selected },
      {
        onSuccess: onClose,
        onError: (reason) =>
          void message.error(
            errorMessage(reason, 'Không lưu được danh sách học phần.'),
          ),
      },
    );
  return (
    <Modal
      open
      width={760}
      title={`Chọn học phần cho nhóm ${group.groupCode}`}
      okText="Lưu"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={submit}
      confirmLoading={assign.isPending}
      destroyOnHidden
    >
      <Transfer
        showSearch
        dataSource={offered.map((item) => ({
          key: item.id,
          title: `${item.course.courseCode} — ${item.course.courseName} (${item.course.credits} TC)`,
        }))}
        titles={['Tự chọn chưa thuộc nhóm', `Trong nhóm ${group.groupCode}`]}
        targetKeys={selected}
        onChange={(keys) => setSelected(keys as string[])}
        render={(entry) => entry.title ?? ''}
        filterOption={(input, entry) =>
          (entry.title ?? '')
            .toLocaleLowerCase('vi')
            .includes(input.toLocaleLowerCase('vi'))
        }
        listStyle={{ width: 320, height: 320 }}
        locale={{ itemUnit: 'học phần', itemsUnit: 'học phần' }}
      />
    </Modal>
  );
}
