/*
  Warnings:

  - You are about to drop the column `used` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `birthYear` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "expiresAt" DATETIME NOT NULL,
    "maxUses" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "groupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Invite" ("createdAt", "email", "expiresAt", "id", "organizationId", "role", "token") SELECT "createdAt", "email", "expiresAt", "id", "organizationId", "role", "token" FROM "Invite";
DROP TABLE "Invite";
ALTER TABLE "new_Invite" RENAME TO "Invite";
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "birthDate" DATETIME,
    "managed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "managed", "name", "organizationId", "password", "role") SELECT "createdAt", "email", "id", "managed", "name", "organizationId", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
