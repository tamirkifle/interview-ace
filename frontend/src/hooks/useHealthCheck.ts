import { gql, useQuery } from '@apollo/client';

const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`;

export const useHealthCheck = () => {
  const { data, loading, error } = useQuery(HEALTH_CHECK, {
    pollInterval: 5000, // Check every 5 seconds
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    isConnected: Boolean(data?.health),
    isLoading: loading,
    error: error?.message || 'Unable to connect to backend',
  };
}; 