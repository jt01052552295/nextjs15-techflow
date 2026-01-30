/*
  Warnings:

  - The values [MEMBERS] on the enum `ec_post_visibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `ec_post` MODIFY `visibility` ENUM('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC';
