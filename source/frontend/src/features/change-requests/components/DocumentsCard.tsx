import { App, Button, Card, Popconfirm, Table } from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type {
  ChangeRequestDetail,
  ChangeRequestDocument,
} from '../api/changeRequests';
import { downloadDocument } from '../api/changeRequests';
import {
  DOCUMENT_TYPE_LABELS,
  NO_DOCUMENTS,
} from '../constants/changeRequestLabels';
import { useRemoveDocument } from '../hooks/useChangeRequests';
import { formatDateTime, formatSize } from '../utils/format';
import { UploadDocumentModal } from './UploadDocumentModal';

interface DocumentsCardProps {
  request: ChangeRequestDetail;
}

// US-056: scans of the supporting documents. Upload while the request is open; remove only what no approver has seen.
export function DocumentsCard({ request }: DocumentsCardProps) {
  const { message } = App.useApp();
  const remove = useRemoveDocument();
  const [uploading, setUploading] = useState(false);
  const download = (document: ChangeRequestDocument) =>
    void downloadDocument(document).catch((error: unknown) =>
      message.error(errorMessage(error, 'Không tải được tệp.')),
    );
  return (
    <Card
      title="Hồ sơ đính kèm"
      extra={
        request.permissions.canUpload && (
          <Button onClick={() => setUploading(true)}>Tải hồ sơ lên</Button>
        )
      }
    >
      <Table<ChangeRequestDocument>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={request.documents}
        locale={{ emptyText: NO_DOCUMENTS }}
        columns={[
          {
            title: 'Loại hồ sơ',
            dataIndex: 'documentType',
            render: (type: ChangeRequestDocument['documentType']) =>
              DOCUMENT_TYPE_LABELS[type],
          },
          {
            title: 'Tệp',
            render: (_value, document) => (
              <Button type="link" onClick={() => download(document)}>
                {document.fileName}
              </Button>
            ),
          },
          {
            title: 'Dung lượng',
            dataIndex: 'sizeBytes',
            render: (size: number) => formatSize(size),
          },
          { title: 'Người tải', dataIndex: ['uploadedBy', 'fullName'] },
          {
            title: 'Thời điểm',
            dataIndex: 'createdAt',
            render: (iso: string) => formatDateTime(iso),
          },
          {
            title: 'Gửi kèm',
            dataIndex: 'seenInRound',
            render: (round: number | null) =>
              round === null ? '—' : `Đã gửi kèm lần ${round}`,
          },
          {
            title: 'Thao tác',
            render: (_value, document) =>
              document.canRemove && (
                <Popconfirm
                  title="Xóa hồ sơ này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    remove.mutateAsync(document.id).catch((error: unknown) => {
                      void message.error(
                        errorMessage(error, 'Không xóa được hồ sơ.'),
                      );
                    })
                  }
                >
                  <Button type="link" danger size="small">
                    Xóa
                  </Button>
                </Popconfirm>
              ),
          },
        ]}
      />
      {uploading && (
        <UploadDocumentModal
          requestId={request.id}
          onClose={() => setUploading(false)}
        />
      )}
    </Card>
  );
}
