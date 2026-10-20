import { Alert } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { RequestStatusTag } from '../../../shared/change-requests/RequestStatusTag';
import type { Conflict } from '../api/changeRequests';
import { CONFLICT_TITLE } from '../constants/changeRequestLabels';

interface ConflictAlertProps {
  conflicts: readonly Conflict[];
}

// BR-30 warns; it never blocks creation or submission.
export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;
  return (
    <Alert
      type="warning"
      showIcon
      title={CONFLICT_TITLE}
      description={
        <ul>
          {conflicts.map((conflict) => (
            <li key={conflict.id}>
              <Link
                to={generatePath(ROUTES.changeRequestDetail, {
                  requestId: conflict.id,
                })}
              >
                {conflict.requestCode}
              </Link>
              {' — '}
              {conflict.title} · {conflict.createdBy.fullName} ·{' '}
              <RequestStatusTag status={conflict.status} />
            </li>
          ))}
        </ul>
      }
    />
  );
}
