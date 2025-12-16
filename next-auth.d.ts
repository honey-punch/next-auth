import { DefaultUser, JWT } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    password: string;
  }

  interface Session {
    user: User;
    iat: number;
    exp: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    password?: string;
  }
}
