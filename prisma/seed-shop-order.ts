import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 비회원 X, 아래 3명만 주문자로 사용
const USER_IDS = [
  '81cf6d86-72da-45ad-8440-2ea76ded67bb',
  'ab249162-a286-4c48-9778-c4b8747b4554',
  'ab84dabf-2029-469c-b2a6-03b421f492c1',
  'c7f6ee32-aa08-46db-b82d-b3a021a2eb8a',
  'c2d35ab7-27ea-4d00-925b-b4d7efe442ee',
];

async function main() {
  // 1. 회원 정보 미리 로딩
  const users = await prisma.user.findMany({
    where: {
      id: { in: USER_IDS },
    },
  });

  if (users.length === 0) {
    console.error(
      '❌ USER_IDS 에 해당하는 User 가 없습니다. 먼저 회원을 생성해 주세요.',
    );
    return;
  }

  if (users.length < USER_IDS.length) {
    console.warn(
      `⚠️ USER_IDS 중 일부는 찾지 못했습니다. 실제 존재하는 ${users.length}명만 사용합니다.`,
    );
  }

  // 2. 상품 + 옵션 + 추가상품까지 미리 로딩
  const items = await prisma.shopItem.findMany({
    include: {
      ShopItemOption: true,
      ShopItemSupply: true,
    },
  });

  if (items.length === 0) {
    console.log('❌ ShopItem 이 하나도 없습니다. 먼저 상품 시드를 넣어주세요.');
    return;
  }

  const ORDER_COUNT = 10;

  for (let i = 0; i < ORDER_COUNT; i++) {
    // 주문자: 3명 중 랜덤
    const user = rand(users);

    // 주문별 상품 개수 (1~3개)
    const orderItemCount = randInt(1, 3);

    let basicPriceSum = 0;
    let optionPriceSum = 0;
    const deliveryPrice = randInt(0, 5000); // 0 또는 5천원 정도

    const orderItemsData: any[] = [];

    for (let j = 0; j < orderItemCount; j++) {
      const item = rand(items);

      const quantity = randInt(1, 3);
      const basePrice =
        item.salePrice && item.salePrice > 0
          ? item.salePrice
          : item.basicPrice || 10000;

      let optionPrice = 0;
      let supplyPrice = 0;

      // 옵션 / 추가상품 랜덤 선택 (있을 때만)
      const hasOption = item.ShopItemOption.length > 0 && Math.random() < 0.7;
      const hasSupply = item.ShopItemSupply.length > 0 && Math.random() < 0.5;

      const selectedOption = hasOption ? rand(item.ShopItemOption) : null;
      const selectedSupply = hasSupply ? rand(item.ShopItemSupply) : null;

      if (selectedOption) {
        optionPrice += selectedOption.price;
      }
      if (selectedSupply) {
        supplyPrice += selectedSupply.price;
      }

      const totalPrice = (basePrice + optionPrice + supplyPrice) * quantity;

      basicPriceSum += basePrice * quantity;
      optionPriceSum += (optionPrice + supplyPrice) * quantity;

      const orderItem: any = {
        itemId: item.idx,
        itemName: item.name,
        quantity,
        salePrice: basePrice,
        optionPrice,
        supplyPrice,
        totalPrice,
        statusCode: 'payment_complete',
      };

      // 주문 옵션 (ShopOrderOption) 생성
      if (selectedOption) {
        orderItem.ShopOrderOption = {
          create: [
            {
              optionId: selectedOption.idx,
              name: selectedOption.name,
              price: selectedOption.price,
              quantity,
            },
          ],
        };
      }

      // 주문 추가상품 (ShopOrderSupply) 생성
      if (selectedSupply) {
        orderItem.ShopOrderSupply = {
          create: [
            {
              supplyId: selectedSupply.idx,
              name: selectedSupply.name,
              price: selectedSupply.price,
              quantity,
            },
          ],
        };
      }

      orderItemsData.push(orderItem);
    }

    const payPrice = basicPriceSum + optionPriceSum + deliveryPrice;

    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const ordNo =
      'T' + todayStr.replace(/-/g, '') + String(i + 1).padStart(4, '0'); // T202511140001 이런 형식
    const timestamp = Math.floor(Date.now() / 1000);

    await prisma.shopOrder.create({
      data: {
        ordNo,
        shopId: 1,
        sellerId: 1,

        // 회원 정보 세팅 (비회원 X)
        userId: user.id,
        userIdx: user.idx,

        gubun: 'normal',

        basicPrice: basicPriceSum,
        optionPrice: optionPriceSum,
        deliveryPrice,
        boxDc: 0,
        payPrice,
        stock: 1,

        memo: '테스트용 임의 주문입니다.',

        orderPaid: 'paid', // 결제됨
        orderStatus: 'order_complete', // 주문완료
        cancelStatus: '',

        paymethod: 'card',

        // 주문자 정보
        name: '홍길동',
        email: `buyer${i + 1}@example.com`,
        hp: '010-1234-5678',
        zipcode: '01234',
        jibunAddr1: '서울시 테스트구 지번로 1',
        jibunAddr2: '101동 1001호',
        roadAddr1: '서울시 테스트구 도로명로 1',
        roadAddr2: '테스트 아파트 101동 1001호',

        // 수령자 정보
        rcvStore: '온라인몰',
        rcvName: `수령자${i + 1}`,
        rcvHp: '010-9876-5432',
        rcvEmail: `rcv${i + 1}@example.com`,
        rcvDate: new Date(),
        rcvAddr1: '서울시 수령구 수령로 1',
        rcvAddr2: '수령빌라 202동 202호',
        rcvZipcode: '56789',

        // 결제 관련 정보
        bankAccount: 1,
        bankDepositName: '홍길동',
        payEmail: `pay${i + 1}@example.com`,
        payRepresent: 1,
        payDay: todayStr,
        payYear: false,
        payPeople: randInt(1, 5),

        ipAddress: '127.0.0.1',
        merchantData: null,

        // === 주문상품 / 옵션 / 추가상품 ===
        ShopOrderItem: {
          create: orderItemsData,
        },

        // === 결제 정보 ===
        ShopOrderPayment: {
          create: {
            gubun: 'shop',
            applyNum: `APPLY${i + 1}`,
            amount: payPrice,
            cancelAmount: 0,
            buyerAddr: '서울시 테스트구 결제로 1',
            buyerEmail: `buyer${i + 1}@example.com`,
            buyerName: '홍길동',
            buyerPostcode: '01234',
            buyerTel: '010-1234-5678',
            cardName: '신한카드',
            cardNumber: '1234-****-****-5678',
            cardQuota: 0,
            customData: null,
            impUid: `imp_${ordNo}`,
            merchantUid: ordNo,
            name: '테스트 결제',
            paidAmount: payPrice,
            paidAt: timestamp,
            cancelledAt: 0,
            payMethod: 'card',
            pgProvider: 'html5_inicis',
            pgTid: `TID${ordNo}`,
            pgType: 'payment',
            receiptUrl: `https://example.com/receipt/${ordNo}`,
            status: 'paid',
            orderData: null,
            device: 'pc',
            shopId: 1,
            sellerId: 1,
          },
        },
      },
    });

    console.log(
      `✅ 주문 생성 완료: ${ordNo}, userId=${user.id}, userIdx=${user.idx}`,
    );
  }

  console.log('🎉 총 10건의 테스트 주문이 생성되었습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
