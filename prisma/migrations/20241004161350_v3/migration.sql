/*
  Warnings:

  - Added the required column `localId` to the `BotProvider` table without a default value. This is not possible if the table is not empty.

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
    "nickName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    CONSTRAINT "BotProvider_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BotProvider" ("apiUrl", "id", "name", "nickName", "ownerId", "provider", "secretKey") SELECT "apiUrl", "id", "name", "nickName", "ownerId", "provider", "secretKey" FROM "BotProvider";
DROP TABLE "BotProvider";
ALTER TABLE "new_BotProvider" RENAME TO "BotProvider";
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    CONSTRAINT "Chat_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("context", "from", "id", "topicId") SELECT "context", "from", "id", "topicId" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE TABLE "new_ModelList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "botProviderId" INTEGER NOT NULL,
    CONSTRAINT "ModelList_botProviderId_fkey" FOREIGN KEY ("botProviderId") REFERENCES "BotProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ModelList" ("botProviderId", "id", "name", "owner") SELECT "botProviderId", "id", "name", "owner" FROM "ModelList";
DROP TABLE "ModelList";
ALTER TABLE "new_ModelList" RENAME TO "ModelList";
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "authorId" INTEGER NOT NULL,
    "upDateTime" DATETIME NOT NULL,
    CONSTRAINT "Topic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("authorId", "id", "title", "upDateTime") SELECT "authorId", "id", "title", "upDateTime" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
