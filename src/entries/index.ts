import { keysToCamelCase } from '@/src/utils/utls';
import ky from 'ky';
import { getCsrfToken, getSession } from 'next-auth/react';

// ms 단위
const EXPIRE_THRESHOLD = 60 * 1000; // 1분

const api = ky.extend({
  hooks: {
    beforeRequest: [
      async () => {
        const session = await getSession();

        if (!session?.exp) {
          return;
        }

        const now = Date.now();
        // ms 단위
        const expiresAt = session.exp * 1000;
        const remaining = expiresAt - now;

        // 1분 이상 남았으면 세션 연장 x
        if (remaining > EXPIRE_THRESHOLD) {
          return;
        }

        // 1분 미만 남았으면 세션 연장 o
        const csrfToken = await getCsrfToken();
        const body = { csrfToken, data: { exp: true } };
        await fetch('/api/auth/session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      },
    ],
    afterResponse: [
      async (_req, _options, res) => {
        // res body 파싱 후 대문자 키를 모두 카멜케이스로 변경
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const json = (await res.json()) as AnyObject;

          const camelCaseJson = keysToCamelCase(json);

          return new Response(JSON.stringify(camelCaseJson), {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          });
        }

        return res;
      },
    ],
  },
});

export default api;
