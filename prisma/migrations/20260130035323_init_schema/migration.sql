-- CreateTable
CREATE TABLE `ec_user` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nick` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(10) NULL,
    `birth_date` VARCHAR(20) NULL,
    `bio` VARCHAR(160) NULL,
    `location` VARCHAR(30) NULL,
    `website` VARCHAR(100) NULL,
    `profile_image` VARCHAR(512) NULL,
    `banner_image` VARCHAR(512) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `zipcode` VARCHAR(191) NULL,
    `addr1` VARCHAR(191) NULL,
    `addr2` VARCHAR(191) NULL,
    `lat` VARCHAR(50) NULL,
    `lng` VARCHAR(50) NULL,
    `role` ENUM('ADMIN', 'EXTRA', 'COMPANY', 'USER') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `signUpVerified` DATETIME(3) NULL,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `is_signout` BOOLEAN NOT NULL DEFAULT false,
    `marketing_consent` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `provider` VARCHAR(50) NOT NULL DEFAULT 'email',
    `following_cnt` INTEGER NOT NULL DEFAULT 0,
    `follower_cnt` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_user_id_key`(`id`),
    UNIQUE INDEX `ec_user_username_key`(`username`),
    UNIQUE INDEX `ec_user_email_key`(`email`),
    UNIQUE INDEX `ec_user_phone_key`(`phone`),
    UNIQUE INDEX `ec_user_nick_key`(`nick`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_profile` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `ec_user_profile_uid_key`(`uid`),
    INDEX `userId_index`(`userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_payment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `customer_uid` VARCHAR(255) NOT NULL DEFAULT '',
    `billing_key` VARCHAR(255) NOT NULL DEFAULT '',
    `method` VARCHAR(255) NOT NULL DEFAULT 'card',
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `card_name` VARCHAR(255) NOT NULL DEFAULT '',
    `card_number1` VARCHAR(255) NOT NULL DEFAULT '',
    `card_number2` VARCHAR(255) NOT NULL DEFAULT '',
    `card_number3` VARCHAR(255) NOT NULL DEFAULT '',
    `card_number4` VARCHAR(255) NOT NULL DEFAULT '',
    `card_mm` VARCHAR(2) NOT NULL DEFAULT '',
    `card_yy` VARCHAR(4) NOT NULL DEFAULT '',
    `card_pwd` VARCHAR(255) NOT NULL DEFAULT '',
    `card_cvc` VARCHAR(255) NOT NULL DEFAULT '',
    `juminOrCorp` VARCHAR(45) NOT NULL DEFAULT '',
    `is_represent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_user_payment_uid_key`(`uid`),
    INDEX `ec_user_payment_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_address` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(50) NOT NULL DEFAULT '',
    `name` VARCHAR(50) NOT NULL DEFAULT '',
    `zipcode` VARCHAR(10) NOT NULL DEFAULT '',
    `addr1` VARCHAR(255) NOT NULL DEFAULT '',
    `addr2` VARCHAR(255) NOT NULL DEFAULT '',
    `addr_jibeon` VARCHAR(255) NOT NULL DEFAULT '',
    `sido` VARCHAR(255) NOT NULL DEFAULT '',
    `gugun` VARCHAR(255) NOT NULL DEFAULT '',
    `dong` VARCHAR(255) NOT NULL DEFAULT '',
    `lat_num` VARCHAR(255) NULL,
    `lng_num` VARCHAR(255) NULL,
    `hp` VARCHAR(20) NOT NULL DEFAULT '',
    `tel` VARCHAR(20) NOT NULL DEFAULT '',
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `rmemo` ENUM('CALL_BEFORE', 'DOOR_FRONT', 'SECURITY', 'DELIVERY_BOX', 'CUSTOM') NOT NULL DEFAULT 'CALL_BEFORE',
    `rmemo_txt` VARCHAR(255) NULL,
    `door_pwd` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_user_address_uid_key`(`uid`),
    INDEX `ec_user_address_user_id_idx`(`user_id`),
    INDEX `ec_user_address_is_default_idx`(`is_default`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_config` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `is_protected` BOOLEAN NOT NULL DEFAULT false,
    `allow_tagging` BOOLEAN NOT NULL DEFAULT true,
    `allow_dm` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_all` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_mention` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_reply` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_like` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_retweet` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_follow` BOOLEAN NOT NULL DEFAULT true,
    `noti_push_dm` BOOLEAN NOT NULL DEFAULT true,
    `noti_email_all` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_user_config_user_id_key`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_company` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `cust_no` VARCHAR(191) NULL,
    `biz_no` VARCHAR(191) NULL,
    `corp_no` VARCHAR(191) NULL,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_company_uid_key`(`uid`),
    INDEX `ec_company_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_partner` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_partner_uid_key`(`uid`),
    INDEX `ec_partner_userId_idx`(`userId`),
    INDEX `ec_partner_partnerId_idx`(`partnerId`),
    UNIQUE INDEX `ec_partner_userId_partnerId_key`(`userId`, `partnerId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_account` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `oauth_token_secret` VARCHAR(191) NULL,
    `oauth_token` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ec_user_account_user_id_idx`(`user_id`),
    UNIQUE INDEX `ec_user_account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_session` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionToken` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ec_user_session_sessionToken_key`(`sessionToken`),
    INDEX `ec_user_session_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_verification` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `purpose` ENUM('SIGNUP', 'LOGIN', 'FIND_ACCOUNT', 'PASSWORD_RESET', 'WITHDRAW', 'OTHER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_settings` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(191) NULL DEFAULT '',
    `kepcoContract` VARCHAR(191) NULL DEFAULT '',
    `kw` INTEGER NOT NULL DEFAULT 0,
    `powerFactor` INTEGER NOT NULL DEFAULT 0,
    `readingDate` INTEGER NOT NULL DEFAULT 0,
    `efficiency` DOUBLE NOT NULL DEFAULT 0,
    `pushPoint` BOOLEAN NOT NULL DEFAULT true,
    `pushBill` BOOLEAN NOT NULL DEFAULT true,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `skin` VARCHAR(191) NOT NULL DEFAULT 'basic',
    `kepcoApi` BOOLEAN NOT NULL DEFAULT false,
    `kepcoMonthApi` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `ec_settings_uid_key`(`uid`),
    UNIQUE INDEX `ec_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_electric_device` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `company_ip` VARCHAR(45) NOT NULL,
    `iot_num` VARCHAR(100) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `manuDate` VARCHAR(191) NOT NULL DEFAULT '',
    `deviceType` VARCHAR(10) NULL DEFAULT '',
    `desc` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `is_cron` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_electric_device_uid_key`(`uid`),
    UNIQUE INDEX `ec_electric_device_iot_num_key`(`iot_num`),
    INDEX `ec_electric_device_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_electric_device_files` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `ec_electric_device_files_uid_key`(`uid`),
    INDEX `deviceId_index`(`deviceId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_green_card` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `customer_uid` VARCHAR(191) NULL DEFAULT '',
    `billing_key` VARCHAR(191) NULL DEFAULT '',
    `name` VARCHAR(191) NULL DEFAULT '',
    `card_name` VARCHAR(191) NULL DEFAULT '',
    `card_number1` VARCHAR(191) NULL DEFAULT '',
    `card_number2` VARCHAR(191) NULL DEFAULT '',
    `card_number3` VARCHAR(191) NULL DEFAULT '',
    `card_number4` VARCHAR(191) NULL DEFAULT '',
    `card_mm` VARCHAR(191) NULL DEFAULT '',
    `card_yy` VARCHAR(191) NULL DEFAULT '',
    `card_pwd` VARCHAR(191) NULL DEFAULT '',
    `card_cvc` VARCHAR(191) NULL DEFAULT '',
    `juminOrCorp` VARCHAR(191) NULL DEFAULT '',
    `represent` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_green_card_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_carbon_point` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `point` INTEGER NULL DEFAULT 0,
    `use_point` INTEGER NULL DEFAULT 0,
    `mb_point` INTEGER NULL DEFAULT 0,
    `status` VARCHAR(191) NULL DEFAULT '',
    `expired` INTEGER NULL DEFAULT 0,
    `expired_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `is_use` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_carbon_point_uid_key`(`uid`),
    INDEX `ec_carbon_point_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_todos` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(255) NULL,
    `img1` VARCHAR(255) NULL,
    `ip_address` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `content` LONGTEXT NULL,
    `content2` LONGTEXT NULL,
    `password` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_todos_uid_key`(`uid`),
    INDEX `uid_index`(`uid`),
    INDEX `cid_index`(`cid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_todosComments` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `todoId` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `content2` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `parentIdx` INTEGER NULL,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `replyCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_todosComments_uid_key`(`uid`),
    INDEX `todoId_index`(`todoId`),
    INDEX `ec_todosComments_todoId_parentIdx_createdAt_idx`(`todoId`, `parentIdx`, `createdAt`),
    INDEX `ec_todosComments_todoId_parentIdx_likeCount_createdAt_idx`(`todoId`, `parentIdx`, `likeCount`, `createdAt`),
    INDEX `ec_todosComments_todoId_parentIdx_replyCount_createdAt_idx`(`todoId`, `parentIdx`, `replyCount`, `createdAt`),
    INDEX `author_index`(`author`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_todosCommentLikes` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `commentId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ec_todosCommentLikes_commentId_idx`(`commentId`),
    UNIQUE INDEX `ec_todosCommentLikes_commentId_userId_key`(`commentId`, `userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_todosFiles` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `todoId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `ext` VARCHAR(10) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ec_todosFiles_uid_key`(`uid`),
    INDEX `todoId_index`(`todoId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_todosOptions` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `todoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ec_todosOptions_uid_key`(`uid`),
    INDEX `todoId_index`(`todoId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_popup` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `content` LONGTEXT NULL,
    `posX` INTEGER NOT NULL DEFAULT 0,
    `posY` INTEGER NOT NULL DEFAULT 0,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_popup_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_banner` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(191) NOT NULL DEFAULT '',
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `url` VARCHAR(191) NOT NULL DEFAULT '',
    `deviceType` VARCHAR(191) NOT NULL DEFAULT 'all',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_banner_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_banner_files` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `bannerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `ext` VARCHAR(10) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ec_banner_files_uid_key`(`uid`),
    INDEX `bannerId_index`(`bannerId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_config` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `CNFname` VARCHAR(255) NOT NULL,
    `CNFvalue` LONGTEXT NULL,
    `CNFvalue_en` LONGTEXT NULL,
    `CNFvalue_ja` LONGTEXT NULL,
    `CNFvalue_zh` LONGTEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_config_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_setup` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `sns_facebook` VARCHAR(255) NULL,
    `sns_twitter` VARCHAR(255) NULL,
    `sns_instagram` VARCHAR(255) NULL,
    `sns_youtube` VARCHAR(255) NULL,
    `sns_linkedin` VARCHAR(255) NULL,
    `sns_kakao` VARCHAR(255) NULL,
    `sns_naver` VARCHAR(255) NULL,
    `id_filter` MEDIUMTEXT NULL,
    `word_filter` MEDIUMTEXT NULL,
    `possible_ip` MEDIUMTEXT NULL,
    `intercept_ip` MEDIUMTEXT NULL,
    `aos_version` VARCHAR(45) NULL,
    `aos_update` VARCHAR(45) NULL,
    `aos_store_app` VARCHAR(255) NULL,
    `aos_store_web` VARCHAR(255) NULL,
    `ios_version` VARCHAR(45) NULL,
    `ios_update` VARCHAR(45) NULL,
    `ios_store_app` VARCHAR(255) NULL,
    `ios_store_web` VARCHAR(255) NULL,
    `js_css_ver` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_setup_uid_key`(`uid`),
    INDEX `ec_setup_is_default_idx`(`is_default`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_agent_log` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `browser` VARCHAR(191) NOT NULL,
    `browserVersion` VARCHAR(191) NOT NULL,
    `os` VARCHAR(191) NOT NULL,
    `osVersion` VARCHAR(191) NOT NULL,
    `device` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `referer` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `isMobile` BOOLEAN NOT NULL,
    `isTablet` BOOLEAN NOT NULL,
    `isDesktop` BOOLEAN NOT NULL,
    `isRobot` BOOLEAN NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_agent_log_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_management` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(255) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `value_en` VARCHAR(255) NULL,
    `value_ja` VARCHAR(255) NULL,
    `value_zh` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_management_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_category` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `desc` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_category_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_electric_bill` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `bill` INTEGER NOT NULL DEFAULT 0,
    `kwh` INTEGER NOT NULL DEFAULT 0,
    `ym` VARCHAR(10) NOT NULL,
    `sdate` DATETIME(3) NULL,
    `edate` DATETIME(3) NULL,
    `bill_aply_pwr` INTEGER NOT NULL DEFAULT 0,
    `base_bill` DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
    `kwh_bill` DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
    `dc_bill` INTEGER NOT NULL DEFAULT 0,
    `req_bill` INTEGER NOT NULL DEFAULT 0,
    `req_amt` INTEGER NOT NULL DEFAULT 0,
    `lload_usekwh` INTEGER NOT NULL DEFAULT 0,
    `mload_usekwh` INTEGER NOT NULL DEFAULT 0,
    `maxload_usekwh` INTEGER NOT NULL DEFAULT 0,
    `lload_needle` INTEGER NOT NULL DEFAULT 0,
    `mload_needle` INTEGER NOT NULL DEFAULT 0,
    `maxload_needle` INTEGER NOT NULL DEFAULT 0,
    `jn_pwrfact` DECIMAL(17, 3) NOT NULL DEFAULT 0.000,
    `ji_pwrfact` DECIMAL(17, 3) NOT NULL DEFAULT 0.000,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_electric_bill_uid_key`(`uid`),
    INDEX `ec_electric_bill_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_electric_iot_data` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `data_date` DATETIME(3) NOT NULL,
    `data_time` DATETIME(3) NOT NULL,
    `company_ip` VARCHAR(45) NOT NULL,
    `iot_num` VARCHAR(100) NOT NULL,
    `l1_volt` FLOAT NULL DEFAULT 0,
    `l2_volt` FLOAT NULL DEFAULT 0,
    `l3_volt` FLOAT NULL DEFAULT 0,
    `l1_current` FLOAT NULL DEFAULT 0,
    `l2_current` FLOAT NULL DEFAULT 0,
    `l3_current` FLOAT NULL DEFAULT 0,
    `l1_active_power` FLOAT NULL DEFAULT 0,
    `l2_active_power` FLOAT NULL DEFAULT 0,
    `l3_active_power` FLOAT NULL DEFAULT 0,
    `l1_reactive_power` FLOAT NULL DEFAULT 0,
    `l2_reactive_power` FLOAT NULL DEFAULT 0,
    `l3_reactive_power` FLOAT NULL DEFAULT 0,
    `l1_apparent_power` FLOAT NULL DEFAULT 0,
    `l2_apparent_power` FLOAT NULL DEFAULT 0,
    `l3_apparent_power` FLOAT NULL DEFAULT 0,
    `l1_power_factor` FLOAT NULL DEFAULT 0,
    `l2_power_factor` FLOAT NULL DEFAULT 0,
    `l3_power_factor` FLOAT NULL DEFAULT 0,
    `l1_phase_angle` FLOAT NULL DEFAULT 0,
    `l2_phase_angle` FLOAT NULL DEFAULT 0,
    `l3_phase_angle` FLOAT NULL DEFAULT 0,
    `l1_l2_volt` FLOAT NULL DEFAULT 0,
    `l2_l3_volt` FLOAT NULL DEFAULT 0,
    `l3_l1_volt` FLOAT NULL DEFAULT 0,
    `supply_volt_freq` FLOAT NULL DEFAULT 0,
    `tot_active_power` FLOAT NULL DEFAULT 0,
    `tot_reactive_power` FLOAT NULL DEFAULT 0,
    `tot_apparent_power` FLOAT NULL DEFAULT 0,
    `tot_power_factor` FLOAT NULL DEFAULT 0,
    `tot_phase_angle` FLOAT NULL DEFAULT 0,
    `sum_current` FLOAT NULL DEFAULT 0,
    `avg_neutral_volt` FLOAT NULL DEFAULT 0,
    `avg_volt` FLOAT NULL DEFAULT 0,
    `avg_current` FLOAT NULL DEFAULT 0,
    `neutral_current` FLOAT NULL DEFAULT 0,
    `tot_import_active` FLOAT NULL DEFAULT 0,
    `tot_export_active` FLOAT NULL DEFAULT 0,
    `tot_active` FLOAT NULL DEFAULT 0,
    `tot_import_reactive` FLOAT NULL DEFAULT 0,
    `tot_export_reactive` FLOAT NULL DEFAULT 0,
    `tot_reactive` FLOAT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` VARCHAR(1) NOT NULL DEFAULT 'y',
    `is_visible` VARCHAR(1) NOT NULL DEFAULT 'y',

    INDEX `data_date`(`data_date`),
    INDEX `data_time`(`data_time`),
    INDEX `iot_num`(`iot_num`),
    INDEX `idx_iot_datetime`(`iot_num`, `data_date`, `data_time`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_electric_statistics` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(255) NOT NULL,
    `iot_num` VARCHAR(255) NOT NULL,
    `min_date` DATETIME(3) NULL,
    `max_date` DATETIME(3) NULL,
    `disp_date` DATETIME(3) NULL,
    `power` DECIMAL(13, 2) NOT NULL DEFAULT 0.00,
    `manual` VARCHAR(45) NULL DEFAULT 'auto',

    INDEX `idx_user_iotnum_dispdate`(`user_id`, `iot_num`, `disp_date`),
    INDEX `idx_dispdate`(`disp_date`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_kepco_statistics` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(255) NOT NULL,
    `disp_date` DATETIME(3) NULL,
    `kepco_power` DECIMAL(13, 2) NOT NULL DEFAULT 0.00,

    INDEX `idx_kepco_user_dispdate`(`user_id`, `disp_date`),
    INDEX `idx_kepco_dispdate`(`disp_date`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_board` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `bd_table` VARCHAR(20) NOT NULL,
    `bd_name` VARCHAR(255) NOT NULL DEFAULT '',
    `bd_name_en` VARCHAR(255) NOT NULL DEFAULT '',
    `bd_name_ja` VARCHAR(255) NOT NULL DEFAULT '',
    `bd_name_zh` VARCHAR(255) NOT NULL DEFAULT '',
    `bd_skin` VARCHAR(255) NOT NULL DEFAULT '',
    `bd_list_size` TINYINT NOT NULL DEFAULT 0,
    `bd_file_count` TINYINT NOT NULL DEFAULT 0,
    `bd_new_time` TINYINT NOT NULL DEFAULT 0,
    `bd_secret` BOOLEAN NOT NULL DEFAULT false,
    `bd_private` BOOLEAN NOT NULL DEFAULT false,
    `bd_business` BOOLEAN NOT NULL DEFAULT false,
    `bd_use_category` BOOLEAN NOT NULL DEFAULT false,
    `bd_category_list` TEXT NULL,
    `bd_fix_title` VARCHAR(255) NOT NULL DEFAULT '',
    `bd_list_level` TINYINT NOT NULL DEFAULT 0,
    `bd_read_level` TINYINT NOT NULL DEFAULT 0,
    `bd_write_level` TINYINT NOT NULL DEFAULT 0,
    `bd_reply_level` TINYINT NOT NULL DEFAULT 0,
    `bd_comment_level` TINYINT NOT NULL DEFAULT 0,
    `bd_upload_level` TINYINT NOT NULL DEFAULT 0,
    `bd_download_level` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_board_uid_key`(`uid`),
    UNIQUE INDEX `ec_board_bd_table_key`(`bd_table`),
    INDEX `uid_index`(`uid`),
    INDEX `cid_index`(`cid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_bbs` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `bd_table` VARCHAR(20) NOT NULL DEFAULT '',
    `user_id` VARCHAR(255) NULL,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `notice` BOOLEAN NOT NULL DEFAULT false,
    `secret` BOOLEAN NOT NULL DEFAULT false,
    `category` VARCHAR(255) NOT NULL DEFAULT '',
    `subject` VARCHAR(255) NOT NULL DEFAULT '',
    `content` LONGTEXT NULL,
    `content_a` LONGTEXT NULL,
    `ip_address` VARCHAR(255) NULL,
    `hit` INTEGER NOT NULL DEFAULT 0,
    `good` INTEGER NOT NULL DEFAULT 0,
    `bad` INTEGER NOT NULL DEFAULT 0,
    `comment` INTEGER NOT NULL DEFAULT 0,
    `thread` VARCHAR(10) NOT NULL DEFAULT '',
    `comment_cnt` INTEGER NOT NULL DEFAULT 0,
    `thread_cnt` INTEGER NOT NULL DEFAULT 0,
    `link_1` VARCHAR(255) NOT NULL DEFAULT '',
    `link_2` VARCHAR(255) NOT NULL DEFAULT '',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_bbs_uid_key`(`uid`),
    INDEX `uid_index`(`uid`),
    INDEX `cid_index`(`cid`),
    INDEX `userId_index`(`user_id`),
    INDEX `bdTable_index`(`bd_table`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_bbs_like` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `bd_table` VARCHAR(20) NOT NULL DEFAULT '',
    `parentIdx` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `parentIdx_index`(`parentIdx`),
    INDEX `userId_index`(`userId`),
    UNIQUE INDEX `ec_bbs_like_parentIdx_userId_key`(`parentIdx`, `userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_bbs_comment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `bd_table` VARCHAR(20) NOT NULL DEFAULT '',
    `pid` VARCHAR(191) NOT NULL,
    `author` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `parentIdx` INTEGER NULL,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `replyCount` INTEGER NOT NULL DEFAULT 0,
    `isUser` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_bbs_comment_uid_key`(`uid`),
    INDEX `bbsId_index`(`pid`),
    INDEX `bdTable_index`(`bd_table`),
    INDEX `parentIdx_index`(`parentIdx`),
    INDEX `author_index`(`author`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_bbs_comment_like` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `bd_table` VARCHAR(20) NOT NULL DEFAULT '',
    `parentIdx` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `parentIdx_index`(`parentIdx`),
    INDEX `userId_index`(`userId`),
    UNIQUE INDEX `ec_bbs_comment_like_parentIdx_userId_key`(`parentIdx`, `userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_bbs_file` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `bd_table` VARCHAR(20) NOT NULL DEFAULT '',
    `pid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `ext` VARCHAR(10) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ec_bbs_file_uid_key`(`uid`),
    INDEX `pid_index`(`pid`),
    INDEX `bdTable_index`(`bd_table`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_report` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `reporterId` INTEGER NULL,
    `targetAuthorId` INTEGER NULL,
    `targetType` ENUM('BBS', 'BBS_COMMENT') NOT NULL,
    `targetId` INTEGER NOT NULL,
    `reason` ENUM('SPAM', 'ABUSE', 'HARASSMENT', 'COPYRIGHT', 'ILLEGAL_CONTENT', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `comment` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ec_report_uid_key`(`uid`),
    INDEX `ec_report_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `ec_report_targetAuthorId_idx`(`targetAuthorId`),
    INDEX `ec_report_reporterId_idx`(`reporterId`),
    INDEX `ec_report_status_idx`(`status`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_fcm_tokens` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(512) NOT NULL,
    `platform` ENUM('android', 'ios', 'web') NOT NULL DEFAULT 'android',
    `device_id` VARCHAR(128) NULL,
    `app_version` VARCHAR(32) NULL,
    `device_info` TEXT NULL,
    `badge_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_fcm_tokens_uid_key`(`uid`),
    UNIQUE INDEX `ec_fcm_tokens_token_key`(`token`),
    INDEX `ec_fcm_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_fcm_templates` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `activity` VARCHAR(45) NOT NULL,
    `title` VARCHAR(255) NULL,
    `body` TEXT NULL,
    `message` TEXT NULL,
    `title_en` VARCHAR(255) NULL,
    `body_en` TEXT NULL,
    `message_en` TEXT NULL,
    `target_link` VARCHAR(500) NOT NULL DEFAULT '',
    `web_target_link` VARCHAR(500) NOT NULL DEFAULT '',
    `img1` VARCHAR(255) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_fcm_templates_uid_key`(`uid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_fcm_message` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(255) NOT NULL DEFAULT 'app',
    `template` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `fcm_token` VARCHAR(255) NULL,
    `ot_code` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `body` VARCHAR(255) NULL,
    `url` VARCHAR(500) NULL,
    `res` LONGTEXT NULL,
    `res_status` VARCHAR(45) NULL,
    `res_msg` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_fcm_message_uid_key`(`uid`),
    INDEX `ec_fcm_message_user_id_idx`(`user_id`),
    INDEX `ec_fcm_message_template_idx`(`template`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_fcm_alarm` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `template` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `url` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_fcm_alarm_uid_key`(`uid`),
    INDEX `ec_fcm_alarm_user_id_idx`(`user_id`),
    INDEX `ec_fcm_alarm_template_idx`(`template`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_badge_master` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `bm_type` VARCHAR(20) NOT NULL,
    `bm_category` VARCHAR(100) NOT NULL,
    `bm_level` VARCHAR(20) NOT NULL,
    `bm_threshold` INTEGER NOT NULL,
    `bm_name` VARCHAR(100) NOT NULL,
    `img1` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_badge_master_uid_key`(`uid`),
    INDEX `ec_badge_master_bm_type_idx`(`bm_type`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_badge` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `badge_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ec_user_badge_user_id_idx`(`user_id`),
    INDEX `ec_user_badge_badge_id_idx`(`badge_id`),
    UNIQUE INDEX `ec_user_badge_user_id_badge_id_key`(`user_id`, `badge_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_follow` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_idx` INTEGER NOT NULL,
    `following_idx` INTEGER NOT NULL,
    `follow_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('W', 'Y', 'N') NOT NULL DEFAULT 'W',
    `confirm_date` DATETIME(3) NULL,

    INDEX `ec_user_follow_follower_idx_idx`(`follower_idx`),
    INDEX `ec_user_follow_following_idx_idx`(`following_idx`),
    INDEX `ec_user_follow_status_idx`(`status`),
    UNIQUE INDEX `ec_user_follow_follower_idx_following_idx_key`(`follower_idx`, `following_idx`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_block` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `blocker_idx` INTEGER NOT NULL,
    `blocked_idx` INTEGER NOT NULL,
    `block_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ec_user_block_blocker_idx_idx`(`blocker_idx`),
    INDEX `ec_user_block_blocked_idx_idx`(`blocked_idx`),
    UNIQUE INDEX `ec_user_block_blocker_idx_blocked_idx_key`(`blocker_idx`, `blocked_idx`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_user_mute` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `muter_idx` INTEGER NOT NULL,
    `muted_idx` INTEGER NOT NULL,
    `mute_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ec_user_mute_muter_idx_idx`(`muter_idx`),
    INDEX `ec_user_mute_muted_idx_idx`(`muted_idx`),
    UNIQUE INDEX `ec_user_mute_muter_idx_muted_idx_key`(`muter_idx`, `muted_idx`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_point` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `point` INTEGER NOT NULL DEFAULT 0,
    `use_point` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(45) NOT NULL DEFAULT '',
    `expired` BOOLEAN NOT NULL DEFAULT false,
    `expired_at` DATETIME(3) NULL,
    `ot_gubun` VARCHAR(45) NOT NULL DEFAULT '',
    `ot_code` VARCHAR(255) NOT NULL DEFAULT '',
    `message` VARCHAR(255) NOT NULL DEFAULT '',

    INDEX `idx_user_id`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_category` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `desc` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_shop_category_uid_key`(`uid`),
    UNIQUE INDEX `ec_shop_category_code_key`(`code`),
    INDEX `code_index`(`code`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_item` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `shop` INTEGER NOT NULL DEFAULT 0,
    `code` VARCHAR(255) NOT NULL DEFAULT '',
    `category_code` VARCHAR(45) NOT NULL DEFAULT '',
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `name_en` VARCHAR(255) NOT NULL DEFAULT '',
    `desc1` VARCHAR(255) NOT NULL DEFAULT '',
    `basic_price` INTEGER NOT NULL DEFAULT 0,
    `basic_price_dc` INTEGER NOT NULL DEFAULT 0,
    `sale_price` INTEGER NOT NULL DEFAULT 0,
    `basic_desc` LONGTEXT NULL,
    `etc_desc` MEDIUMTEXT NULL,
    `use_basic_people` INTEGER NOT NULL DEFAULT 0,
    `use_account` INTEGER NOT NULL DEFAULT 0,
    `use_max_people` INTEGER NOT NULL DEFAULT 0,
    `use_max_sign` INTEGER NOT NULL DEFAULT 0,
    `use_max_upload` INTEGER NOT NULL DEFAULT 0,
    `use_duration` INTEGER NOT NULL DEFAULT 0,
    `is_send` BOOLEAN NOT NULL DEFAULT false,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `ymd` VARCHAR(255) NOT NULL DEFAULT '',
    `his` VARCHAR(255) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `is_nft` BOOLEAN NOT NULL DEFAULT true,
    `soldout` BOOLEAN NOT NULL DEFAULT false,
    `order_minimum_cnt` INTEGER NOT NULL DEFAULT 0,
    `order_maximum_cnt` INTEGER NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_shop_item_uid_key`(`uid`),
    INDEX `ec_shop_item_category_code_idx`(`category_code`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_item_files` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `pid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `ext` VARCHAR(10) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ec_shop_item_files_uid_key`(`uid`),
    INDEX `pid_index`(`pid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_item_option` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `pid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(45) NOT NULL DEFAULT '',
    `parentId` INTEGER NOT NULL DEFAULT 0,
    `choice_type` VARCHAR(255) NOT NULL DEFAULT '',
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `price` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `buy_min` INTEGER NOT NULL DEFAULT 0,
    `buy_max` INTEGER NOT NULL DEFAULT 0,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `soldout` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_item_option_uid_key`(`uid`),
    INDEX `pid_index`(`pid`),
    INDEX `ec_shop_item_option_parentId_idx`(`parentId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_item_supply` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `pid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(45) NOT NULL DEFAULT '',
    `parentId` INTEGER NOT NULL DEFAULT 0,
    `choice_type` VARCHAR(255) NOT NULL DEFAULT '',
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `price` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `soldout` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_item_supply_uid_key`(`uid`),
    INDEX `pid_index`(`pid`),
    INDEX `ec_shop_item_supply_parentId_idx`(`parentId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_cart` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(45) NOT NULL DEFAULT '',
    `is_direct` BOOLEAN NOT NULL DEFAULT false,
    `shop` INTEGER NOT NULL DEFAULT 0,
    `seller` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NOT NULL,
    `item` INTEGER NOT NULL,
    `cnt` INTEGER NOT NULL DEFAULT 0,
    `sale_price` INTEGER NOT NULL DEFAULT 0,
    `option_price` INTEGER NOT NULL DEFAULT 0,
    `supply_price` INTEGER NOT NULL DEFAULT 0,
    `total_price` INTEGER NOT NULL DEFAULT 0,
    `cart_no` VARCHAR(255) NOT NULL DEFAULT '',
    `ord_no` VARCHAR(255) NULL,
    `ip` VARCHAR(45) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_cart_uid_key`(`uid`),
    INDEX `ec_shop_cart_user_id_idx`(`user_id`),
    INDEX `ec_shop_cart_item_idx`(`item`),
    INDEX `ec_shop_cart_cart_no_idx`(`cart_no`),
    INDEX `ec_shop_cart_ord_no_idx`(`ord_no`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_cart_option` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cart` INTEGER NOT NULL,
    `option` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `price` INTEGER NOT NULL DEFAULT 0,
    `cnt` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_cart_option_uid_key`(`uid`),
    INDEX `ec_shop_cart_option_cart_idx`(`cart`),
    INDEX `ec_shop_cart_option_option_idx`(`option`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_cart_supply` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cart` INTEGER NOT NULL,
    `supply` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `price` INTEGER NOT NULL DEFAULT 0,
    `cnt` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_cart_supply_uid_key`(`uid`),
    INDEX `ec_shop_cart_supply_cart_idx`(`cart`),
    INDEX `ec_shop_cart_supply_supply_idx`(`supply`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_order` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `ord_no` VARCHAR(255) NOT NULL,
    `shop` INTEGER NOT NULL DEFAULT 0,
    `seller_id` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NULL,
    `user` INTEGER NOT NULL DEFAULT 0,
    `gubun` VARCHAR(45) NOT NULL DEFAULT '',
    `basic_price` INTEGER NOT NULL DEFAULT 0,
    `option_price` INTEGER NOT NULL DEFAULT 0,
    `delivery_price` INTEGER NOT NULL DEFAULT 0,
    `box_dc` INTEGER NOT NULL DEFAULT 0,
    `pay_price` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `memo` MEDIUMTEXT NULL,
    `order_paid` VARCHAR(255) NOT NULL DEFAULT '',
    `order_status` VARCHAR(255) NOT NULL DEFAULT '',
    `cancel_status` VARCHAR(255) NOT NULL DEFAULT '',
    `cancel_requested_by` VARCHAR(45) NOT NULL DEFAULT '',
    `cancel_requested_at` DATETIME(3) NULL,
    `cancel_reason_code` VARCHAR(45) NOT NULL DEFAULT '',
    `cancel_reason_text` VARCHAR(500) NULL,
    `cancel_rejected_reason_text` VARCHAR(500) NULL,
    `paymethod` VARCHAR(45) NOT NULL DEFAULT '',
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `hp` VARCHAR(45) NOT NULL DEFAULT '',
    `zipcode` VARCHAR(45) NOT NULL DEFAULT '',
    `jibunAddr1` VARCHAR(255) NOT NULL DEFAULT '',
    `jibunAddr2` VARCHAR(255) NOT NULL DEFAULT '',
    `roadAddr1` VARCHAR(255) NOT NULL DEFAULT '',
    `roadAddr2` VARCHAR(255) NOT NULL DEFAULT '',
    `rcv_store` VARCHAR(255) NOT NULL DEFAULT '',
    `rcv_name` VARCHAR(255) NOT NULL DEFAULT '',
    `rcv_hp` VARCHAR(45) NOT NULL DEFAULT '',
    `rcv_email` VARCHAR(255) NOT NULL DEFAULT '',
    `rcv_date` DATETIME(3) NULL,
    `rcv_addr1` VARCHAR(255) NOT NULL DEFAULT '',
    `rcv_addr2` VARCHAR(255) NOT NULL DEFAULT '',
    `rcv_zipcode` VARCHAR(255) NOT NULL DEFAULT '',
    `bank_account` INTEGER NOT NULL DEFAULT 0,
    `bank_deposit_name` VARCHAR(255) NOT NULL DEFAULT '',
    `pay_email` VARCHAR(100) NOT NULL DEFAULT '',
    `pay_represent` INTEGER NOT NULL DEFAULT 0,
    `pay_day` VARCHAR(45) NOT NULL DEFAULT '',
    `pay_year` BOOLEAN NOT NULL DEFAULT false,
    `pay_people` INTEGER NOT NULL DEFAULT 0,
    `ip` VARCHAR(45) NOT NULL DEFAULT '',
    `merchantData` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_shop_order_uid_key`(`uid`),
    INDEX `ec_shop_order_user_id_idx`(`user_id`),
    INDEX `ec_shop_order_ord_no_idx`(`ord_no`),
    INDEX `ec_shop_order_order_status_idx`(`order_status`),
    INDEX `ec_shop_order_cancel_status_idx`(`cancel_status`),
    INDEX `ec_shop_order_order_paid_idx`(`order_paid`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_order_item` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `item` INTEGER NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `cnt` INTEGER NOT NULL DEFAULT 0,
    `sale_price` INTEGER NOT NULL DEFAULT 0,
    `option_price` INTEGER NOT NULL DEFAULT 0,
    `supply_price` INTEGER NOT NULL DEFAULT 0,
    `total_price` INTEGER NOT NULL DEFAULT 0,
    `cart_no` VARCHAR(255) NULL,
    `status_code` VARCHAR(45) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_order_item_uid_key`(`uid`),
    INDEX `ec_shop_order_item_order_idx`(`order`),
    INDEX `ec_shop_order_item_item_idx`(`item`),
    INDEX `ec_shop_order_item_cart_no_idx`(`cart_no`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_order_option` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `order_item` INTEGER NOT NULL,
    `option` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `price` INTEGER NOT NULL DEFAULT 0,
    `cnt` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_order_option_uid_key`(`uid`),
    INDEX `ec_shop_order_option_order_item_idx`(`order_item`),
    INDEX `ec_shop_order_option_option_idx`(`option`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_order_supply` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `order_item` INTEGER NOT NULL,
    `supply` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `price` INTEGER NOT NULL DEFAULT 0,
    `cnt` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_shop_order_supply_uid_key`(`uid`),
    INDEX `ec_shop_order_supply_order_item_idx`(`order_item`),
    INDEX `ec_shop_order_supply_supply_idx`(`supply`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_order_payment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `gubun` VARCHAR(45) NOT NULL DEFAULT 'shop',
    `apply_num` VARCHAR(255) NOT NULL DEFAULT '',
    `amount` INTEGER NOT NULL DEFAULT 0,
    `cancel_amount` INTEGER NOT NULL DEFAULT 0,
    `buyer_addr` VARCHAR(500) NOT NULL DEFAULT '',
    `buyer_email` VARCHAR(45) NOT NULL DEFAULT '',
    `buyer_name` VARCHAR(45) NOT NULL DEFAULT '',
    `buyer_postcode` VARCHAR(255) NOT NULL DEFAULT '',
    `buyer_tel` VARCHAR(255) NOT NULL DEFAULT '',
    `card_name` VARCHAR(255) NOT NULL DEFAULT '0',
    `card_number` VARCHAR(255) NOT NULL DEFAULT '0',
    `card_quota` INTEGER NOT NULL DEFAULT 0,
    `custom_data` MEDIUMTEXT NULL,
    `imp_uid` VARCHAR(255) NOT NULL DEFAULT '',
    `merchant_uid` VARCHAR(255) NOT NULL DEFAULT '',
    `name` VARCHAR(45) NOT NULL DEFAULT '',
    `paid_amount` INTEGER NOT NULL DEFAULT 0,
    `paid_at` INTEGER NOT NULL DEFAULT 0,
    `cancelled_at` INTEGER NOT NULL DEFAULT 0,
    `pay_method` VARCHAR(45) NOT NULL DEFAULT '',
    `pg_provider` VARCHAR(45) NOT NULL DEFAULT '',
    `pg_tid` VARCHAR(45) NOT NULL DEFAULT '',
    `pg_type` VARCHAR(45) NOT NULL DEFAULT '',
    `receipt_url` VARCHAR(255) NOT NULL DEFAULT '',
    `status` VARCHAR(45) NOT NULL DEFAULT '',
    `order_data` MEDIUMTEXT NULL,
    `device` VARCHAR(45) NOT NULL DEFAULT '',
    `shop` INTEGER NOT NULL DEFAULT 0,
    `seller` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_shop_order_payment_uid_key`(`uid`),
    INDEX `ec_shop_order_payment_order_idx`(`order`),
    INDEX `ec_shop_order_payment_merchant_uid_idx`(`merchant_uid`),
    INDEX `ec_shop_order_payment_imp_uid_idx`(`imp_uid`),
    INDEX `ec_shop_order_payment_status_idx`(`status`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_order_subscription` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(255) NOT NULL DEFAULT '',
    `ord_no` VARCHAR(255) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NULL,
    `user` INTEGER NOT NULL DEFAULT 0,
    `item` INTEGER NOT NULL DEFAULT 0,
    `shop` INTEGER NOT NULL DEFAULT 0,
    `gubun` VARCHAR(20) NOT NULL DEFAULT '',
    `pay_day` VARCHAR(45) NOT NULL DEFAULT '',
    `use_max_people` INTEGER NOT NULL DEFAULT 0,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `status` VARCHAR(45) NOT NULL DEFAULT '',
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `usage` INTEGER NOT NULL DEFAULT 0,
    `usage_quota` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_payment_id` INTEGER NULL,
    `next_payment_at` DATETIME(3) NULL,
    `last_payment_at` DATETIME(3) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `failed_at` DATETIME(3) NULL,

    UNIQUE INDEX `ec_shop_order_subscription_uid_key`(`uid`),
    INDEX `ec_shop_order_subscription_user_id_idx`(`user_id`),
    INDEX `ec_shop_order_subscription_order_idx`(`order`),
    INDEX `ec_shop_order_subscription_item_idx`(`item`),
    INDEX `ec_shop_order_subscription_ord_no_idx`(`ord_no`),
    INDEX `ec_shop_order_subscription_status_idx`(`status`),
    INDEX `ec_shop_order_subscription_user_payment_id_idx`(`user_payment_id`),
    INDEX `ec_shop_order_subscription_next_payment_at_idx`(`next_payment_at`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_portone_payment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(45) NOT NULL DEFAULT 'shop',
    `apply_num` VARCHAR(255) NOT NULL DEFAULT '',
    `amount` INTEGER NOT NULL DEFAULT 0,
    `cancel_amount` INTEGER NOT NULL DEFAULT 0,
    `buyer_addr` VARCHAR(500) NOT NULL DEFAULT '',
    `buyer_email` VARCHAR(45) NOT NULL DEFAULT '',
    `buyer_name` VARCHAR(45) NOT NULL DEFAULT '',
    `buyer_postcode` VARCHAR(255) NOT NULL DEFAULT '',
    `buyer_tel` VARCHAR(255) NOT NULL DEFAULT '',
    `card_name` VARCHAR(255) NOT NULL DEFAULT '0',
    `card_number` VARCHAR(255) NOT NULL DEFAULT '0',
    `card_quota` INTEGER NOT NULL DEFAULT 0,
    `custom_data` MEDIUMTEXT NULL,
    `imp_uid` VARCHAR(255) NOT NULL DEFAULT '',
    `merchant_uid` VARCHAR(255) NOT NULL DEFAULT '',
    `name` VARCHAR(45) NOT NULL DEFAULT '',
    `paid_amount` INTEGER NOT NULL DEFAULT 0,
    `paid_at` INTEGER NOT NULL DEFAULT 0,
    `cancelled_at` INTEGER NOT NULL DEFAULT 0,
    `pay_method` VARCHAR(45) NOT NULL DEFAULT '',
    `pg_provider` VARCHAR(45) NOT NULL DEFAULT '',
    `pg_tid` VARCHAR(45) NOT NULL DEFAULT '',
    `pg_type` VARCHAR(45) NOT NULL DEFAULT '',
    `receipt_url` VARCHAR(255) NOT NULL DEFAULT '',
    `status` VARCHAR(45) NOT NULL DEFAULT '',
    `order_data` MEDIUMTEXT NULL,
    `device` VARCHAR(45) NOT NULL DEFAULT '',
    `shop` INTEGER NOT NULL DEFAULT 0,
    `seller` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_portone_payment_uid_key`(`uid`),
    INDEX `ec_portone_payment_merchant_uid_idx`(`merchant_uid`),
    INDEX `ec_portone_payment_imp_uid_idx`(`imp_uid`),
    INDEX `ec_portone_payment_status_idx`(`status`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_portone_billing_payment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `gubun` VARCHAR(45) NOT NULL DEFAULT 'shop',
    `user` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT '',
    `id` VARCHAR(255) NOT NULL DEFAULT '',
    `transactionId` VARCHAR(255) NOT NULL DEFAULT '',
    `merchantId` VARCHAR(255) NOT NULL DEFAULT '',
    `storeId` VARCHAR(255) NOT NULL DEFAULT '',
    `customer_uid` VARCHAR(255) NOT NULL DEFAULT '',
    `billing_key` VARCHAR(255) NOT NULL DEFAULT '',
    `card_name` VARCHAR(255) NOT NULL DEFAULT '0',
    `card_number` VARCHAR(255) NOT NULL DEFAULT '0',
    `order_data` MEDIUMTEXT NULL,
    `orderName` VARCHAR(255) NOT NULL DEFAULT '',
    `amount` INTEGER NOT NULL DEFAULT 0,
    `cancel_amount` INTEGER NOT NULL DEFAULT 0,
    `products_id` VARCHAR(255) NOT NULL DEFAULT '',
    `products_name` VARCHAR(255) NOT NULL DEFAULT '',
    `products_amount` INTEGER NOT NULL DEFAULT 0,
    `products_quantity` INTEGER NOT NULL DEFAULT 0,
    `pgTxId` VARCHAR(255) NOT NULL,
    `pgResponse` MEDIUMTEXT NULL,
    `webhook` LONGTEXT NULL,
    `receiptUrl` VARCHAR(500) NOT NULL DEFAULT '',
    `paid_amount` INTEGER NOT NULL DEFAULT 0,
    `paid_at` DATETIME(3) NULL,
    `cancel_reason` VARCHAR(255) NOT NULL DEFAULT '',
    `cancel_input` VARCHAR(255) NOT NULL DEFAULT '',
    `cancelled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `device` VARCHAR(255) NOT NULL DEFAULT '',
    `shop` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ec_portone_billing_payment_uid_key`(`uid`),
    INDEX `ec_portone_billing_payment_user_idx`(`user`),
    INDEX `ec_portone_billing_payment_user_id_idx`(`user_id`),
    INDEX `ec_portone_billing_payment_status_idx`(`status`),
    INDEX `ec_portone_billing_payment_merchantId_idx`(`merchantId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_portone_schedule_payment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `order` INTEGER NULL DEFAULT 0,
    `payment_id` VARCHAR(255) NOT NULL DEFAULT '',
    `schedule_id` VARCHAR(255) NOT NULL DEFAULT '',
    `param` MEDIUMTEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reserv_date` DATETIME(3) NULL,
    `payment` BOOLEAN NOT NULL DEFAULT false,
    `is_use` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_portone_schedule_payment_uid_key`(`uid`),
    INDEX `ec_portone_schedule_payment_order_idx`(`order`),
    INDEX `ec_portone_schedule_payment_schedule_id_idx`(`schedule_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_shop_review` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `order` INTEGER NULL DEFAULT 0,
    `item` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NULL,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NOT NULL DEFAULT '',
    `content` LONGTEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `score` INTEGER NOT NULL DEFAULT 0,
    `hit` INTEGER NOT NULL DEFAULT 0,
    `good` INTEGER NOT NULL DEFAULT 0,
    `bad` INTEGER NOT NULL DEFAULT 0,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `secret` BOOLEAN NOT NULL DEFAULT false,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `ec_shop_review_uid_key`(`uid`),
    INDEX `ec_shop_review_order_idx`(`order`),
    INDEX `ec_shop_review_item_idx`(`item`),
    INDEX `ec_shop_review_user_id_idx`(`user_id`),
    INDEX `ec_shop_review_score_idx`(`score`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `lang` VARCHAR(191) NOT NULL DEFAULT 'ko',
    `content` LONGTEXT NOT NULL,
    `linkUrl` VARCHAR(255) NULL,
    `categoryCode` VARCHAR(191) NULL,
    `status` ENUM('TEMP', 'DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `visibility` ENUM('PUBLIC', 'MEMBERS', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `commentCount` INTEGER NOT NULL DEFAULT 0,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `scheduled_at` DATETIME(3) NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_post_uid_key`(`uid`),
    INDEX `uid_index`(`uid`),
    INDEX `cid_index`(`cid`),
    INDEX `userId_index`(`user_id`),
    INDEX `categoryCode_index`(`categoryCode`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_category` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `desc` VARCHAR(255) NULL,
    `depth` INTEGER NOT NULL DEFAULT 1,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ec_post_category_uid_key`(`uid`),
    UNIQUE INDEX `ec_post_category_code_key`(`code`),
    UNIQUE INDEX `ec_post_category_slug_key`(`slug`),
    INDEX `code_index`(`code`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_tag` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `desc` VARCHAR(255) NULL,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_post_tag_uid_key`(`uid`),
    UNIQUE INDEX `ec_post_tag_name_key`(`name`),
    UNIQUE INDEX `ec_post_tag_slug_key`(`slug`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_tag_map` (
    `postId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `tagId_index`(`tagId`),
    PRIMARY KEY (`postId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_image` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `ext` VARCHAR(10) NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `size` INTEGER NULL,
    `type` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_post_image_uid_key`(`uid`),
    INDEX `postId_index`(`postId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_comment` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `postId` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `author` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'HIDDEN', 'SPAM') NOT NULL DEFAULT 'APPROVED',
    `ipAddress` VARCHAR(45) NULL,
    `parentIdx` INTEGER NULL,
    `depth` INTEGER NOT NULL DEFAULT 1,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `replyCount` INTEGER NOT NULL DEFAULT 0,
    `is_use` BOOLEAN NOT NULL DEFAULT true,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_post_comment_uid_key`(`uid`),
    INDEX `postId_index`(`postId`),
    INDEX `parentIdx_index`(`parentIdx`),
    INDEX `userId_index`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_like` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `postId_index`(`postId`),
    INDEX `userId_index`(`userId`),
    UNIQUE INDEX `ec_post_like_postId_userId_key`(`postId`, `userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_post_comment_like` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `commentId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `commentId_index`(`commentId`),
    INDEX `userId_index`(`userId`),
    UNIQUE INDEX `ec_post_comment_like_commentId_userId_key`(`commentId`, `userId`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_coupon_campaign` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `service_type` ENUM('PRODUCT', 'CASH') NOT NULL DEFAULT 'PRODUCT',
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `gubun` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    `method` ENUM('ITEM', 'CATEGORY', 'ORDER', 'SHIPPING') NOT NULL,
    `scope` ENUM('ALL', 'CATEGORY', 'SELLER', 'PRODUCT') NOT NULL DEFAULT 'ALL',
    `target_json` LONGTEXT NULL,
    `member_rule` LONGTEXT NULL,
    `class` ENUM('available', 'download') NOT NULL DEFAULT 'available',
    `type1` ENUM('1', '2') NOT NULL DEFAULT '1',
    `sdate` DATETIME(3) NULL,
    `edate` DATETIME(3) NULL,
    `days` INTEGER NOT NULL DEFAULT 0,
    `type2` ENUM('1', '2') NOT NULL DEFAULT '1',
    `trunc_unit` INTEGER NOT NULL DEFAULT 0,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `store_price` DOUBLE NOT NULL DEFAULT 0,
    `minimum` DOUBLE NOT NULL DEFAULT 0,
    `maximum` DOUBLE NOT NULL DEFAULT 0,
    `cp_image1` VARCHAR(255) NOT NULL DEFAULT '',
    `cp_image2` VARCHAR(255) NOT NULL DEFAULT '',
    `cp_image3` VARCHAR(255) NOT NULL DEFAULT '',
    `cp_image4` VARCHAR(255) NOT NULL DEFAULT '',
    `cp_image5` VARCHAR(255) NOT NULL DEFAULT '',
    `show_yn` BOOLEAN NOT NULL DEFAULT true,
    `download_yn` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_coupon_campaign_uid_key`(`uid`),
    INDEX `ec_coupon_campaign_scope_idx`(`scope`),
    INDEX `ec_coupon_campaign_method_idx`(`method`),
    INDEX `ec_coupon_campaign_status_idx`(`status`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_coupon_code` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `campaign_idx` INTEGER NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `assigned_mt_idx` INTEGER NULL,
    `assigned_at` DATETIME(3) NULL,
    `used_ot_code` VARCHAR(255) NULL,
    `used_at` DATETIME(3) NULL,
    `state` ENUM('NEW', 'ASSIGNED', 'USED', 'EXPIRED') NOT NULL DEFAULT 'NEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_coupon_code_uid_key`(`uid`),
    UNIQUE INDEX `ec_coupon_code_code_key`(`code`),
    INDEX `ec_coupon_code_campaign_idx_idx`(`campaign_idx`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_coupon_member` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `campaign_idx` INTEGER NOT NULL,
    `mt_idx` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,
    `used_ot_code` VARCHAR(255) NULL,
    `used_at` DATETIME(3) NULL,
    `state` ENUM('ISSUED', 'USED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
    `code_idx` INTEGER NULL,

    UNIQUE INDEX `ec_coupon_member_uid_key`(`uid`),
    INDEX `ec_coupon_member_campaign_idx_idx`(`campaign_idx`),
    INDEX `ec_coupon_member_mt_idx_idx`(`mt_idx`),
    INDEX `ec_coupon_member_user_id_idx`(`user_id`),
    INDEX `ec_coupon_member_code_idx_idx`(`code_idx`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ec_coupon_use_log` (
    `idx` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `campaign_idx` INTEGER NOT NULL,
    `mt_idx` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `ot_code` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `usedSource` ENUM('AUTO', 'CODE', 'DOWNLOAD') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ec_coupon_use_log_uid_key`(`uid`),
    INDEX `ec_coupon_use_log_campaign_idx_idx`(`campaign_idx`),
    INDEX `ec_coupon_use_log_mt_idx_idx`(`mt_idx`),
    INDEX `ec_coupon_use_log_user_id_idx`(`user_id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
