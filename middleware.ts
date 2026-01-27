// MIDDLEWARE ПОЛНОСТЬЮ ОТКЛЮЧЕН ДЛЯ РЕЖИМА РАЗРАБОТКИ
// Раскомментируйте этот файл, когда настроите Firebase Auth

/*
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
*/

// Временная заглушка - разрешаем всё
export function middleware() {
    return null; // Пропускаем все запросы
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
