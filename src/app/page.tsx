'use client';

import { useRouter } from 'next/navigation';

import { useUser } from '@/src/hooks/user/useUser';
import { signOut, useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const { userData } = useUser();

  function logout() {
    signOut();
  }

  async function extend() {
    const res = await update({
      exp: true,
    });

    if (!res) {
      router.push('/login');
    }
  }

  const result = userData?.result || [];

  return (
    <div className="flex w-[200px] flex-col gap-4">
      <div>current user - {session?.user.name}</div>
      <button onClick={extend} className="rounded bg-black p-2 font-bold text-white">
        EXTEND SESSION
      </button>
      <button onClick={logout} className="rounded bg-black p-2 font-bold text-white">
        LOG OUT
      </button>
      {result.map((user) => (
        <div key={user.userid}>
          {user.name}({user.userid})
        </div>
      ))}
    </div>
  );
}
