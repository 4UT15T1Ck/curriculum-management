import { Alert, Button, Flex } from 'antd';
import type { CurriculumWarning } from '../api/curriculum';

interface CurriculumWarningsPanelProps {
  warnings: CurriculumWarning[];
}

export const itemElementId = (itemId: string) => `curriculum-item-${itemId}`;

function scrollToItem(itemId: string) {
  document
    .getElementById(itemElementId(itemId))
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// HIGH warnings first (they block a clean check later); INFO ones are reminders.
export function CurriculumWarningsPanel({
  warnings,
}: CurriculumWarningsPanelProps) {
  if (warnings.length === 0) return null;
  const ordered = [...warnings].sort(
    (left, right) =>
      Number(right.severity === 'HIGH') - Number(left.severity === 'HIGH'),
  );
  return (
    <Flex vertical gap="small" role="list" aria-label="Cảnh báo của khung">
      {ordered.map((warning, index) => (
        <Alert
          key={`${warning.code}-${warning.itemId ?? warning.semester}-${index}`}
          role="listitem"
          type={warning.severity === 'HIGH' ? 'warning' : 'info'}
          showIcon
          message={warning.message}
          action={
            warning.itemId ? (
              <Button
                size="small"
                type="link"
                onClick={() => scrollToItem(warning.itemId!)}
              >
                Xem
              </Button>
            ) : undefined
          }
        />
      ))}
    </Flex>
  );
}
