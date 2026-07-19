import { useFetch } from './useFetch';

export function useFeed(params?: { page?: number; limit?: number }) {
  let url = '/api/feed';
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  
  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const { data, error, loading, refetch } = useFetch<any>(url);

  return {
    feed: data?.feed || [],
    pagination: data?.pagination,
    error,
    loading,
    refetch,
  };
}
