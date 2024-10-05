/*
  Warnings:

  - Added the required column `iv` to the `BotProvider` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BotProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "provider" INTEGER NOT NULL,
    "secretKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    CONSTRAINT "BotProvider_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BotProvider" ("apiUrl", "id", "localId", "name", "nickName", "ownerId", "provider", "secretKey") SELECT "apiUrl", "id", "localId", "name", "nickName", "ownerId", "provider", "secretKey" FROM "BotProvider";
DROP TABLE "BotProvider";
ALTER TABLE "new_BotProvider" RENAME TO "BotProvider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
