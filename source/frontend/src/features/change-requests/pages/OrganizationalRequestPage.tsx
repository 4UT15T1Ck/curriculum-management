import { Flex, Typography } from 'antd';
import { CreateRequestPanel } from '../components/CreateRequestPanel';
import { ORGANIZATION_TYPES } from '../requestTypes';

const DEFAULTS = {
  requestType: 'ORGANIZATION',
  targetType: 'SUBJECT_GROUP',
} as const;

// MH-40: R2 and R4 change the members of a subject group or the directors of a program; level 3 only (US-060).
export function OrganizationalRequestPage() {
  return (
    <Flex vertical gap="middle">
      <Typography.Title level={2} style={{ margin: 0 }}>
        Đề xuất thay đổi tổ chức
      </Typography.Title>
      <CreateRequestPanel types={ORGANIZATION_TYPES} defaults={DEFAULTS} />
    </Flex>
  );
}
