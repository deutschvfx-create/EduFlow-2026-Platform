// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// export const prisma =
//     globalForPrisma.prisma ||
//     new PrismaClient({
//         log: ["error"],
//     });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Mock export to prevent import errors in other files if some still import it
export const prisma: any = new Proxy({}, {
    get: () => {
        throw new Error("Prisma is disabled in Dev Mode. Do not usage database.");
    }
});
