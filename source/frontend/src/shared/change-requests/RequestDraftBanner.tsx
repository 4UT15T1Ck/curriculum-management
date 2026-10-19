import { Alert } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../routes';
import type { components } from '../api/schema';
import { RequestStatusTag } from './RequestStatusTag';

type RequestRef = components['schemas']['RequestRefDto'];

interface RequestDraftBannerProps {
  request: RequestRef | null;
}

export const REQUEST_DRAFT_NOTE =
  'Thay đổi ở đây chỉ nằm trong đề xuất; dữ liệu đang áp dụng giữ nguyên cho đến khi đề xuất được phê duyệt và ban hành.';

// Shown on every screen that edits a request's working copy, so nobody mistakes it for the released data.
export function RequestDraftBanner({ request }: RequestDraftBannerProps) {
  if (!request) return null;
  return (
    <Alert
      type="info"
      showIcon
      title={
        <>
          Bạn đang xem bản nháp của đề xuất{' '}
          <Link
            to={generatePath(ROUTES.changeRequestEdit, {
              requestId: request.id,
            })}
          >
            {request.requestCode}
          </Link>{' '}
          <RequestStatusTag status={request.status} />
        </>
      }
      description={REQUEST_DRAFT_NOTE}
    />
  );
}
