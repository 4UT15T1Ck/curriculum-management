import { useQuery } from '@tanstack/react-query';
import { fetchCohorts, fetchSemesters, releaseOptionKeys } from './semesters';

export const useSemesters = () =>
  useQuery({
    queryKey: releaseOptionKeys.semesters,
    queryFn: fetchSemesters,
  });

export const useCohorts = () =>
  useQuery({ queryKey: releaseOptionKeys.cohorts, queryFn: fetchCohorts });
