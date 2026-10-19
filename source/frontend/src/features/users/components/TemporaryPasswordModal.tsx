import { Modal, Typography } from 'antd';

interface TemporaryPasswordModalProps {
  username: string;
  temporaryPassword: string | null;
  onClose: () => void;
}

export function TemporaryPasswordModal({
  username,
  temporaryPassword,
  onClose,
}: TemporaryPasswordModalProps) {
  return (
    <Modal
      open={temporaryPassword !== null}
      title={`Mật khẩu tạm thời — ${username}`}
      onOk={onClose}
      onCancel={onClose}
      maskClosable={false}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Typography.Paragraph>
        Mật khẩu chỉ hiện một lần. Người dùng phải đổi mật khẩu khi đăng nhập
        lần đầu.
      </Typography.Paragraph>
      {temporaryPassword && (
        <Typography.Text copyable code>
          {temporaryPassword}
        </Typography.Text>
      )}
    </Modal>
  );
}
