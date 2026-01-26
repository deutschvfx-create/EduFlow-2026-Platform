import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;
                const email = credentials.email as string;

                // Demo Users for MVP
                if (email === "director@example.com") {
                    return { id: "d1", name: "Director Smith", email, role: "DIRECTOR" }
                }
                if (email === "teacher@example.com") {
                    return { id: "t1", name: "Teacher Jones", email, role: "TEACHER" }
                }
                if (email === "student@example.com") {
                    return { id: "s1", name: "Alex Student", email, role: "STUDENT" }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        },
    }
})
