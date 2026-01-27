import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // ВРЕМЕННО ОТКЛЮЧАЕМ ПРОВЕРКУ, ЧТОБЫ ТЫ МОГ ЗАЙТИ
      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;