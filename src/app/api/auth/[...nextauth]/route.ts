import { parseXml } from '@/src/utils/utls';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

type UserInRes = {
  ID: string;
  PID: string;
  USERID: string;
  NAME: string;
  TYPE: string;
  PASSWD: string;
  DEPARTMENT: string;
  CLASS: string;
  EMAIL: string;
  PHONE: string;
  CELLPHONE: string;
  HASPERIOD: string;
  STARTDATE: string;
  ENDDATE: string;
  AUTHORITY: string;
  CATEGORY: string;
  IS_DELETED: string;
  CREATEDATE: string;
  CREATEUSER: string;
  MODIFYDATE: string;
  MODIFYUSER: string;
};

const period = 60 * 30; // 30분
// const period = 3; // 3초 테스트용

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials as Record<'username' | 'password', string>;

        try {
          const res = await fetch(
            `${process.env.PROXY_PATH}/API/usergroup/auth/userid=root&passwd=1234&appid=1/param/userid=${username}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          const data = await parseXml(res);

          if (!res.ok) {
            return null;
          }

          const matchedUser: UserInRes = data.RESULT.ITEM;
          const isMatched = matchedUser && matchedUser.PASSWD === password;

          if (isMatched) {
            return { id: matchedUser.ID, name: matchedUser.USERID, password: matchedUser.PASSWD };
          }

          return null;
        } catch (err) {
          console.error(err);
          return null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      // 토큰 업데이트(touch)인 경우에는 iat, exp만 수정
      if (trigger === 'update' && session?.exp) {
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + period;

        return token;
      }

      if (account) {
        token.accessToken = account.access_token;
      }

      if (user) {
        token.name = user.name;
        token.password = user.password;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.password = token.password as string;
        session.iat = token.iat as number;
        session.exp = token.exp as number;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: period,
  },
  jwt: {
    maxAge: period,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
