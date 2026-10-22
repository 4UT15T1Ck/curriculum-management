import { useEffect } from 'react';
import { App, Form, Input, Modal } from 'antd';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import { OrgUnitSelect } from '../../../shared/org-units/OrgUnitSelect';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import type { CreatedUser, UserDetail } from '../api/users';
import {
  EMAIL_RULES,
  FULL_NAME_RULES,
  USER_CODE_RULES,
  USERNAME_RULES,
} from '../schema/userRules';

interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: UserDetail;
  onClose: () => void;
  onSaved: (result: CreatedUser | UserDetail) => void;
}

export function UserFormModal({
  open,
  mode,
  initial,
  onClose,
  onSaved,
}: UserFormModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const create = useCreateUser();
  const update = useUpdateUser();
  useEffect(() => {
    if (open)
      form.setFieldsValue({
        username: initial?.username,
        userCode: initial?.userCode,
        fullName: initial?.fullName,
        email: initial?.email ?? undefined,
        orgUnitId: initial?.orgUnit?.id,
      });
    else form.resetFields();
  }, [form, initial, open]);
  async function submit(values: Record<string, string | null | undefined>) {
    try {
      const result =
        mode === 'create'
          ? await create.mutateAsync({
              username: values.username ?? '',
              userCode: values.userCode ?? '',
              fullName: values.fullName ?? '',
              ...(values.email ? { email: values.email } : {}),
              ...(values.orgUnitId ? { orgUnitId: values.orgUnitId } : {}),
            })
          : await update.mutateAsync({
              userId: initial?.id ?? '',
              body: {
                userCode: values.userCode ?? undefined,
                fullName: values.fullName ?? undefined,
                email: values.email,
                orgUnitId: values.orgUnitId,
              },
            });
      onSaved(result);
    } catch (error) {
      if (!applyFieldErrors(form, error))
        void message.error(errorMessage(error, 'Không lưu được tài khoản.'));
    }
  }
  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Thêm tài khoản' : 'Sửa tài khoản'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={create.isPending || update.isPending}
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        {mode === 'create' && (
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={USERNAME_RULES}
          >
            <Input />
          </Form.Item>
        )}
        {mode === 'edit' && (
          <Form.Item label="Tên đăng nhập">
            <Input value={initial?.username} disabled />
          </Form.Item>
        )}
        <Form.Item
          name="userCode"
          label="Mã người dùng"
          rules={USER_CODE_RULES}
        >
          <Input />
        </Form.Item>
        <Form.Item name="fullName" label="Họ tên" rules={FULL_NAME_RULES}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={EMAIL_RULES}>
          <Input />
        </Form.Item>
        <Form.Item name="orgUnitId" label="Đơn vị">
          <OrgUnitSelect />
        </Form.Item>
      </Form>
    </Modal>
  );
}
