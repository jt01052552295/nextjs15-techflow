import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 랜덤 도우미
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function seedShopItems() {
  const ITEM_NAMES = [
    '베이직 이용권',
    '프리미엄 이용권',
    '프로 패키지',
    '팀 플랜',
    '엔터프라이즈 플랜',
  ];

  for (let i = 0; i < 5; i++) {
    const itemName = ITEM_NAMES[i] ?? `테스트 상품 ${i + 1}`;

    const basicPrice = 10000 + i * 5000; // 10,000 ~
    const salePrice = basicPrice; // 할인 없는 기본값
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    // 옵션/추가상품 개수 (2~3개)
    const optionCount = randInt(2, 3);
    const supplyCount = randInt(2, 3);

    await prisma.shopItem.create({
      data: {
        shopId: 1,
        code: `ITEM-${String(i + 1).padStart(3, '0')}`, // ITEM-001, ITEM-002 ...
        categoryCode: '01', // 카테고리 고정 (ShopCategory.code = '01' 있어야 함)

        name: itemName,
        nameEn: `Test Item ${i + 1}`,
        desc1: '테스트용 상품입니다.',
        basicPrice,
        basicPriceDc: 0,
        salePrice,

        basicDesc: '이 상품은 관리자 페이지 테스트용으로 생성되었습니다.',
        etcDesc: null,

        useBasicPeople: 1,
        useAccount: 1,
        useMaxPeople: 10,
        useMaxSign: 100,
        useMaxUpload: 100,
        useDuration: 30,

        rSend: false,
        stock: 999,
        ymd: today,
        his: 'seed',

        isUse: true,
        isVisible: true,
        isNft: false,
        isSoldout: false,
        orderMinimumCnt: 1,
        orderMaximumCnt: 10,
        sortOrder: i + 1,

        // ===== 옵션 생성 (2~3개) =====
        ShopItemOption: {
          create: Array.from({ length: optionCount }).map((_, idx) => ({
            gubun: 'default',
            parentId: 0,
            choiceType: 'select', // 단순 선택형
            name: `${itemName} 옵션 ${idx + 1}`,
            price: 1000 * (idx + 1), // 1,000 / 2,000 / 3,000 ...
            stock: 999,
            buyMin: 0,
            buyMax: 0,
            isUse: true,
            isVisible: true,
            isSoldout: false,
          })),
        },

        // ===== 추가상품 생성 (2~3개) =====
        ShopItemSupply: {
          create: Array.from({ length: supplyCount }).map((_, idx) => ({
            gubun: 'default',
            parentId: 0,
            choiceType: 'select',
            name: `${itemName} 추가상품 ${idx + 1}`,
            price: 2000 * (idx + 1), // 2,000 / 4,000 / 6,000 ...
            stock: 999,
            isUse: true,
            isVisible: true,
            isSoldout: false,
          })),
        },
      },
    });

    console.log(`✅ ShopItem 생성 완료: ${itemName}`);
  }
}

seedShopItems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
