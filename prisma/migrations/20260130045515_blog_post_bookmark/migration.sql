-- CreateTable
CREATE TABLE `ec_post_bookmark` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_post_bookmark_postId_userId_key`(`postId`, `userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
