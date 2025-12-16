import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('x-url', req.url);

  const session = await getServerSession(authOptions);

  const newUrl = new URL(req.url);

  if (newUrl.pathname.startsWith('/back')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    newUrl.pathname = newUrl.pathname + `/auth/userid=${session.user.name}&passwd=${session.user.password}&appid=1`;

    return NextResponse.rewrite(newUrl, { headers: res.headers });
  }

  return res;
}
