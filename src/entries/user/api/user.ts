import api from '@/src/entries';

export async function getUser() {
  const user = await api.get('/back/usergroup').json<KeyFlowResponse<User[]>>();

  return user;
}
