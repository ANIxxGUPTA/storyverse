import { useFetch } from './useFetch';

export function useStories(params?: { genre?: string; limit?: number }) {
  let url = '/api/stories';
  const query = new URLSearchParams();
  if (params?.genre) query.append('genre', params.genre);
  if (params?.limit) query.append('limit', params.limit.toString());
  
  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const { data, error, loading, refetch } = useFetch<any>(url);

  const storiesData = Array.isArray(data) ? data : data?.stories || [];

  return {
    stories: storiesData,
    pagination: data?.pagination,
    error,
    loading,
    refetch,
  };
}
