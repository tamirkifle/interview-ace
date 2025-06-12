import { useQuery } from '@apollo/client';
import { GET_TRAITS } from '../graphql/queries';
import { Trait } from '../types';

export const useTraits = () => {
  const { data, loading, error, refetch } = useQuery(GET_TRAITS);

  return {
    traits: (data?.traits || []) as Trait[],
    loading,
    error,
    refetch
  };
};