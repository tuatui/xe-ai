-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `localBotsLen` INTEGER NOT NULL DEFAULT 0,
    `localTopicsLen` INTEGER NOT NULL DEFAULT 0,
    `localChatsLen` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `authorId` INTEGER NOT NULL,
    `updateTime` DATETIME(3) NOT NULL,
    `preferBotID` INTEGER NULL,
    `preferModelName` VARCHAR(191) NULL,

    INDEX `Topic_authorId_updateTime_idx`(`authorId`, `updateTime` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topicId` INTEGER NOT NULL,
    `authorId` INTEGER NULL,
    `context` MEDIUMTEXT NOT NULL,
    `from` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BotProvider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `localId` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `provider` INTEGER NOT NULL,
    `secretKey` VARCHAR(191) NOT NULL,
    `iv` VARCHAR(191) NOT NULL,
    `nickName` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `apiUrl` VARCHAR(191) NOT NULL,
    `createTime` DATETIME(3) NOT NULL,
    `prompt` TEXT NOT NULL,
    `primaryModel` VARCHAR(191) NULL,
    `memoCount` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `botProviderId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Topic` ADD CONSTRAINT `Topic_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BotProvider` ADD CONSTRAINT `BotProvider_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelList` ADD CONSTRAINT `ModelList_botProviderId_fkey` FOREIGN KEY (`botProviderId`) REFERENCES `BotProvider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
