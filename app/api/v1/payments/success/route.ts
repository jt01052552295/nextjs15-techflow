/**
 * 결제 성공 리다이렉트 URL
 * GET /api/v1/payments/success
 *
 * TossPay 결제창에서 결제 완료 후 리다이렉트되는 URL
 * 현재는 프론트(WebView)에서 URL 파라미터만 파싱하고, 별도로 /payments/approve API를 호출함
 * 필요시 이 URL에서 서버 사이드 승인 처리도 가능
 */
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  // 파라미터 로깅 (디버깅용)
  console.log('Payment Success Redirect:', { paymentKey, orderId, amount });

  // 옵션 1: 단순 성공 페이지 반환 (프론트에서 파라미터 파싱)
  // 현재 RN WebView에서 URL을 파싱하므로 간단한 HTML 반환
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>결제 성공</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #0064ff;
            margin-bottom: 10px;
          }
          p {
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>결제가 완료되었습니다</h1>
          <p>잠시 후 앱으로 돌아갑니다...</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });

  // 옵션 2: 서버 사이드에서 바로 승인 처리 후 리다이렉트
  // 필요 시 아래 코드 활성화
  /*
  try {
    const result = await confirmPayment(paymentKey!, orderId!, Number(amount));
    if (result.success) {
      return NextResponse.redirect(new URL('/payment/complete', request.url));
    } else {
      return NextResponse.redirect(new URL('/payment/failed', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/payment/error', request.url));
  }
  */
}
