import { getUser } from '@/src/entries/user/api/user';
import { useQuery } from '@tanstack/react-query';

export function useUser() {
  const { data: userData } = useQuery<KeyFlowResponse<User[]>>({
    queryKey: ['usergroup'],
    queryFn: () => getUser(),
    staleTime: 60 * 1_000,
    gcTime: 120 * 1_000,
  });

  return { userData };
}
