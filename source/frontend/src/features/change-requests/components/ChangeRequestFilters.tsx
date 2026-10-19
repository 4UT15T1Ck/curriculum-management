import { Flex, Select, Switch, Typography } from 'antd';
import { REQUEST_STATUS_LABELS } from '../../../shared/change-requests/requestStatus';
import type {
  ChangeRequestQuery,
  ChangeRequestStatus,
  ChangeRequestType,
  RequestOrigin,
} from '../api/changeRequests';
import {
  ORIGIN_LABELS,
  REQUEST_TYPE_LABELS,
} from '../constants/changeRequestLabels';

interface ChangeRequestFiltersProps {
  value: ChangeRequestQuery;
  onChange: (filters: Partial<ChangeRequestQuery>) => void;
}

const options = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((key) => ({
    value: key,
    label: labels[key],
  }));

// Filters of MH-38: status, type, origin (US-055 AC4) and "my requests".
export function ChangeRequestFilters({
  value,
  onChange,
}: ChangeRequestFiltersProps) {
  return (
    <Flex gap="small" wrap align="center">
      <Select<ChangeRequestStatus>
        allowClear
        aria-label="Trạng thái"
        placeholder="Trạng thái"
        style={{ minWidth: 200 }}
        value={value.status}
        options={options(REQUEST_STATUS_LABELS)}
        onChange={(status) => onChange({ status })}
      />
      <Select<ChangeRequestType>
        allowClear
        aria-label="Loại đề xuất"
        placeholder="Loại đề xuất"
        style={{ minWidth: 240 }}
        value={value.requestType}
        options={options(REQUEST_TYPE_LABELS)}
        onChange={(requestType) => onChange({ requestType })}
      />
      <Select<RequestOrigin>
        allowClear
        aria-label="Nguồn"
        placeholder="Nguồn"
        style={{ minWidth: 200 }}
        value={value.origin}
        options={options(ORIGIN_LABELS)}
        onChange={(origin) => onChange({ origin })}
      />
      <Flex gap="small" align="center">
        <Switch
          aria-label="Chỉ đề xuất của tôi"
          checked={value.mine === true}
          onChange={(mine) => onChange({ mine: mine || undefined })}
        />
        <Typography.Text>Chỉ đề xuất của tôi</Typography.Text>
      </Flex>
    </Flex>
  );
}
