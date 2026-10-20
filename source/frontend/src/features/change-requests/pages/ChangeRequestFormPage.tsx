import { Flex, Typography } from 'antd';
import { useSearchParams } from 'react-router';
import { CreateRequestPanel } from '../components/CreateRequestPanel';
import { DATA_TYPES } from '../requestTypes';
import { readPrefill } from '../utils/prefill';

// MH-39: a data request; the target arrives chosen when the user came from "Tạo đề xuất" on another screen.
export function ChangeRequestFormPage() {
  const [params] = useSearchParams();
  return (
    <Flex vertical gap="middle">
      <Typography.Title level={2} style={{ margin: 0 }}>
        Tạo đề xuất thay đổi
      </Typography.Title>
      <CreateRequestPanel types={DATA_TYPES} defaults={readPrefill(params)} />
    </Flex>
  );
}
