export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // ВРЕМЕННО ПУСКАЕМ ВСЕХ, ЧТОБЫ МАСТЕР-КЛЮЧ ЗАРАБОТАЛ
      return true;
    },
  },
  providers: [], 
}; // <-- УБЕДИСЬ, ЧТО ЭТА СКОБКА И ТОЧКА С ЗАПЯТОЙ НА МЕСТЕ
