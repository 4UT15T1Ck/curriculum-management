import { App, Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import { ApiError } from '../../../shared/api/client';
import { OrgUnitSelect } from '../../../shared/org-units/OrgUnitSelect';
import {
  useCreateSubjectGroup,
  useUpdateSubjectGroup,
} from '../hooks/useSubjectGroupAdmin';
import type { SubjectGroupSummary } from '../../../shared/subject-groups/subjectGroups';
import {
  FACULTY_RULES,
  GROUP_CODE_RULES,
  GROUP_NAME_RULES,
} from '../schema/subjectGroupRules';

interface SubjectGroupFormModalProps {
  open: boolean;
  initial?: SubjectGroupSummary;
  onClose: () => void;
}
export function SubjectGroupFormModal({
  open,
  initial,
  onClose,
}: SubjectGroupFormModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const create = useCreateSubjectGroup();
  const update = useUpdateSubjectGroup();
  useEffect(() => {
    if (open)
      form.setFieldsValue({
        groupCode: initial?.groupCode,
        groupName: initial?.groupName,
        facultyId: initial?.faculty.id,
      });
    else form.resetFields();
  }, [form, initial, open]);
  async function submit(values: {
    groupCode?: string;
    groupName: string;
    facultyId: string;
  }) {
    try {
      if (initial)
        await update.mutateAsync({
          groupId: initial.id,
          body: { groupName: values.groupName, facultyId: values.facultyId },
        });
      else
        await create.mutateAsync({
          groupCode: values.groupCode ?? '',
          groupName: values.groupName,
          facultyId: values.facultyId,
        });
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'GROUP_CODE_TAKEN')
        form.setFields([{ name: 'groupCode', errors: [error.message] }]);
      else
        message.error(
          error instanceof Error
            ? error.message
            : 'Không thể lưu nhóm chuyên môn',
        );
    }
  }
  return (
    <Modal
      open={open}
      title={initial ? 'Sửa nhóm chuyên môn' : 'Thêm nhóm chuyên môn'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={create.isPending || update.isPending}
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        {initial ? (
          <Form.Item label="Mã nhóm">
            <Input value={initial.groupCode} disabled />
          </Form.Item>
        ) : (
          <Form.Item name="groupCode" label="Mã nhóm" rules={GROUP_CODE_RULES}>
            <Input />
          </Form.Item>
        )}
        <Form.Item name="groupName" label="Tên nhóm" rules={GROUP_NAME_RULES}>
          <Input />
        </Form.Item>
        <Form.Item name="facultyId" label="Khoa" rules={FACULTY_RULES}>
          <OrgUnitSelect types={['FACULTY']} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
