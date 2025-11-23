import prisma from '@/lib/prisma';
import { IShopItem } from '@/types/shop/item';
import { IShopOrder } from '@/types/shop/order';

/**
 * 데이터베이스에서 모든 카테고리를 가져옵니다
 */
export async function getAllItems(): Promise<IShopItem[]> {
  return prisma.$queryRaw<IShopItem[]>`
    SELECT *
    FROM \`ec_shop_item\`
    WHERE \`is_use\` = 1 AND \`is_visible\` = 1
    ORDER BY \`idx\` DESC
  `;
}

/**
 * 데이터베이스에서 모든 카테고리를 가져옵니다
 */
export async function getAllOrders(): Promise<IShopOrder[]> {
  return prisma.$queryRaw<IShopOrder[]>`
    SELECT *, \`ord_no\` AS \`ordNo\`
    FROM \`ec_shop_order\`
    WHERE \`is_use\` = 1 AND \`is_visible\` = 1
    ORDER BY \`idx\` DESC
  `;
}
