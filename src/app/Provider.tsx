'use client';

import { useEffect, useRef } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider, signOut, useSession } from 'next-auth/react';

// ms 단위
const CHECK_SESSION_INTERVAL = 1000 * 60; // 1분

export default function Provider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <SessionTimer />
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}

function SessionTimer() {
  const { data: clientSession } = useSession();
  const alertedRef = useRef(false);

  useEffect(() => {
    if (!clientSession?.exp) return;

    const check = () => {
      const now = Date.now();
      // ms단위
      const expiresAt = clientSession.exp * 1000;
      const remaining = expiresAt - now;

      if (remaining <= 0 && !alertedRef.current) {
        alertedRef.current = true;
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        signOut();
      }
    };

    const interval = setInterval(check, CHECK_SESSION_INTERVAL);
    check();

    return () => clearInterval(interval);
  }, [clientSession?.exp]);

  return <></>;
}
