import { Flex } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { useSeesMatrices } from '../../../shared/outcomes/useSeesMatrices';
import { OUTCOME_PAGE_LINKS } from '../constants/outcomeLabels';

interface OutcomeNavProps {
  programId: string;
  versionId: string;
}

const PAGES = [
  'plos',
  'coursePloMatrix',
  'cloPloMatrix',
  'outcomeCoverage',
] as const;

// The four outcome screens of one version; a student sees the PLO list only (the others answer 403).
export function OutcomeNav({ programId, versionId }: OutcomeNavProps) {
  const seesMatrices = useSeesMatrices();
  return (
    <Flex gap="middle" wrap>
      <Link to={generatePath(ROUTES.programDetail, { programId })}>
        ← Chương trình
      </Link>
      {PAGES.filter((page) => page === 'plos' || seesMatrices).map((page) => (
        <Link
          key={page}
          to={generatePath(ROUTES[page], { programId, versionId })}
        >
          {OUTCOME_PAGE_LINKS[page]}
        </Link>
      ))}
    </Flex>
  );
}
