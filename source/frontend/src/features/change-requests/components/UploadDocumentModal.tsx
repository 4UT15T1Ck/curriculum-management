import { InboxOutlined } from '@ant-design/icons';
import { Alert, Form, Modal, Select, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { ChangeDocumentType } from '../api/changeRequests';
import { DOCUMENT_TYPE_LABELS } from '../constants/changeRequestLabels';
import { DOCUMENT_ACCEPT } from '../constants/changeRequestLimits';
import { useUploadDocument } from '../hooks/useChangeRequests';

interface UploadDocumentModalProps {
  requestId: string;
  onClose: () => void;
}

const TYPE_OPTIONS = (
  Object.keys(DOCUMENT_TYPE_LABELS) as ChangeDocumentType[]
).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

// The file is held back (beforeUpload returns false) and posted on OK, so the document type travels with it.
export function UploadDocumentModal({
  requestId,
  onClose,
}: UploadDocumentModalProps) {
  const upload = useUploadDocument(requestId);
  const [documentType, setDocumentType] = useState<ChangeDocumentType>();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const file = files[0]?.originFileObj;
  const onOk = () => {
    if (!documentType || !file) {
      setError('Chọn loại hồ sơ và tệp cần tải lên.');
      return;
    }
    setError(null);
    upload.mutate(
      { documentType, file },
      {
        onSuccess: onClose,
        onError: (reason) =>
          setError(errorMessage(reason, 'Không tải được hồ sơ.')),
      },
    );
  };
  return (
    <Modal
      open
      title="Tải hồ sơ lên"
      okText="Tải lên"
      cancelText="Hủy"
      onOk={onOk}
      onCancel={onClose}
      confirmLoading={upload.isPending}
    >
      <Form layout="vertical">
        <Form.Item label="Loại hồ sơ" required>
          <Select
            aria-label="Loại hồ sơ"
            options={TYPE_OPTIONS}
            value={documentType}
            onChange={setDocumentType}
            placeholder="Chọn loại hồ sơ"
          />
        </Form.Item>
        <Form.Item label="Tệp bản quét" required>
          <Upload.Dragger
            accept={DOCUMENT_ACCEPT}
            maxCount={1}
            fileList={files}
            beforeUpload={() => false}
            onChange={({ fileList }) => setFiles(fileList.slice(-1))}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p>Kéo tệp vào đây hoặc bấm để chọn tệp (PDF, Word, Excel, ảnh)</p>
          </Upload.Dragger>
        </Form.Item>
        {error && <Alert type="error" showIcon title={error} />}
      </Form>
    </Modal>
  );
}
