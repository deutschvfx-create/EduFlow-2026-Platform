import NextAuth, { DefaultSession } from "next-auth"
// import { Role } from "@prisma/client" // Use string for looser coupling in MVP/Demo without DB

export type Role = "DIRECTOR" | "TEACHER" | "STUDENT"

declare module "next-auth" {
    interface Session {
        user: {
            role?: Role
        } & DefaultSession["user"]
    }
    interface User {
        role?: Role
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: Role
    }
}
