-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "localBotsLen" INTEGER NOT NULL DEFAULT 0,
    "localTopicsLen" INTEGER NOT NULL DEFAULT 0,
    "localChatsLen" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "authorId" INTEGER NOT NULL,
    "updateTime" DATETIME NOT NULL,
    CONSTRAINT "Topic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    CONSTRAINT "Chat_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BotProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "provider" INTEGER NOT NULL,
    "secretKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "createTime" DATETIME NOT NULL,
    CONSTRAINT "BotProvider_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "botProviderId" INTEGER NOT NULL,
    CONSTRAINT "ModelList_botProviderId_fkey" FOREIGN KEY ("botProviderId") REFERENCES "BotProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
