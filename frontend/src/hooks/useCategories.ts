import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { Category } from '../types';

export const useCategories = () => {
  const { data, loading, error } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first', // Cache categories since they don't change often
  });

  return {
    categories: (data?.categories || []) as Category[],
    loading,
    error,
  };
};