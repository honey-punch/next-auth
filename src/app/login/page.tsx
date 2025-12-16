'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { signIn, useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });

  const { data: session, status } = useSession();

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { username, password } = user;

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl: '/',
    });

    if (res?.ok) {
      router.push('/');
    } else {
      console.log(res);
    }
  }

  return (
    <form onSubmit={login} className="flex w-[200px] flex-col gap-4">
      <input
        type="text"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        placeholder="ID"
        className="rounded border p-2"
        autoFocus
      />
      <input
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        placeholder="PASSWORD"
        className="rounded border p-2"
      />
      <button type="submit" className="rounded bg-black p-2 font-bold text-white">
        LOG IN
      </button>
    </form>
  );
}
